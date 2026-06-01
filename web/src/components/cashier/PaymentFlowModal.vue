<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
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
            >
              Pagamento {{ currentPaymentIndex + 1 }} de {{ payments.length }}
            </span>
            <div class="flex gap-1">
              <div
                v-for="i in payments.length"
                :key="i"
                class="w-8 h-1.5 rounded transition-all"
                :class="
                  i - 1 <= currentPaymentIndex ? 'bg-accent' : 'bg-gray-100'
                "
              ></div>
            </div>
          </div>
          <h2 class="text-2xl font-black text-[#212121]">
            {{ payments[currentPaymentIndex]?.type }}
          </h2>
          <p class="text-accent font-black text-3xl mt-1">
            R$ {{ (payments[currentPaymentIndex]?.amount || 0).toFixed(2) }}
          </p>
        </div>

        <div class="p-8">
          <template v-if="payments[currentPaymentIndex]?.type === 'Dinheiro'">
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
                  (payments[currentPaymentIndex]?.amount || 0)
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
                        (payments[currentPaymentIndex]?.amount || 0)
                      ).toFixed(2)
                    }}</span
                  >
                </div>
                <div v-if="changeBreakdownList.length > 0" class="space-y-1.5">
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
                @click="$emit('close')"
                class="flex-1 py-3 bg-white border border-[#E0E0E0] text-[#757575] font-black uppercase text-xs rounded hover:bg-gray-50 transition-all"
              >
                Cancelar
              </button>
              <button
                @click="confirmCashPayment"
                :disabled="
                  cashReceivedForCurrent <
                  (payments[currentPaymentIndex]?.amount || 0)
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
                {{ payments[currentPaymentIndex]?.type }}
              </p>
              <p class="text-accent font-black text-3xl mt-2">
                R$ {{ (payments[currentPaymentIndex]?.amount || 0).toFixed(2) }}
              </p>
            </div>
            <div class="flex gap-3">
              <button
                @click="$emit('close')"
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
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { CheckCircle } from "lucide-vue-next";

const props = defineProps({
  isOpen: Boolean,
  payments: { type: Array, required: true },
});

const emit = defineEmits(["close", "complete"]);

const currentPaymentIndex = ref(0);
const cashReceivedForCurrent = ref(0);
const currentChangeBreakdown = ref({});
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

watch(
  () => props.isOpen,
  (val) => {
    if (val) {
      currentPaymentIndex.value = 0;
      cashReceivedForCurrent.value = 0;
      currentChangeBreakdown.value = {};
      processCurrentPayment();
    }
  },
);

function processCurrentPayment() {
  const current = props.payments[currentPaymentIndex.value];
  if (current && current.type === "Dinheiro") {
    cashReceivedForCurrent.value = current.amount;
    updateChangeBreakdown();
  }
}

function updateChangeBreakdown() {
  const current = props.payments[currentPaymentIndex.value];
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
  const current = props.payments[currentPaymentIndex.value];
  if (cashReceivedForCurrent.value < current.amount) return;
  nextPayment();
}

function nextPayment() {
  if (currentPaymentIndex.value < props.payments.length - 1) {
    currentPaymentIndex.value++;
    processCurrentPayment();
  } else {
    const firstPayment = props.payments[0];
    const change =
      firstPayment?.type === "Dinheiro" &&
      cashReceivedForCurrent.value > firstPayment.amount
        ? cashReceivedForCurrent.value - firstPayment.amount
        : 0;
    emit("complete", { change });
  }
}
</script>
