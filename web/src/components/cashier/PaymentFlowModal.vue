<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" style="z-index: 99999">
      <div class="bg-white border border-[#E0E0E0] rounded w-full max-w-lg shadow-2xl overflow-hidden">
        <div class="p-8 border-b border-[#E0E0E0] bg-gray-50">
          <div class="flex items-center justify-between mb-2">
            <span class="text-[10px] font-black text-[#757575] uppercase tracking-widest">
              Pagamento {{ currentPaymentIndex + 1 }} de {{ payments.length }}
            </span>
            <div class="flex gap-1">
              <div v-for="i in payments.length" :key="i" class="w-8 h-1.5 rounded transition-all" :class="i - 1 <= currentPaymentIndex ? 'bg-accent' : 'bg-gray-100'"></div>
            </div>
          </div>
          <h2 class="text-2xl font-black text-[#212121]">{{ currentPayment?.type }}</h2>
          <p class="text-accent font-black text-3xl mt-1">
            {{ formatCurrency(currentPayment?.amount) }}
          </p>
        </div>

        <div class="p-8">
          <template v-if="currentPayment?.type === 'Dinheiro'">
            <div class="space-y-4">
              <div class="space-y-1.5">
                <label class="text-xs font-black uppercase tracking-widest text-[#757575] ml-1">Valor Recebido</label>
                <input
                  type="number" v-model.number="cashReceived" min="0" step="0.01" :disabled="isProcessing"
                  class="w-full py-4 px-4 rounded border bg-gray-50 border-[#E0E0E0] text-[#212121] text-xl font-black text-right focus:border-primary/50 focus:outline-none transition-all disabled:opacity-50"
                  @input="updateChangeBreakdown"
                />
              </div>
              <div v-if="cashReceived >= (currentPayment?.amount || 0)" class="p-6 bg-accent-light border border-accent/30 rounded">
                <div class="flex justify-between items-center mb-3">
                  <span class="text-xs font-black text-[#757575] uppercase tracking-widest">Troco</span>
                  <span class="text-2xl font-black text-accent">
                    {{ formatCurrency(cashReceived - (currentPayment?.amount || 0)) }}
                  </span>
                </div>
                <div v-if="changeBreakdownList.length > 0" class="space-y-1.5">
                  <p class="text-[10px] font-black text-[#757575] uppercase tracking-widest mb-2">Detalhamento:</p>
                  <div v-for="item in changeBreakdownList" :key="item.label" class="flex justify-between text-xs font-bold text-[#212121]">
                    <span class="text-[#757575]">{{ item.label }}</span><span>× {{ item.count }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="mt-8 flex gap-3">
              <button @click="$emit('cancel')" :disabled="isProcessing" class="flex-1 py-3 bg-white border border-[#E0E0E0] text-[#757575] font-black uppercase text-xs rounded hover:bg-gray-50 transition-all disabled:opacity-50">Cancelar</button>
              <button @click="confirmPayment" :disabled="cashReceived < (currentPayment?.amount || 0) || isProcessing" class="flex-1 py-3 bg-primary text-white font-black uppercase text-xs rounded hover:bg-primary-dark transition-all disabled:opacity-40 disabled:cursor-not-allowed flex justify-center items-center gap-2">
                <span v-if="isProcessing">Processando...</span><span v-else>Confirmar</span>
              </button>
            </div>
          </template>

          <template v-else>
            <div class="p-6 bg-gray-50 border border-[#E0E0E0] rounded text-center mb-8">
              <p class="text-[#757575] font-bold text-sm mb-2">Confirmar recebimento via</p>
              <p class="text-[#212121] font-black text-xl">{{ currentPayment?.type }}</p>
              <p class="text-accent font-black text-3xl mt-2">
                {{ formatCurrency(currentPayment?.amount) }}
              </p>
            </div>
            <div class="flex gap-3">
              <button @click="$emit('cancel')" :disabled="isProcessing" class="flex-1 py-3 bg-white border border-[#E0E0E0] text-[#757575] font-black uppercase text-xs rounded hover:bg-gray-50 transition-all disabled:opacity-50">Cancelar</button>
              <button @click="confirmPayment" :disabled="isProcessing" class="flex-1 py-3 bg-primary text-white font-black uppercase text-xs rounded hover:bg-primary-dark transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                <CheckCircle v-if="!isProcessing" :size="16" />
                <span v-if="isProcessing">Processando...</span><span v-else>Recebido</span>
              </button>
            </div>
          </template>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { CheckCircle } from 'lucide-vue-next';
import { useUtils } from '@/composables/useUtils';

const { formatCurrency } = useUtils(); 

const props = defineProps({
  isOpen: Boolean,
  payments: { type: Array, required: true },
  isProcessing: Boolean
});

const emit = defineEmits(['cancel', 'finish']);

const currentPaymentIndex = computed(() => {
  const idx = props.payments.findIndex(p => !p._success);
  return idx === -1 ? 0 : idx;
});

const cashReceived = ref(0);
const changeBreakdown = ref({});
const currentPayment = computed(() => props.payments[currentPaymentIndex.value]);

const denominations = [
  { label: "R$ 200", value: 200 }, { label: "R$ 100", value: 100 }, { label: "R$ 50", value: 50 }, { label: "R$ 20", value: 20 },
  { label: "R$ 10", value: 10 }, { label: "R$ 5", value: 5 }, { label: "R$ 2", value: 2 }, { label: "R$ 1", value: 1 },
  { label: "R$ 0,50", value: 0.5 }, { label: "R$ 0,25", value: 0.25 }, { label: "R$ 0,10", value: 0.1 }, { label: "R$ 0,05", value: 0.05 },
];

watch(currentPaymentIndex, () => {
  setupCurrentPayment();
});

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    setupCurrentPayment();
  }
});

function setupCurrentPayment() {
  const amt = Number(currentPayment.value?.amount || 0);
  if (currentPayment.value?.type === 'Dinheiro') {
    cashReceived.value = Number(amt.toFixed(2));
    updateChangeBreakdown();
  } else {
    cashReceived.value = Number(amt.toFixed(2));
  }
}

function updateChangeBreakdown() {
  if (!currentPayment.value) return;
  if (cashReceived.value >= currentPayment.value.amount) {
    const change = cashReceived.value - currentPayment.value.amount;
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
    changeBreakdown.value = breakdown;
  } else {
    changeBreakdown.value = {};
  }
}

const changeBreakdownList = computed(() => Object.entries(changeBreakdown.value).map(([label, count]) => ({ label, count })));

function confirmPayment() {
  emit('finish', cashReceived.value);
}
</script>