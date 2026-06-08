import { ref, computed, onMounted, onUnmounted } from "vue";
import { useComandaStore } from "@/stores/comandaManagement";
import { useClosedComandaStore } from "@/stores/closedComandas";
import { useKitchenStore } from "@/stores/kitchen";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "@/composables/useToast";
import { useReceipt } from "@/composables/useReceipt";
import { request } from "@/services/api";
import { initCashierSocket, destroyCashierSocket } from "@/stores/cashierSocket";
import { getSocket } from "@/services/socket";
import localStorageService from "@/services/localStorageService";

export function useCashier() {
  const comandaStore = useComandaStore();
  const closedComandaStore = useClosedComandaStore();
  const kitchenStore = useKitchenStore();
  const authStore = useAuthStore();
  const { showToast } = useToast();
  const { emitReceipt } = useReceipt();

  const comandaUnitLabel = localStorageService.getComandaUnitLabel() || "Mesa";

  const selectedComanda = ref<any>(null);
  const showDetails = ref(false);

  const activeCoupon = ref<any>(null);
  const discountType = ref<string | null>(null);
  const discountValue = ref<number | null>(null);

  const BACKEND_TO_LOCAL_STATUS: Record<string, string> = {
    Aguardando_Preparo: "pending",
    Em_Preparo: "preparing",
    Pronto: "ready",
    Finalizado: "finished",
    Cancelado: "cancelled",
  };

  let pollInterval: any = null;

  onMounted(async () => {
    await comandaStore.loadComandas();
    pollInterval = setInterval(() => comandaStore.loadComandas(), 30_000);

    initCashierSocket((data: any) => {
      const localStatus = BACKEND_TO_LOCAL_STATUS[data.status] || data.status;
      const order = kitchenStore.orders.find((o: any) => o.id === data.orderId);

      if (order) {
        (order as any).status = localStatus;
      } else {
        kitchenStore.addOrder({
          id: data.orderId,
          comandaId: data.comandaId,
          status: localStatus,
        } as any);
      }

      if (data.status === "Pronto")
        showToast(`Pedido #${data.orderId} está PRONTO!`, "success");
    });

    const socket = getSocket();
    if (socket) {
      socket.on("comanda_cancelled", (data: any) => {
        comandaStore.removeComanda(data.comandaId);
        if (selectedComanda.value?.id === data.comandaId) {
          closeDetails();
          showToast("Comanda cancelada.", "warning");
        }
      });
      socket.on("order_cancelled", (data: any) => {
        const order = kitchenStore.orders.find((o: any) => o.id === data.orderId);
        if (order) (order as any).status = "cancelled";
      });
    }
  });

  onUnmounted(() => {
    destroyCashierSocket();
    clearInterval(pollInterval);
  });

  const enabledPaymentMethods = computed(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("paymentMethods") || "null") || [
          "Dinheiro", "Cartão Débito", "Cartão Crédito", "PIX",
        ]
      );
    } catch {
      return ["Dinheiro", "Cartão Débito", "Cartão Crédito", "PIX"];
    }
  });

  const ordersWithStatus = computed(() => {
    if (!selectedComanda.value) return [];
    return selectedComanda.value.orders
      .map((order: any) => {
        const kitchenOrder = kitchenStore.orders.find((o: any) => o.id === order.id);
        return {
          ...order,
          status: kitchenOrder
            ? (kitchenOrder as any).status
            : BACKEND_TO_LOCAL_STATUS[order.status] || order.status || "pending",
        };
      })
      .filter((o: any) => !['cancelled', 'Cancelado', 'CANCELADO', 'finished', 'FINALIZADO'].includes(o.status));
  });

  function openDetails(comanda: any) {
    selectedComanda.value = comanda;
    showDetails.value = true;
    
    activeCoupon.value = comanda.coupon || null;
    discountType.value = comanda.discountType || null;
    discountValue.value = comanda.discountValue || null;
  }
  
  function closeDetails() {
    showDetails.value = false;
    selectedComanda.value = null;
    activeCoupon.value = null;
    discountType.value = null;
    discountValue.value = null;
  }

  const manualCancelTargetId = ref<number | null>(null);
  const showCancelComandaModal = ref(false);
  const openManualCancel = (id: number) => { manualCancelTargetId.value = id; };
  const dismissManualCancel = () => { manualCancelTargetId.value = null; };

  const confirmManualCancel = async (reason: string) => {
    if (!reason || !reason.trim()) return;
    try {
      await request(`/commands/${selectedComanda.value.id}/orders/${manualCancelTargetId.value}/cancel`, { 
        method: "POST", body: { cancellationDescription: reason } as any 
      });
      manualCancelTargetId.value = null; 
      showToast("Cancelamento solicitado!", "success");
    } catch (error) { showToast("Erro ao cancelar.", "error"); }
  };

  const confirmCancelComanda = async (reason: string) => {
    if (!reason || !reason.trim() || !selectedComanda.value) return;

    const comandaToCancel = { ...selectedComanda.value };
    const comandaId = comandaToCancel.id;

    try {
      showCancelComandaModal.value = false;
      await request(`/commands/${comandaId}/cancel`, {
        method: "POST",
        body: { reason: reason, userId: Number(authStore.user?.id || 1) } as any,
      });

      closedComandaStore.addClosedComanda({ 
        ...comandaToCancel, 
        closedAt: new Date().toISOString(), 
        status: "CANCELADO", 
        cancelReason: reason 
      });
      
      comandaStore.removeComanda(comandaId);
      closeDetails(); 
      showToast("Comanda cancelada!", "success");
    } catch (error) { 
      showToast("Erro ao cancelar a comanda.", "error"); 
    }
  };

  const activeCheckout = ref<any>(null);
  const showRulesModal = ref(false);
  const rulesModalMessage = ref("");
  const pendingCancel = ref(false);

  const paymentFlowActive = ref(false);
  const pendingPayments = ref<any[]>([]);
  const isProcessingPayment = ref(false);

  function handleFinalizePayload(payload: any) {
    activeCheckout.value = payload;
    
    activeCoupon.value = payload.appliedCoupon || null;
    discountType.value = payload.discountType || null;
    discountValue.value = payload.discountValue || null;

    if (payload.hasPreparing) {
      rulesModalMessage.value = "Existem pedidos em preparo. Serão cobrados mesmo assim. Continuar?";
      pendingCancel.value = false; showRulesModal.value = true;
    } else if (payload.hasPending) {
      rulesModalMessage.value = "Existem pedidos aguardando. Para cancelá-los, informe o motivo.";
      pendingCancel.value = true; showRulesModal.value = true;
    } else {
      startPaymentFlow();
    }
  }

  const confirmRules = async (reason: string | null) => {
    if (pendingCancel.value && reason) {
      const pendingOrders = ordersWithStatus.value.filter((o: any) => o.status === "pending");
      try {
        for (const order of pendingOrders) {
          await request(`/commands/${selectedComanda.value.id}/orders/${order.id}/cancel`, { 
            method: "POST", body: { cancellationDescription: reason } as any 
          });
        }
      } catch (e) {
        showToast("Erro ao cancelar pedidos pendentes.", "error");
        return; 
      }
    }
    showRulesModal.value = false; 
    startPaymentFlow();
  };

  function startPaymentFlow() {
    const checkout = activeCheckout.value;
    if (!checkout) return;
    
    pendingPayments.value = checkout.paymentSplits
      .filter((m: any) => m.amount > 0)
      .map((p: any) => ({ ...p, _success: false }));
      
    paymentFlowActive.value = true; 
    showDetails.value = false;
  }
  
  function cancelPaymentFlow() { paymentFlowActive.value = false; showDetails.value = true; }

  async function finishPaymentFlow() {
    const checkout = activeCheckout.value;
    isProcessingPayment.value = true;

    try {
      const index = pendingPayments.value.findIndex((p: any) => !p._success);
      if (index === -1) return; 

      const payment = pendingPayments.value[index];
      const isLast = index === pendingPayments.value.length - 1;

      await request(`/commands/${selectedComanda.value.id}/payment`, {
        method: "POST",
        body: {
          payment: { type: payment.type, amount: Number(payment.amount) },
          selectedOrderIds: checkout.selectedOrderIds ? checkout.selectedOrderIds.map(Number) : [],
          isLastPayment: isLast,
          discountType: discountType.value,
          discountValue: discountValue.value,
          couponId: activeCoupon.value?.id || null
        } as any,
      });

      await comandaStore.loadComandas();
      pendingPayments.value[index]._success = true;

      if (isLast) {
        paymentFlowActive.value = false;
        closeDetails();
        showToast("Comanda paga com sucesso!", "success");
      } else {
        showToast(`Pagamento ${index + 1} aprovado! Aguardando o próximo.`, "success");
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || "Erro no pagamento.", "error");
    } finally {
      isProcessingPayment.value = false;
    }
  }

  return {
    comandaUnitLabel, comandaStore, kitchenStore, enabledPaymentMethods,
    selectedComanda, showDetails, openDetails, closeDetails, ordersWithStatus,
    manualCancelTargetId, showCancelComandaModal, openManualCancel, dismissManualCancel, 
    confirmManualCancel, confirmCancelComanda, showRulesModal, pendingCancel, 
    rulesModalMessage, confirmRules, paymentFlowActive, pendingPayments, 
    isProcessingPayment, cancelPaymentFlow, finishPaymentFlow, handleFinalizePayload,
    activeCoupon, discountType, discountValue
  };
}