<template>
  <Teleport to="body">
    <div
      v-if="isOpen && comanda"
      class="fixed inset-0 bg-page/50 backdrop-blur-xl flex items-center justify-center p-4 z-50"
    >
      <div
        class="bg-white border border-[#E0E0E0] rounded w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
      >
        <div
          class="p-4 sm:p-8 border-b border-[#E0E0E0] flex justify-between items-center bg-gray-50 shrink-0"
        >
          <div class="flex items-center gap-4">
            <div
              class="bg-blue-100 p-3 rounded text-blue-500 border border-blue-700/30"
            >
              <Receipt :size="24" />
            </div>
            <div>
              <h2
                class="text-2xl font-black text-[#212121] uppercase tracking-tighter"
              >
                {{ getComandaMainLabel(comanda) }}
              </h2>
              <p
                class="font-black uppercase tracking-widest text-[10px]"
                :class="
                  comanda.isAutoatendimento ? 'text-blue-500' : 'text-[#757575]'
                "
              >
                {{
                  comanda.isAutoatendimento
                    ? "Autoatendimento"
                    : "Processamento Financeiro"
                }}
              </p>
            </div>
          </div>
          <button
            @click="$emit('close')"
            class="p-2 text-[#757575] hover:text-[#212121] hover:bg-gray-100 rounded transition-all"
          >
            <X :size="24" />
          </button>
        </div>

        <div class="p-4 sm:p-8 overflow-y-auto custom-scrollbar bg-white">
          <div
            class="flex gap-4 mb-8 bg-gray-50 p-1.5 rounded border border-[#E0E0E0]"
          >
            <label
              v-for="opt in [
                { value: 'total', label: 'Pagar Comanda Completa' },
                { value: 'parcial', label: 'Pagar Apenas Alguns Pedidos' },
              ]"
              :key="opt.value"
              class="flex-1 flex items-center justify-center gap-2 p-3 rounded cursor-pointer transition-all"
              :class="
                paymentMode === opt.value
                  ? 'bg-white shadow-sm border border-[#E0E0E0] text-blue-600 font-black'
                  : 'text-[#757575] font-bold hover:bg-gray-100'
              "
            >
              <input
                type="radio"
                v-model="paymentMode"
                :value="opt.value"
                class="sr-only"
              />
              {{ opt.label }}
            </label>
          </div>

          <div
            v-if="hasPending"
            class="mb-4 flex items-start gap-3 p-4 rounded bg-yellow-500/10 border border-yellow-500/30"
          >
            <AlertTriangle :size="18" class="text-yellow-600 shrink-0 mt-0.5" />
            <div>
              <p
                class="text-amber-700 font-black text-xs uppercase tracking-widest"
              >
                Pedidos aguardando preparo
              </p>
              <p class="text-yellow-600/80 text-xs mt-1">
                Um ou mais items ainda não foram enviados para a cozinha. Será
                necessário cancelá-los para finalizar.
              </p>
            </div>
          </div>

          <div class="space-y-4">
            <CheckoutOrderCard
              v-for="order in ordersWithStatus"
              :key="order.id"
              :order="order"
              :paymentMode="paymentMode"
              :isSelected="selectedOrderIds.includes(order.id)"
              @toggle-select="toggleOrder"
              @cancel-order="$emit('cancel-order', $event)"
            />
          </div>

          <template v-if="selectedOrderIds.length > 0">
            <CheckoutDiscountPanel
              :subtotal="subtotal"
              :discountType="discountType"
              :discountRaw="discountRaw"
              :discountValue="discountValue"
              :appliedCoupon="appliedCoupon"
              :couponCodeInput="couponCodeInput"
              :couponError="couponError"
              :couponDiscount="couponDiscount"
              :totalWithDiscount="totalWithDiscount"
              @update:discountType="discountType = $event"
              @discount-input="onDiscountInput"
              @update:couponCodeInput="couponCodeInput = $event"
              @apply-coupon="applyCoupon"
              @remove-coupon="removeCoupon"
            />

            <CheckoutPaymentSection
              v-if="totalWithDiscount > 0"
              :splitPayment="splitPayment"
              :numberOfPeople="numberOfPeople"
              :paymentSplits="paymentSplits"
              :enabledPaymentMethods="enabledPaymentMethods"
              :totalWithDiscount="totalWithDiscount"
              :totalPayments="totalPayments"
              @update:splitPayment="splitPayment = $event"
              @update:numberOfPeople="numberOfPeople = $event"
              @set-single-method="paymentSplits[0].type = $event"
              @set-split-type="(idx, val) => (paymentSplits[idx].type = val)"
              @split-amount-input="applyMask"
              @remove-split="removePaymentSplit"
              @add-split="addPaymentSplit"
              @distribute-equally="distributeEqually"
            />
          </template>

          <div
            v-if="selectedOrderIds.length === 0"
            class="mt-10 p-8 border border-dashed border-[#E0E0E0] rounded bg-gray-50 text-center"
          >
            <p
              class="text-[#757575] font-black uppercase tracking-widest text-sm"
            >
              Selecione pelo menos um pedido para pagar.
            </p>
          </div>
        </div>

        <div
          class="p-4 sm:p-8 border-t border-[#E0E0E0] bg-page/20 flex flex-col gap-6 shrink-0"
        >
          <div class="flex flex-col sm:flex-row justify-between gap-4 w-full">
            <div class="flex gap-3">
              <BaseButton variant="secondary" @click="$emit('close')"
                >Voltar</BaseButton
              >
              <BaseButton variant="danger" @click="$emit('cancel-comanda')">
                <XCircle :size="16" /> Cancelar Comanda
              </BaseButton>
            </div>
            <div class="flex gap-3">
              <BaseButton
                variant="primary"
                :disabled="isFinalizeDisabled"
                @click="handleFinalize"
                class="flex-grow sm:flex-none"
              >
                <CheckCircle :size="18" />
                {{
                  isFinalizeDisabled
                    ? "Pagamento Inválido"
                    : "Confirmar Pagamento"
                }}
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
  import { watch } from "vue";
  import {
    Receipt,
    AlertTriangle,
    X,
    XCircle,
    CheckCircle,
  } from "lucide-vue-next";
  import { useCheckoutPayment } from "@/composables/useCheckoutPayment";
  import { getComandaMainLabel } from "@/utils/checkoutUtils";
  import BaseButton from "@/components/ui/BaseButton.vue";
  import CheckoutOrderCard from "@/components/cashier/CheckoutOrderCard.vue";
  import CheckoutDiscountPanel from "@/components/cashier/CheckoutDiscountPanel.vue";
  import CheckoutPaymentSection from "@/components/cashier/CheckoutPaymentSection.vue";

  const props = defineProps({
    isOpen: Boolean,
    comanda: Object,
    ordersWithStatus: Array,
    enabledPaymentMethods: Array,
    comandaUnitLabel: String,
  });

  const emit = defineEmits([
    "close",
    "cancel-comanda",
    "cancel-order",
    "finalize",
  ]);

  const {
    paymentMode,
    selectedOrderIds,
    discountType,
    discountValue,
    discountRaw,
    couponCodeInput,
    appliedCoupon,
    couponError,
    splitPayment,
    numberOfPeople,
    paymentSplits,
    hasPending,
    subtotal,
    couponDiscount,
    totalWithDiscount,
    totalPayments,
    isFinalizeDisabled,
    reset,
    onDiscountInput,
    applyCoupon,
    removeCoupon,
    distributeEqually,
    addPaymentSplit,
    removePaymentSplit,
    applyMask,
    buildFinalizePayload,
  } = useCheckoutPayment(
    () => props.ordersWithStatus ?? [],
    () => props.enabledPaymentMethods ?? [],
  );

  watch(
    () => props.isOpen,
    (val) => {
      if (val) reset();
    },
  );

  function toggleOrder(id) {
    const order = props.ordersWithStatus?.find((o) => o.id === id);
    if (order?.status === "pending") return;
    const idx = selectedOrderIds.value.indexOf(id);
    if (idx === -1) selectedOrderIds.value.push(id);
    else selectedOrderIds.value.splice(idx, 1);
  }

  function handleFinalize() {
    if (isFinalizeDisabled.value) return;
    emit("finalize", buildFinalizePayload());
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
