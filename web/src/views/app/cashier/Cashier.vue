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
              <ComandaCard
                v-for="comanda in comandaStore.comandas"
                :key="comanda.id"
                :comanda="comanda"
                :comandaUnitLabel="comandaUnitLabel"
                :kitchenOrders="kitchenStore.orders"
                @click="openDetails(comanda)"
              />
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
        description="Informe o motivo do cancelamento."
        :reasons="['Demora', 'Pedido errado', 'Desistência']"
        @close="dismissManualCancel"
        @confirm="confirmManualCancel"
      />

      <CancelItem
        :isOpen="showCancelComandaModal"
        title="Cancelar Comanda Completa"
        description="Esta ação removerá a comanda do caixa e cancelará todos os pedidos na cozinha."
        :reasons="['Desistência', 'Erro no lançamento', 'Outros']"
        @close="showCancelComandaModal = false"
        @confirm="confirmCancelComanda"
      />

      <CheckoutRulesModal
        :isOpen="showRulesModal"
        :pendingCancel="pendingCancel"
        :message="rulesModalMessage"
        @close="showRulesModal = false"
        @confirm="confirmRules"
      />

      <PaymentFlowModal
        :isOpen="paymentFlowActive"
        :payments="pendingPayments"
        :isProcessing="isProcessingPayment"
        @cancel="cancelPaymentFlow"
        @finish="finishPaymentFlow"
      />

      <ReceiptModal
        :isOpen="showReceiptModal"
        @close="showReceiptModal = false"
        @print="
          () => {
            emitReceipt(
              pendingReceiptData.comanda,
              pendingReceiptData.paymentInfo,
              activeCheckout?.selectedOrderIds,
              kitchenStore.orders,
            );
            showReceiptModal = false;
          }
        "
      />
    </div>
  </SubscriptionGuard>
</template>

<script setup>
import SubscriptionGuard from "@/components/SubscriptionGuard.vue";
import CancelItem from "@/components/order/CancelItem.vue";
import CheckoutModal from "@/components/cashier/CheckoutModal.vue";
import ComandaCard from "@/components/cashier/ComandaCard.vue";
import PaymentFlowModal from "@/components/cashier/PaymentFlowModal.vue";
import CheckoutRulesModal from "@/components/cashier/CheckoutRulesModal.vue";
import ReceiptModal from "@/components/cashier/ReceiptModal.vue";
import { Monitor, FileText } from "lucide-vue-next";
import { useCashier } from "@/composables/useCashier";

const {
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
  showReceiptModal,
  pendingReceiptData,
  emitReceipt,
  handlePrintReceipt,
  activeCheckout,
} = useCashier();
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
</style>
