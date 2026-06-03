<template>
  <SubscriptionGuard featureName="O Caixa">
    <div class="h-screen bg-page flex flex-col font-inter overflow-hidden">
      <header
        class="h-16 md:h-20 bg-white border-b border-[#E0E0E0] flex items-center justify-between px-6 md:px-8 shadow-sm z-20 shrink-0"
      >
        <div class="flex items-center gap-4">
          <div class="bg-accent p-2 rounded text-white shadow-sm">
            <Monitor :size="20" class="md:w-6 md:h-6" />
          </div>
          <div>
            <h1
              class="text-[#212121] font-black text-lg tracking-tight leading-none uppercase"
            >
              Caixa de Operações
            </h1>
            <p
              class="text-[#757575] text-[10px] uppercase font-black tracking-widest mt-1"
            >
              Terminal de Liquidação
            </p>
          </div>
        </div>
      </header>

      <main class="flex-grow flex flex-col p-4 md:p-8 overflow-hidden bg-page">
        <section
          class="flex-1 flex flex-col min-w-0 bg-white rounded border border-[#E0E0E0] overflow-hidden"
        >
          <header
            class="p-6 md:px-8 flex justify-between items-center bg-gray-50 z-10 border-b border-[#E0E0E0]"
          >
            <div class="flex items-center gap-3">
              <div class="w-2 h-6 bg-blue-500 rounded"></div>
              <h2
                class="font-black text-[#212121] text-base md:text-lg uppercase tracking-widest"
              >
                {{ comandaUnitLabel }}s Ativas
              </h2>
            </div>
            <span
              class="bg-blue-500 text-white font-black px-4 py-1 rounded text-xs shadow-lg border border-blue-400/30"
            >
              {{ comandaStore.comandas.length }}
            </span>
          </header>

          <div class="flex-grow p-6 md:p-8 overflow-y-auto custom-scrollbar">
            <div
              v-if="comandaStore.comandas.length === 0"
              class="flex flex-col items-center justify-center h-full text-[#757575] opacity-40 min-h-[200px]"
            >
              <FileText :size="48" class="mb-4" />
              <p class="font-black uppercase tracking-widest text-sm">
                Nenhuma {{ comandaUnitLabel.toLowerCase() }} ativa
              </p>
            </div>
            <div
              v-else
              class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              <div
                v-for="comanda in comandaStore.comandas"
                :key="comanda.id"
                class="bg-gray-50 rounded border border-[#E0E0E0] p-6 cursor-pointer hover:border-blue-500/50 hover:bg-gray-50 transition-all group"
                @click="openDetails(comanda)"
              >
                <div class="flex justify-between items-start mb-4">
                  <div>
                    <span
                      class="text-[10px] font-black uppercase tracking-widest block mb-1"
                      :class="
                        comanda.isAutoatendimento
                          ? 'text-blue-500'
                          : 'text-[#757575]'
                      "
                      >{{ getComandaTypeLabel(comanda) }}</span
                    >
                    <span
                      class="font-black text-[#212121] text-xl tracking-tighter group-hover:text-blue-400 transition-colors"
                      >{{ getComandaMainLabel(comanda) }}</span
                    >
                  </div>
                  <span class="text-accent font-black text-lg tracking-tighter"
                    >R$ {{ comanda.total.toFixed(2) }}</span
                  >
                </div>
                <div
                  class="flex items-center gap-2 text-[10px] font-bold text-[#757575] uppercase tracking-wider bg-page/40 p-3 rounded border border-[#E0E0E0]"
                >
                  <Receipt :size="14" class="text-blue-500" />
                  {{ getActiveOrdersCount(comanda) }} pedidos vinculados
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <CheckoutModal
        :isOpen="showDetails"
        :comanda="selectedComanda"
        :ordersWithStatus="ordersWithStatus"
        :enabledPaymentMethods="enabledPaymentMethods"
        :comandaUnitLabel="comandaUnitLabel"
        @close="closeDetails"
        @cancel-comanda="showCancelComandaModal = true"
        @cancel-order="openManualCancel"
        @print-receipt="handlePrintReceipt"
        @finalize="handleFinalizePayload"
      />

      <CancelItem
        :isOpen="manualCancelTargetId !== null"
        :title="`Cancelar Pedido #${manualCancelTargetId}`"
        description="Informe o motivo do cancelamento. Esse pedido será removido da fila da cozinha."
        :reasons="[
          'Demora no preparo',
          'Pedido errado / Erro do Garçom',
          'Desistência / Cliente foi embora',
        ]"
        @close="dismissManualCancel"
        @confirm="confirmManualCancel"
      />

      <CancelItem
        :isOpen="showCancelComandaModal"
        title="Cancelar Comanda Completa"
        description="Esta ação removerá a comanda do caixa e cancelará todos os pedidos na cozinha."
        :reasons="[
          'Cliente desistiu de tudo',
          'Erro no lançamento da comanda',
          'Comanda duplicada',
          'Outros',
        ]"
        @close="showCancelComandaModal = false"
        @confirm="confirmCancelComanda"
      />

      <Teleport to="body">
        <div
          v-if="showRulesModal"
          class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          style="z-index: 99999"
        >
          <div
            class="bg-white border border-[#E0E0E0] rounded p-8 w-full max-w-md shadow-2xl"
          >
            <div class="flex items-start gap-4 mb-6">
              <div
                class="p-3 rounded-full border shrink-0"
                :class="
                  pendingCancel
                    ? 'bg-danger-light border-danger'
                    : 'bg-yellow-500/10 border-yellow-500/20'
                "
              >
                <AlertTriangle
                  :size="24"
                  :class="pendingCancel ? 'text-danger' : 'text-yellow-500'"
                />
              </div>
              <div>
                <p class="text-[#212121] font-bold text-sm leading-relaxed">
                  {{ rulesModalMessage }}
                </p>
              </div>
            </div>
            <div v-if="pendingCancel" class="mb-6">
              <label
                class="block text-[10px] font-black text-[#757575] uppercase tracking-widest mb-2"
                >Motivo do Cancelamento
                <span class="text-danger">*</span></label
              >
              <select
                v-model="cancelReason"
                class="w-full bg-gray-50 border border-[#E0E0E0] rounded px-4 py-3 text-sm text-[#212121] outline-none focus:border-danger transition-all cursor-pointer"
              >
                <option value="" disabled>Selecione o motivo...</option>
                <option value="Demora no preparo">Demora no preparo</option>
                <option value="Pedido errado / Erro do Garçom">
                  Pedido errado / Erro do Garçom
                </option>
                <option value="Desistência / Cliente foi embora">
                  Desistência / Cliente foi embora
                </option>
              </select>
            </div>
            <div class="flex gap-3">
              <button
                @click="confirmRules(false)"
                class="flex-1 px-6 py-3 bg-white border border-[#E0E0E0] text-[#757575] font-black uppercase tracking-widest text-xs rounded hover:bg-gray-100 transition-all"
              >
                Voltar
              </button>
              <button
                @click="confirmRules(true)"
                :disabled="pendingCancel && !cancelReason.trim()"
                class="flex-1 px-6 py-3 font-black uppercase tracking-widest text-xs rounded transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                :class="
                  pendingCancel
                    ? 'bg-danger text-white hover:bg-red-400'
                    : 'bg-primary text-white hover:bg-primary-dark'
                "
              >
                {{ pendingCancel ? "Cancelar Pedidos" : "Confirmar" }}
              </button>
            </div>
          </div>
        </div>
      </Teleport>

      <Teleport to="body">
        <div
          v-if="paymentFlowActive"
          class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          style="z-index: 99999"
        >
          <div
            class="bg-white border border-[#E0E0E0] rounded w-full max-w-lg shadow-2xl overflow-hidden"
          >
            <div class="p-8 border-b border-[#E0E0E0] bg-gray-50">
              <div class="flex items-center justify-between mb-2">
                <span
                  class="text-[10px] font-black text-[#757575] uppercase tracking-widest"
                  >Pagamento {{ currentPaymentIndex + 1 }} de
                  {{ pendingPayments.length }}</span
                >
                <div class="flex gap-1">
                  <div
                    v-for="i in pendingPayments.length"
                    :key="i"
                    class="w-8 h-1.5 rounded transition-all"
                    :class="
                      i - 1 <= currentPaymentIndex ? 'bg-accent' : 'bg-gray-100'
                    "
                  ></div>
                </div>
              </div>
              <h2 class="text-2xl font-black text-[#212121]">
                {{ pendingPayments[currentPaymentIndex]?.type }}
              </h2>
              <p class="text-accent font-black text-3xl mt-1">
                R$
                {{
                  (pendingPayments[currentPaymentIndex]?.amount || 0).toFixed(2)
                }}
              </p>
            </div>
            <div class="p-8">
              <template
                v-if="pendingPayments[currentPaymentIndex]?.type === 'Dinheiro'"
              >
                <div class="space-y-4">
                  <div class="space-y-1.5">
                    <label
                      class="text-xs font-black uppercase tracking-widest text-[#757575] ml-1"
                      >Valor Recebido</label
                    >
                    <input
                      type="number"
                      v-model.number="cashReceivedForCurrent"
                      min="0"
                      step="0.01"
                      class="w-full py-4 px-4 rounded border bg-gray-50 border-[#E0E0E0] text-[#212121] text-xl font-black text-right focus:border-primary/50 focus:outline-none transition-all"
                      @input="updateChangeBreakdown"
                    />
                  </div>
                  <div
                    v-if="
                      cashReceivedForCurrent >=
                      (pendingPayments[currentPaymentIndex]?.amount || 0)
                    "
                    class="p-6 bg-accent-light border border-accent/30 rounded"
                  >
                    <div class="flex justify-between items-center mb-3">
                      <span
                        class="text-xs font-black text-[#757575] uppercase tracking-widest"
                        >Troco</span
                      >
                      <span class="text-2xl font-black text-accent"
                        >R$
                        {{
                          (
                            cashReceivedForCurrent -
                            (pendingPayments[currentPaymentIndex]?.amount || 0)
                          ).toFixed(2)
                        }}</span
                      >
                    </div>
                    <div
                      v-if="changeBreakdownList.length > 0"
                      class="space-y-1.5"
                    >
                      <p
                        class="text-[10px] font-black text-[#757575] uppercase tracking-widest mb-2"
                      >
                        Detalhamento:
                      </p>
                      <div
                        v-for="item in changeBreakdownList"
                        :key="item.label"
                        class="flex justify-between text-xs font-bold text-[#212121]"
                      >
                        <span class="text-[#757575]">{{ item.label }}</span
                        ><span>× {{ item.count }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="mt-8 flex gap-3">
                  <button
                    @click="cancelPaymentFlow"
                    class="flex-1 py-3 bg-white border border-[#E0E0E0] text-[#757575] font-black uppercase text-xs rounded hover:bg-gray-50 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    @click="confirmCashPayment"
                    :disabled="
                      cashReceivedForCurrent <
                      (pendingPayments[currentPaymentIndex]?.amount || 0)
                    "
                    class="flex-1 py-3 bg-primary text-white font-black uppercase text-xs rounded hover:bg-primary-dark transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Confirmar
                  </button>
                </div>
              </template>
              <template v-else>
                <div
                  class="p-6 bg-gray-50 border border-[#E0E0E0] rounded text-center mb-8"
                >
                  <p class="text-[#757575] font-bold text-sm mb-2">
                    Confirmar recebimento via
                  </p>
                  <p class="text-[#212121] font-black text-xl">
                    {{ pendingPayments[currentPaymentIndex]?.type }}
                  </p>
                  <p class="text-accent font-black text-3xl mt-2">
                    R$
                    {{
                      (
                        pendingPayments[currentPaymentIndex]?.amount || 0
                      ).toFixed(2)
                    }}
                  </p>
                </div>
                <div class="flex gap-3">
                  <button
                    @click="cancelPaymentFlow"
                    class="flex-1 py-3 bg-white border border-[#E0E0E0] text-[#757575] font-black uppercase text-xs rounded hover:bg-gray-50 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    @click="confirmNonCashPayment"
                    class="flex-1 py-3 bg-primary text-white font-black uppercase text-xs rounded hover:bg-primary-dark transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle :size="16" /> Recebido
                  </button>
                </div>
              </template>
            </div>
          </div>
        </div>
      </Teleport>

      <Teleport to="body">
        <div
          v-if="showReceiptModal"
          class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[99999]"
        >
          <div
            class="bg-white border border-[#E0E0E0] rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
          >
            <div class="p-8 flex flex-col items-center gap-4">
              <div
                class="p-4 bg-accent-light rounded-full border border-accent/20"
              >
                <Printer :size="32" class="text-accent" />
              </div>
              <h2
                class="text-xl font-black text-[#212121] uppercase tracking-tight text-center"
              >
                Deseja imprimir o cupom fiscal?
              </h2>
              <p
                class="text-[#757575] text-xs text-center font-bold uppercase tracking-widest"
              >
                Um comprovante será aberto para impressão
              </p>
            </div>
            <div class="flex border-t border-[#E0E0E0]">
              <button
                @click="showReceiptModal = false"
                class="flex-1 py-4 text-[#757575] font-black uppercase tracking-widest text-xs hover:bg-gray-50 transition-all border-r border-[#E0E0E0]"
              >
                Não
              </button>
              <button
                @click="
                  () => {
                    emitReceipt(
                      pendingReceiptData.comanda,
                      pendingReceiptData.paymentInfo,
                    );
                    showReceiptModal = false;
                  }
                "
                class="flex-1 py-4 text-primary font-black uppercase tracking-widest text-xs hover:bg-accent-light transition-all flex items-center justify-center gap-2"
              >
                <Printer :size="16" /> Imprimir
              </button>
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  </SubscriptionGuard>
</template>

<script setup>
import SubscriptionGuard from "@/components/SubscriptionGuard.vue";
import CancelItem from "@/components/order/CancelItem.vue";
import CheckoutModal from "@/components/cashier/CheckoutModal.vue";
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useComandaStore } from "@/stores/comandaManagement";
import { useClosedComandaStore } from "@/stores/closedComandas";
import { useKitchenStore } from "@/stores/kitchen";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "@/composables/useToast";
import { request } from "@/services/api";
import {
  Monitor,
  Receipt,
  FileText,
  CheckCircle,
  AlertTriangle,
  Printer,
} from "lucide-vue-next";
import {
  initCashierSocket,
  destroyCashierSocket,
} from "@/stores/cashierSocket";
import { getSocket } from "@/services/socket";
import localStorageService from "@/services/localStorageService";

const comandaStore = useComandaStore();
const closedComandaStore = useClosedComandaStore();
const kitchenStore = useKitchenStore();
const authStore = useAuthStore();
const { showToast } = useToast();

const comandaUnitLabel = localStorageService.getComandaUnitLabel();
const selectedComanda = ref(null);
const showDetails = ref(false);

const BACKEND_TO_LOCAL_STATUS = {
  Aguardando_Preparo: "pending",
  Em_Preparo: "preparing",
  Pronto: "ready",
  Finalizado: "finished",
  Cancelado: "cancelled",
};

let pollInterval = null;

onMounted(async () => {
  await comandaStore.loadComandas();
  pollInterval = setInterval(() => comandaStore.loadComandas(), 30_000);

  initCashierSocket((data) => {
    const localStatus = BACKEND_TO_LOCAL_STATUS[data.status] || data.status;
    const order = kitchenStore.orders.find((o) => o.id === data.orderId);
    if (order) order.status = localStatus;
    else
      kitchenStore.addOrder({
        id: data.orderId,
        comandaId: data.comandaId,
        status: localStatus,
      });

    if (data.status === "Pronto")
      showToast(`Pedido #${data.orderId} está PRONTO!`, "success");
  });

  const socket = getSocket();
  if (socket) {
    socket.on("comanda_cancelled", (data) => {
      comandaStore.removeComanda(data.comandaId);
      if (selectedComanda.value?.id === data.comandaId) {
        closeDetails();
        showToast("Comanda cancelada por falta de pedidos ativos.", "warning");
      }
    });
    socket.on("order_cancelled", (data) => {
      const order = kitchenStore.orders.find((o) => o.id === data.orderId);
      if (order) order.status = "cancelled";
    });
  }
});

onUnmounted(() => {
  destroyCashierSocket();
  clearInterval(pollInterval);
});

const enabledPaymentMethods = computed(() => {
  try {
    return localStorage.getItem("paymentMethods")
      ? JSON.parse(localStorage.getItem("paymentMethods"))
      : ["Dinheiro", "Cartão Débito", "Cartão Crédito", "PIX"];
  } catch {
    return ["Dinheiro", "Cartão Débito", "Cartão Crédito", "PIX"];
  }
});

const denominations = [
  { label: "R$ 200", value: 200 },
  { label: "R$ 100", value: 100 },
  { label: "R$ 50", value: 50 },
  { label: "R$ 20", value: 20 },
  { label: "R$ 10", value: 10 },
  { label: "R$ 5", value: 5 },
  { label: "R$ 2", value: 2 },
  { label: "R$ 1", value: 1 },
  { label: "R$ 0,50", value: 0.5 },
  { label: "R$ 0,25", value: 0.25 },
  { label: "R$ 0,10", value: 0.1 },
  { label: "R$ 0,05", value: 0.05 },
];

function getComandaTypeLabel(comanda) {
  return comanda.isAutoatendimento ? "Autoatendimento" : comandaUnitLabel;
}
function getComandaMainLabel(comanda) {
  return comanda.isAutoatendimento && comanda.customerName
    ? comanda.customerName
    : comanda.label;
}

function getActiveOrdersCount(comanda) {
  if (!comanda.orders) return 0;
  return comanda.orders.filter((o) => {
    const kitchenOrder = kitchenStore.orders.find((ko) => ko.id === o.id);
    const status = kitchenOrder
      ? kitchenOrder.status
      : BACKEND_TO_LOCAL_STATUS[o.status] || o.status;
    return (
      status !== "cancelled" && status !== "Cancelado" && status !== "CANCELADO" &&
      status !== "finished" && status !== "FINALIZADO"
    );
  }).length;
}

const ordersWithStatus = computed(() => {
  if (!selectedComanda.value) return [];
  return selectedComanda.value.orders
    .map((order) => {
      const kitchenOrder = kitchenStore.orders.find((o) => o.id === order.id);
      const backendMapped =
        BACKEND_TO_LOCAL_STATUS[order.status] || order.status || "pending";
      return {
        ...order,
        status: kitchenOrder ? kitchenOrder.status : backendMapped,
      };
    })
    .filter((o) => 
      o.status !== "cancelled" && 
      o.status !== "Cancelado" && 
      o.status !== "CANCELADO" &&
      o.status !== "finished" && 
      o.status !== "FINALIZADO"
    );
});

function openDetails(comanda) {
  selectedComanda.value = comanda;
  showDetails.value = true;
}
function closeDetails() {
  showDetails.value = false;
  selectedComanda.value = null;
}

const manualCancelTargetId = ref(null);
const showCancelComandaModal = ref(false);

const openManualCancel = (id) => {
  manualCancelTargetId.value = id;
};
const dismissManualCancel = () => {
  manualCancelTargetId.value = null;
};

const confirmManualCancel = async (reason) => {
  if (!reason || !reason.trim()) return;
  try {
    await request(
      `/commands/${selectedComanda.value.id}/orders/${manualCancelTargetId.value}/cancel`,
      { method: "POST", body: { cancellationDescription: reason } },
    );
    manualCancelTargetId.value = null;
    showToast("Cancelamento solicitado!", "success");
  } catch (error) {
    showToast("Erro ao cancelar o pedido.", "error");
  }
};

const confirmCancelComanda = async (reason) => {
  if (!reason || !reason.trim()) return;
  try {
    const currentUserId = authStore.usuario?.id || authStore.user?.id || 1;
    await request(`/commands/${selectedComanda.value.id}/cancel`, {
      method: "POST",
      body: { reason: reason, userId: Number(currentUserId) },
    });

    const activeOrders = ordersWithStatus.value.filter(
      (o) => o.status !== "cancelled" && o.status !== "finished",
    );
    for (const order of activeOrders) {
      await kitchenStore.finishOrder(order.id, reason);
    }

    const closedComanda = {
      ...selectedComanda.value,
      closedAt: new Date().toISOString(),
      status: "CANCELADO",
      cancelReason: reason,
      paymentDetails: null,
    };
    closedComandaStore.addClosedComanda(closedComanda);
    comandaStore.removeComanda(selectedComanda.value.id);
    showCancelComandaModal.value = false;
    closeDetails();
    showToast(`${comandaUnitLabel} cancelada!`, "success");
  } catch (error) {
    showToast("Erro ao cancelar a comanda.", "error");
  }
};

const activeCheckout = ref(null);
const showRulesModal = ref(false);
const rulesModalMessage = ref("");
const pendingCancel = ref(false);
const cancelReason = ref("");

const paymentFlowActive = ref(false);
const pendingPayments = ref([]);
const currentPaymentIndex = ref(0);
const cashReceivedForCurrent = ref(0);
const currentChangeBreakdown = ref({});

function handleFinalizePayload(payload) {
  activeCheckout.value = payload;
  if (payload.hasPreparing) {
    rulesModalMessage.value =
      "Existem pedidos em preparo. Eles serão cobrados mesmo assim. Deseja continuar?";
    pendingCancel.value = false;
    cancelReason.value = "";
    showRulesModal.value = true;
  } else if (payload.hasPending) {
    rulesModalMessage.value =
      "Existem pedidos aguardando preparo na cozinha. Para cancelá-los, informe o motivo abaixo.";
    pendingCancel.value = true;
    cancelReason.value = "";
    showRulesModal.value = true;
  } else {
    startPaymentFlow();
  }
}

function confirmRules(confirm) {
  if (!confirm) {
    showRulesModal.value = false;
    return;
  }
  if (pendingCancel.value) {
    if (!cancelReason.value.trim()) return;
    const pendingOrders = ordersWithStatus.value.filter(
      (o) => o.status === "pending",
    );
    pendingOrders.forEach((order) => {
      request(
        `/commands/${selectedComanda.value.id}/orders/${order.id}/cancel`,
        {
          method: "POST",
          body: { cancellationDescription: cancelReason.value },
        },
      );
    });
  }
  showRulesModal.value = false;
  startPaymentFlow();
}

function startPaymentFlow() {
  const checkout = activeCheckout.value;
  if (!checkout) return;
  pendingPayments.value = checkout.paymentSplits.filter((m) => m.amount > 0);
  currentPaymentIndex.value = 0;
  cashReceivedForCurrent.value = 0;
  if (pendingPayments.value.length === 0 && checkout.totalWithDiscount === 0) {
    finishPaymentFlow();
    return;
  }
  paymentFlowActive.value = true;
  showDetails.value = false;
  processCurrentPayment();
}

function processCurrentPayment() {
  const current = pendingPayments.value[currentPaymentIndex.value];
  if (current.type === "Dinheiro") {
    cashReceivedForCurrent.value = current.amount;
    updateChangeBreakdown();
  }
}

function updateChangeBreakdown() {
  const current = pendingPayments.value[currentPaymentIndex.value];
  const received = cashReceivedForCurrent.value;
  if (received >= current.amount) {
    const change = received - current.amount;
    const breakdown = {};
    let remainingCents = Math.round(change * 100);
    for (const denom of denominations) {
      const denomCents = Math.round(denom.value * 100);
      if (remainingCents >= denomCents) {
        const count = Math.floor(remainingCents / denomCents);
        breakdown[denom.label] = count;
        remainingCents -= count * denomCents;
      }
    }
    currentChangeBreakdown.value = breakdown;
  } else {
    currentChangeBreakdown.value = {};
  }
}

const changeBreakdownList = computed(() =>
  Object.entries(currentChangeBreakdown.value).map(([label, count]) => ({
    label,
    count,
  })),
);

function confirmNonCashPayment() {
  nextPayment();
}

function confirmCashPayment() {
  const current = pendingPayments.value[currentPaymentIndex.value];
  if (cashReceivedForCurrent.value < current.amount) {
    showToast("Valor recebido insuficiente.", "error");
    return;
  }
  nextPayment();
}

function nextPayment() {
  if (currentPaymentIndex.value < pendingPayments.value.length - 1) {
    currentPaymentIndex.value++;
    processCurrentPayment();
  } else {
    finishPaymentFlow();
  }
}

function cancelPaymentFlow() {
  paymentFlowActive.value = false;
  showDetails.value = true;
}

async function finishPaymentFlow() {
  const checkout = activeCheckout.value;
  try {
    const res = await request(`/commands/${selectedComanda.value.id}/checkout`, {
      method: "POST",
      body: {
        payments: pendingPayments.value.map((p) => ({
          type: p.type,
          amount: p.amount,
        })),
        totalValue: checkout.totalWithDiscount,
        change:
          cashReceivedForCurrent.value > (pendingPayments.value[0]?.amount || 0)
            ? cashReceivedForCurrent.value - pendingPayments.value[0].amount
            : 0,
        discountType: checkout.discountType,
        discountValue: checkout.discountValue,
        paymentMode: checkout.paymentMode,
        selectedOrderIds: checkout.selectedOrderIds,
      },
    });
    
    paymentFlowActive.value = false;

    const isComandaClosed = res.comanda?.status === 'FECHADA' || res.comanda?.status === 'FINALIZADO' || !checkout.paymentMode || checkout.paymentMode === 'total';

    if (isComandaClosed) {
      const closedComanda = {
        ...selectedComanda.value,
        closedAt: new Date().toISOString(),
        status: "FINALIZADO",
        paymentDetails: {
          discountType: checkout.discountType,
          discountValue: checkout.discountValue,
          coupon: checkout.appliedCoupon ? checkout.appliedCoupon.code : null,
          couponDiscount: checkout.couponDiscount,
          payments: pendingPayments.value,
        },
      };
      closedComandaStore.addClosedComanda(closedComanda);
      comandaStore.removeComanda(selectedComanda.value.id);
    } else {
      await comandaStore.loadComandas();
    }

    if (checkout.totalWithDiscount > 0) {
      pendingReceiptData.value = {
        comanda: { ...selectedComanda.value },
        paymentInfo: {
          totalFinal: checkout.totalWithDiscount,
          coupon: checkout.appliedCoupon ? checkout.appliedCoupon.code : null,
          couponDiscount: checkout.couponDiscount,
          manualDiscount:
            checkout.discountType === "percent"
              ? checkout.subtotal * (checkout.discountValue / 100)
              : checkout.discountValue,
          payments: pendingPayments.value,
        },
      };
      showReceiptModal.value = true;
    }
    
    closeDetails();
    showToast(
      isComandaClosed ? "Comanda Finalizada!" : "Pedidos pagos com sucesso!",
      "success",
    );
  } catch (error) {
    showToast("Erro no pagamento.", "error");
  }
}

const showReceiptModal = ref(false);
const pendingReceiptData = ref(null);

function getGroupedOrderItems(order) {
  const items = order.items || order.productOrders || [];
  const groups = [];
  items.forEach((i) => {
    const variationName = i.variations?.[0]?.productVariation?.name || "";
    const baseName = i.name || i.product?.name || "Item";
    const fullName = baseName + (variationName ? ` (${variationName})` : "");
    const amount = Number(i.amount || i.quantity || 1);
    const price = Number(i.price ?? i.Preco_Unitario_Momento ?? 0);
    const existing = groups.find(
      (g) =>
        g.name === fullName &&
        Math.abs(g.price - price) < 0.01 &&
        g.observation === (i.observation || i.obs),
    );
    if (existing) {
      existing.amount += amount;
      existing.total += price * amount;
    } else {
      groups.push({
        name: fullName,
        amount,
        price,
        total: price * amount,
        observation: i.observation || i.obs,
      });
    }
  });
  return groups;
}

function handlePrintReceipt(paymentInfo) {
  emitReceipt(selectedComanda.value, paymentInfo);
}

function buildReceiptHtml(comanda, paymentInfo) {
  const now = new Date();
  const dateStr = now.toLocaleDateString("pt-BR");
  const timeStr = now.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const allItems = [];
  
  const relevantOrders = activeCheckout.value?.selectedOrderIds 
    ? (comanda.orders || []).filter(o => activeCheckout.value.selectedOrderIds.includes(o.id))
    : (comanda.orders || []);

  relevantOrders.forEach((order) => {
    const kitchenOrder = kitchenStore.orders.find((k) => k.id === order.id);
    if (kitchenOrder?.status === "cancelled") return;
    const items = getGroupedOrderItems(order);
    items.forEach((item) => {
      const existing = allItems.find((i) => i.name === item.name);
      if (existing) {
        existing.amount += item.amount;
        existing.total += item.total;
      } else {
        allItems.push({
          name: item.name,
          amount: item.amount,
          unitPrice: item.price,
          total: item.total,
        });
      }
    });
  });
  const subtotalVal = activeCheckout.value?.subtotal || 0;
  const totalFinal = paymentInfo ? paymentInfo.totalFinal : subtotalVal;
  const coupon = paymentInfo?.coupon || null;
  const couponDisc = paymentInfo?.couponDiscount || 0;
  const manualDisc = paymentInfo?.manualDiscount || 0;
  const payments = paymentInfo?.payments || [];
  const itemRows = allItems
    .map(
      (i) =>
        `<tr><td style="padding:5px 4px;">${i.amount}x</td><td style="padding:5px 4px;">${i.name}</td><td style="padding:5px 4px;text-align:right;">R$ ${i.unitPrice.toFixed(2)}</td><td style="padding:5px 4px;text-align:right;">R$ ${i.total.toFixed(2)}</td></tr>`,
    )
    .join("");
  const discountSection =
    manualDisc > 0 || couponDisc > 0
      ? `<tr style="color:#555;"><td colspan="3" style="padding:4px;border-top:1px dashed #ccc;padding-top:8px;">Subtotal</td><td style="padding:4px;text-align:right;border-top:1px dashed #ccc;padding-top:8px;">R$ ${subtotalVal.toFixed(2)}</td></tr>${manualDisc > 0 ? `<tr style="color:#c00;"><td colspan="3" style="padding:3px 4px;">Desconto aplicado</td><td style="padding:3px 4px;text-align:right;">− R$ ${manualDisc.toFixed(2)}</td></tr>` : ""}${couponDisc > 0 ? `<tr style="color:#c00;"><td colspan="3" style="padding:3px 4px;">Cupom ${coupon ? `(${coupon})` : ""}</td><td style="padding:3px 4px;text-align:right;">− R$ ${couponDisc.toFixed(2)}</td></tr>` : ""}`
      : "";
  const paymentSection = payments.length
    ? payments
        .map(
          (p) =>
            `<tr><td colspan="3" style="padding:3px 4px;color:#555;">${p.type}</td><td style="padding:3px 4px;text-align:right;">R$ ${Number(p.amount).toFixed(2)}</td></tr>`,
        )
        .join("")
    : "";
  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Cupom</title><style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:monospace;font-size:13px;color:#111;background:#fff;padding:16px;}.wrap{max-width:320px;margin:0 auto;}h2{text-align:center;font-size:16px;letter-spacing:1px;margin-bottom:2px;}.sub{text-align:center;color:#555;font-size:11px;margin-bottom:12px;}hr{border:none;border-top:1px dashed #aaa;margin:10px 0;}table{width:100%;border-collapse:collapse;}th{text-align:left;font-size:10px;text-transform:uppercase;color:#888;padding:4px;}th:last-child,th:nth-child(3){text-align:right;}.total-row td{font-weight:bold;font-size:15px;border-top:2px solid #111;padding-top:8px;padding-bottom:4px;}.footer{text-align:center;margin-top:14px;color:#888;font-size:10px;}@media print{body{padding:0;}button{display:none!important;}}</style></head><body><div class="wrap"><h2>CUPOM FISCAL</h2><p class="sub">${dateStr} às ${timeStr}</p><hr><p style="font-size:11px;margin-bottom:6px;">${comandaUnitLabel}: <strong>${comanda.isAutoatendimento && comanda.customerName ? comanda.customerName : comanda.label}</strong></p><hr><table><thead><tr><th>Qtd</th><th>Descrição</th><th>Unit.</th><th>Total</th></tr></thead><tbody>${itemRows}${discountSection}<tr class="total-row"><td colspan="3">TOTAL</td><td style="text-align:right;">R$ ${Number(totalFinal).toFixed(2)}</td></tr>${paymentSection}</tbody></table><hr><p class="footer">Obrigado!</p><div style="text-align:center;margin-top:16px;"><button onclick="window.print()" style="padding:8px 20px;background:#1976d2;color:#fff;border:none;border-radius:6px;font-size:13px;cursor:pointer;">Imprimir</button></div></div></body></html>`;
}
function emitReceipt(comanda, paymentInfo = null) {
  const html = buildReceiptHtml(comanda, paymentInfo);
  const win = window.open("", "_blank", "width=400,height=600");
  if (!win) {
    showToast("Permita pop-ups.", "error");
    return;
  }
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 400);
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e0e0e0;
  border-radius: 10px;
}
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>