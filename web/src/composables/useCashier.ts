import { ref, computed, onMounted, onUnmounted } from "vue";
import { useComandaStore } from "@/stores/comandaManagement";
import { useClosedComandaStore } from "@/stores/closedComandas";
import { useKitchenStore } from "@/stores/kitchen";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "@/composables/useToast";
import { useCouponStore } from "@/stores/coupons";
import { comandaApi } from "@/services/comandaApi";
import { orderApi } from "@/services/orderApi";
import { establishmentApi } from "@/services/establishmentApi";
import { connectSocket, getSocket, disconnectSocket } from "@/services/socket";
import localStorageService from "@/services/localStorageService";

const BACKEND_TO_LOCAL_STATUS: Record<string, string> = {
  Aguardando_Preparo: "pending",
  Em_Preparo: "preparing",
  Pronto: "ready",
  Finalizado: "finished",
  Cancelado: "cancelled",
};

export function useCashier() {
  const comandaStore = useComandaStore();
  const closedComandaStore = useClosedComandaStore();
  const kitchenStore = useKitchenStore();
  const authStore = useAuthStore();
  const couponStore = useCouponStore();
  const { showToast } = useToast();

  const comandaUnitLabel = localStorageService.getComandaUnitLabel() || "Mesa";

  const enabledPaymentMethods = ref<string[]>(["Dinheiro", "Crédito", "Débito", "Pix"]);

  const selectedComanda = ref<any>(null);
  const showDetails = ref(false);

  const activeCoupon = ref<any>(null);
  const discountType = ref<string | null>(null);
  const discountValue = ref<number | null>(null);

  const pendingCancelIds = new Set<number>();
  const manualCancelTargetId = ref<number | null>(null);
  const showCancelComandaModal = ref(false);

  let pollInterval: ReturnType<typeof setInterval> | null = null;
  let reconnectHandler: (() => void) | null = null;

  onMounted(async () => {
    await Promise.all([
      comandaStore.loadComandas(),
      couponStore.loadData(),
      establishmentApi.getProfile().then((data) => {
        if (data?.paymentMethods?.length > 0)
          enabledPaymentMethods.value = data.paymentMethods;
      }).catch((e: any) => {
        if (e?.status === 402) showToast('Assinatura expirada ou inválida.', 'error');
      }),
    ]);
    pollInterval = setInterval(() => comandaStore.loadComandas(), 30_000);

    connectSocket('cashier');
    const socket = getSocket();

    reconnectHandler = () => comandaStore.loadComandas();
    socket?.io.on('reconnect', reconnectHandler);

    socket?.on('order_status_updated', (data: any) => {
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

      if (localStatus === "ready") {
        const comanda = comandaStore.comandas.find((c: any) => c.id === data.comandaId);
        const label = comanda?.label ? `${comandaUnitLabel} ${comanda.label}` : comandaUnitLabel;
        showToast(`Pedido de ${label} está PRONTO!`, "success");
      }
    });

    if (socket) {
      socket.on("comanda_cancelled", (data: any) => {
        comandaStore.removeComanda(data.comandaId);
        if (!pendingCancelIds.has(data.comandaId) && selectedComanda.value?.id === data.comandaId) {
          closeDetails();
          showToast("Comanda cancelada.", "warning");
        }
      });
      socket.on("order_cancelled", (data: any) => {
        const order = kitchenStore.orders.find(
          (o: any) => o.id === data.orderId,
        );
        if (order) (order as any).status = "cancelled";
      });
    }
  });

  onUnmounted(() => {
    const socket = getSocket();
    if (socket) {
      socket.off('order_status_updated');
      socket.off('comanda_cancelled');
      socket.off('order_cancelled');
      if (reconnectHandler) {
        socket.io.off('reconnect', reconnectHandler);
        reconnectHandler = null;
      }
    }
    disconnectSocket();
    if (pollInterval) clearInterval(pollInterval);
  });

  const ordersWithStatus = computed(() => {
    if (!selectedComanda.value) return [];
    return selectedComanda.value.orders
      .map((order: any) => {
        const kitchenOrder = kitchenStore.orders.find(
          (o: any) => o.id === order.id,
        );
        const rawStatus = typeof order.status === 'object' && order.status !== null
          ? (order.status as any).nome
          : order.status;
        return {
          ...order,
          status: kitchenOrder
            ? (kitchenOrder as any).status
            : BACKEND_TO_LOCAL_STATUS[rawStatus] || rawStatus || "pending",
        };
      })
      .filter(
        (o: any) =>
          !["cancelled", "finished"].includes(o.status) &&
          ((o.items?.length > 0) || (o.productOrders?.length > 0) || Number(o.price) > 0),
      );
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

  const openManualCancel = (id: number) => {
    manualCancelTargetId.value = id;
  };
  const dismissManualCancel = () => {
    manualCancelTargetId.value = null;
  };

  const confirmManualCancel = async (reason: string) => {
    if (!reason || !reason.trim()) return;
    try {
      await orderApi.cancelOrder(
        selectedComanda.value.id,
        manualCancelTargetId.value!,
        reason,
      );
      manualCancelTargetId.value = null;
      showToast("Cancelamento solicitado!", "success");
    } catch (error) {
      showToast("Erro ao cancelar.", "error");
    }
  };

  const confirmCancelComanda = async (reason: string) => {
    if (!reason || !reason.trim() || !selectedComanda.value) return;

    const comandaToCancel = { ...selectedComanda.value };
    const comandaId = comandaToCancel.id;

    pendingCancelIds.add(comandaId);
    try {
      showCancelComandaModal.value = false;
      await comandaApi.cancel(comandaId, reason, authStore.user!.id);

      closedComandaStore.addClosedComanda({
        ...comandaToCancel,
        closedAt: new Date().toISOString(),
        status: "CANCELADO",
        cancelReason: reason,
      });

      comandaStore.removeComanda(comandaId);
      closeDetails();
      showToast("Comanda cancelada!", "success");
    } catch (error) {
      showToast("Erro ao cancelar a comanda.", "error");
    } finally {
      pendingCancelIds.delete(comandaId);
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
      rulesModalMessage.value =
        "Existem pedidos em preparo. Serão cobrados mesmo assim. Continuar?";
      pendingCancel.value = false;
      showRulesModal.value = true;
    } else if (payload.hasPending) {
      rulesModalMessage.value =
        "Existem pedidos aguardando. Para cancelá-los, informe o motivo.";
      pendingCancel.value = true;
      showRulesModal.value = true;
    } else {
      startPaymentFlow();
    }
  }

  const confirmRules = async (reason: string | null) => {
    if (pendingCancel.value && reason) {
      const pendingOrders = ordersWithStatus.value.filter(
        (o: any) => o.status === "pending",
      );
      try {
        for (const order of pendingOrders) {
          await orderApi.cancelOrder(
            selectedComanda.value.id,
            order.id,
            reason,
          );
        }
      } catch (e) {
        showToast("Erro ao cancelar pedidos pendentes.", "error");
        return;
      }

      const cancelledIds = new Set(pendingOrders.map((o: any) => o.id));
      const remainingIds = (activeCheckout.value.selectedOrderIds as number[]).filter(
        (id) => !cancelledIds.has(id),
      );
      if (remainingIds.length === 0) {
        showRulesModal.value = false;
        closeDetails();
        showToast("Todos os pedidos foram cancelados.", "info");
        return;
      }
      activeCheckout.value = { ...activeCheckout.value, selectedOrderIds: remainingIds };
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

  function cancelPaymentFlow() {
    paymentFlowActive.value = false;
    showDetails.value = true;
  }

  async function finishPaymentFlow() {
    const checkout = activeCheckout.value;
    isProcessingPayment.value = true;

    try {
      const index = pendingPayments.value.findIndex((p: any) => !p._success);
      if (index === -1) return;

      const payment = pendingPayments.value[index];
      const isLast = index === pendingPayments.value.length - 1;

      await comandaApi.pay(selectedComanda.value.id, {
        payment: { type: payment.type, amount: Number(payment.amount) },
        selectedOrderIds: checkout.selectedOrderIds
          ? checkout.selectedOrderIds.map(Number)
          : [],
        isLastPayment: isLast,
        discountType: discountType.value,
        discountValue: discountValue.value,
        couponId: activeCoupon.value?.id || null,
      });

      await comandaStore.loadComandas();
      pendingPayments.value[index]._success = true;

      if (isLast) {
        paymentFlowActive.value = false;
        closeDetails();
        showToast("Comanda paga com sucesso!", "success");
      } else {
        showToast(
          `Pagamento ${index + 1} aprovado! Aguardando o próximo.`,
          "success",
        );
      }
    } catch (error: any) {
      showToast(error.data?.message || error.message || "Erro no pagamento.", "error");
    } finally {
      isProcessingPayment.value = false;
    }
  }

  return {
    comandaUnitLabel,
    comandaStore,
    kitchenStore,
    enabledPaymentMethods,
    selectedComanda,
    showDetails,
    openDetails,
    closeDetails,
    ordersWithStatus,
    manualCancelTargetId,
    showCancelComandaModal,
    openManualCancel,
    dismissManualCancel,
    confirmManualCancel,
    confirmCancelComanda,
    showRulesModal,
    pendingCancel,
    rulesModalMessage,
    confirmRules,
    paymentFlowActive,
    pendingPayments,
    isProcessingPayment,
    cancelPaymentFlow,
    finishPaymentFlow,
    handleFinalizePayload,
    activeCoupon,
    discountType,
    discountValue,
  };
}
