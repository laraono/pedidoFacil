<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useSubscriptionStore } from '@/stores/subscriptions';
import {
  ArrowLeft, CreditCard, Calendar, CheckCircle2, AlertTriangle,
  Clock, History, Banknote, RefreshCw, X, ChevronRight
} from 'lucide-vue-next';

const router = useRouter();
const subscriptionStore = useSubscriptionStore();

const sub = computed(() => subscriptionStore.subscription);
const isActive = computed(() => subscriptionStore.isActive);
const daysUntilDue = computed(() => subscriptionStore.daysUntilDue);

const isPaymentModalOpen = ref(false);
const selectedMethod = ref('');

const PAYMENT_METHODS = ['Cartão de Crédito', 'Pix', 'Boleto Bancário'];

const statusConfig = computed(() => {
  const s = sub.value?.status;
  if (s === 'ativo') return { label: 'Ativa', color: 'text-accent', bg: 'bg-accent-light border-accent/30' };
  if (s === 'expirado') return { label: 'Expirada', color: 'text-danger', bg: 'bg-danger-light border-danger' };
  return { label: 'Desativada', color: 'text-[#757575]', bg: 'bg-gray-200/20 border-[#E0E0E0]' };
});

const planLabel = computed(() => sub.value?.plan === 'anual' ? 'Anual' : 'Mensal');
const planPrice = computed(() => {
  const prices = subscriptionStore.planPrices;
  const val = sub.value?.plan === 'anual' ? prices.annual : prices.monthly;
  return 'R$ ' + val.toFixed(2).replace('.', ',') + '/mês';
});

const formattedDueDate = computed(() => {
  if (!sub.value?.nextDueDate) return '—';
  return new Date(sub.value.nextDueDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
});

const dueDateWarning = computed(() => {
  if (!isActive.value) return false;
  return daysUntilDue.value !== null && daysUntilDue.value <= 7;
});

const confirmPayment = () => {
  if (!selectedMethod.value) return;
  subscriptionStore.recordPayment(selectedMethod.value);
  isPaymentModalOpen.value = false;
  selectedMethod.value = '';
};
</script>

<template>
  <main class="max-w-4xl mx-auto py-12 px-6 font-inter">

    <header class="flex items-center gap-4 mb-10">
      <button @click="router.push('/app/dashboard')" class="p-3 bg-gray-50 border border-[#E0E0E0] rounded text-[#757575] hover:text-[#212121] transition-colors">
        <ArrowLeft :size="20" />
      </button>
      <div>
        <h1 class="text-3xl font-black text-[#212121]">Minha Assinatura</h1>
        <p class="text-[#757575] text-sm">Gerencie seu plano e pagamentos</p>
      </div>
    </header>

    <div v-if="sub" class="space-y-6">

      <!-- Status card -->
      <div
        class="rounded p-8 border flex flex-col sm:flex-row sm:items-center gap-6"
        :class="isActive ? 'bg-accent-light border-accent/30' : 'bg-red-950/20 border-danger'"
      >
        <div class="flex-1">
          <div class="flex items-center gap-3 mb-3">
            <div
              class="flex items-center gap-2 px-3 py-1 rounded border text-xs font-black uppercase tracking-widest"
              :class="statusConfig.bg + ' ' + statusConfig.color"
            >
              <CheckCircle2 v-if="isActive" :size="12" />
              <AlertTriangle v-else :size="12" />
              {{ statusConfig.label }}
            </div>
            <span class="text-xs text-[#757575] font-bold uppercase tracking-wider">Plano {{ planLabel }}</span>
          </div>
          <p class="text-4xl font-black text-[#212121]">{{ planPrice }}</p>
          <p class="text-[#757575] text-sm mt-1">cobrado {{ sub.plan === 'anual' ? 'anualmente' : 'mensalmente' }}</p>
        </div>

        <button
          @click="isPaymentModalOpen = true"
          class="shrink-0 flex items-center gap-2 px-6 py-3.5 rounded font-black text-sm uppercase tracking-wider transition-all active:scale-95"
          :class="isActive ? 'bg-primary text-white hover:bg-primary-dark' : 'bg-danger text-white hover:bg-red-600'"
        >
          <CreditCard :size="16" />
          {{ isActive ? 'Realizar Pagamento' : 'Reativar Assinatura' }}
        </button>
      </div>

      <!-- Vencimento & método -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          class="bg-white border rounded p-6"
          :class="dueDateWarning ? 'border-amber-500/40 bg-amber-950/10' : 'border-[#E0E0E0]'"
        >
          <div class="flex items-center gap-2 text-xs font-black uppercase tracking-widest mb-3"
               :class="dueDateWarning ? 'text-amber-400' : 'text-[#757575]'">
            <Calendar :size="14" />
            Próximo Vencimento
          </div>
          <p class="text-xl font-black text-[#212121]">{{ formattedDueDate }}</p>
          <p v-if="dueDateWarning" class="text-amber-400 text-xs font-bold mt-1 flex items-center gap-1">
            <AlertTriangle :size="12" /> Vence em {{ daysUntilDue }} dias
          </p>
          <p v-else-if="isActive" class="text-[#757575] text-xs mt-1">
            {{ daysUntilDue }} dias restantes
          </p>
        </div>

        <div class="bg-white border border-[#E0E0E0] rounded p-6">
          <div class="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#757575] mb-3">
            <CreditCard :size="14" />
            Método de Pagamento
          </div>
          <p class="text-xl font-black text-[#212121]">{{ sub.paymentMethod || '—' }}</p>
          <button
            @click="isPaymentModalOpen = true"
            class="text-accent text-xs font-bold mt-1 flex items-center gap-1 hover:underline"
          >
            Alterar <ChevronRight :size="12" />
          </button>
        </div>
      </div>

      <!-- Histórico -->
      <div class="bg-white border border-[#E0E0E0] rounded overflow-hidden">
        <div class="p-6 border-b border-[#E0E0E0] flex items-center gap-3">
          <History :size="18" class="text-accent" />
          <h2 class="font-black text-[#212121]">Histórico de Pagamentos</h2>
        </div>

        <div v-if="sub.history?.length" class="divide-y divide-white/5">
          <div
            v-for="payment in sub.history"
            :key="payment.id"
            class="px-6 py-4 flex items-center justify-between"
          >
            <div class="flex items-center gap-4">
              <div class="w-9 h-9 rounded bg-accent-light border border-accent/30 flex items-center justify-center">
                <Banknote :size="16" class="text-accent" />
              </div>
              <div>
                <p class="text-sm font-bold text-[#212121]">{{ payment.method }}</p>
                <p class="text-xs text-[#757575]">
                  {{ new Date(payment.date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) }}
                </p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-sm font-black text-[#212121]">
                {{ payment.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
              </p>
              <span class="text-[10px] font-black uppercase tracking-wider text-accent">{{ payment.status }}</span>
            </div>
          </div>
        </div>
        <div v-else class="p-12 text-center text-[#757575]">
          <Clock :size="32" class="mx-auto mb-3 opacity-30" />
          <p class="text-sm font-bold">Nenhum pagamento registrado</p>
        </div>
      </div>

    </div>

    <!-- Modal de pagamento -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="isPaymentModalOpen" class="fixed inset-0 bg-black/50  z-[100] flex items-center justify-center p-4">
          <div class="bg-white border border-[#E0E0E0] w-full max-w-md rounded shadow-2xl">
            <div class="p-8 border-b border-[#E0E0E0] flex justify-between items-center">
              <h2 class="text-xl font-black text-[#212121] flex items-center gap-3">
                <CreditCard :size="20" class="text-accent" />
                Realizar Pagamento
              </h2>
              <button @click="isPaymentModalOpen = false" class="p-2 text-[#757575] hover:text-[#212121]">
                <X :size="20" />
              </button>
            </div>

            <div class="p-8 space-y-4">
              <p class="text-sm text-[#757575]">Selecione o método de pagamento para este ciclo:</p>

              <div
                v-for="method in PAYMENT_METHODS"
                :key="method"
                @click="selectedMethod = method"
                :class="selectedMethod === method
                  ? 'border-accent bg-accent-light text-accent'
                  : 'border-[#E0E0E0] bg-gray-50 text-[#757575] hover:border-[#E0E0E0]'"
                class="flex items-center gap-3 p-4 rounded border cursor-pointer transition-all"
              >
                <div
                  class="w-5 h-5 rounded border-2 flex items-center justify-center"
                  :class="selectedMethod === method ? 'border-accent' : 'border-zinc-600'"
                >
                  <div v-if="selectedMethod === method" class="w-2.5 h-2.5 rounded bg-accent" />
                </div>
                <span class="font-bold text-sm">{{ method }}</span>
              </div>

              <div class="pt-2 border-t border-[#E0E0E0] flex items-center justify-between text-sm">
                <span class="text-[#757575]">Valor</span>
                <span class="font-black text-[#212121]">
                  R$ {{ sub?.plan === 'anual'
                    ? subscriptionStore.planPrices.annual.toFixed(2).replace('.', ',')
                    : subscriptionStore.planPrices.monthly.toFixed(2).replace('.', ',') }}
                </span>
              </div>
            </div>

            <div class="p-8 pt-0 flex gap-3">
              <button @click="isPaymentModalOpen = false" class="flex-1 py-3 rounded text-[#757575] font-bold hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button
                @click="confirmPayment"
                :disabled="!selectedMethod"
                class="flex-1 py-3 rounded font-black text-sm uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-2"
                :class="selectedMethod ? 'bg-primary text-white hover:bg-primary-dark' : 'bg-gray-200 text-[#757575] cursor-not-allowed'"
              >
                <RefreshCw :size="14" />
                Confirmar
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

  </main>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
