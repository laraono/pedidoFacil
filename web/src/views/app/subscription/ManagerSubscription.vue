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
  if (s === 'ativo') return { label: 'Ativa', color: 'text-brand-green', bg: 'bg-brand-green/10 border-brand-green/20' };
  if (s === 'expirado') return { label: 'Expirada', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' };
  return { label: 'Desativada', color: 'text-zinc-400', bg: 'bg-zinc-700/20 border-zinc-600/20' };
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
      <button @click="router.push('/app/dashboard')" class="p-3 bg-white/5 border border-white/10 rounded-2xl text-gray-400 hover:text-white transition-colors">
        <ArrowLeft :size="20" />
      </button>
      <div>
        <h1 class="text-3xl font-black text-white">Minha Assinatura</h1>
        <p class="text-gray-400 text-sm">Gerencie seu plano e pagamentos</p>
      </div>
    </header>

    <div v-if="sub" class="space-y-6">

      <!-- Status card -->
      <div
        class="rounded-[2rem] p-8 border flex flex-col sm:flex-row sm:items-center gap-6"
        :class="isActive ? 'bg-brand-green/5 border-brand-green/20' : 'bg-red-950/20 border-red-500/30'"
      >
        <div class="flex-1">
          <div class="flex items-center gap-3 mb-3">
            <div
              class="flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-black uppercase tracking-widest"
              :class="statusConfig.bg + ' ' + statusConfig.color"
            >
              <CheckCircle2 v-if="isActive" :size="12" />
              <AlertTriangle v-else :size="12" />
              {{ statusConfig.label }}
            </div>
            <span class="text-xs text-zinc-500 font-bold uppercase tracking-wider">Plano {{ planLabel }}</span>
          </div>
          <p class="text-4xl font-black text-white">{{ planPrice }}</p>
          <p class="text-zinc-400 text-sm mt-1">cobrado {{ sub.plan === 'anual' ? 'anualmente' : 'mensalmente' }}</p>
        </div>

        <button
          @click="isPaymentModalOpen = true"
          class="shrink-0 flex items-center gap-2 px-6 py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider transition-all active:scale-95"
          :class="isActive ? 'bg-brand-green text-black hover:bg-brand-green-hover' : 'bg-red-500 text-white hover:bg-red-600'"
        >
          <CreditCard :size="16" />
          {{ isActive ? 'Realizar Pagamento' : 'Reativar Assinatura' }}
        </button>
      </div>

      <!-- Vencimento & método -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          class="bg-dark-card border rounded-[1.5rem] p-6"
          :class="dueDateWarning ? 'border-amber-500/40 bg-amber-950/10' : 'border-white/10'"
        >
          <div class="flex items-center gap-2 text-xs font-black uppercase tracking-widest mb-3"
               :class="dueDateWarning ? 'text-amber-400' : 'text-zinc-500'">
            <Calendar :size="14" />
            Próximo Vencimento
          </div>
          <p class="text-xl font-black text-white">{{ formattedDueDate }}</p>
          <p v-if="dueDateWarning" class="text-amber-400 text-xs font-bold mt-1 flex items-center gap-1">
            <AlertTriangle :size="12" /> Vence em {{ daysUntilDue }} dias
          </p>
          <p v-else-if="isActive" class="text-zinc-500 text-xs mt-1">
            {{ daysUntilDue }} dias restantes
          </p>
        </div>

        <div class="bg-dark-card border border-white/10 rounded-[1.5rem] p-6">
          <div class="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500 mb-3">
            <CreditCard :size="14" />
            Método de Pagamento
          </div>
          <p class="text-xl font-black text-white">{{ sub.paymentMethod || '—' }}</p>
          <button
            @click="isPaymentModalOpen = true"
            class="text-brand-green text-xs font-bold mt-1 flex items-center gap-1 hover:underline"
          >
            Alterar <ChevronRight :size="12" />
          </button>
        </div>
      </div>

      <!-- Histórico -->
      <div class="bg-dark-card border border-white/10 rounded-[2rem] overflow-hidden">
        <div class="p-6 border-b border-white/5 flex items-center gap-3">
          <History :size="18" class="text-brand-green" />
          <h2 class="font-black text-white">Histórico de Pagamentos</h2>
        </div>

        <div v-if="sub.history?.length" class="divide-y divide-white/5">
          <div
            v-for="payment in sub.history"
            :key="payment.id"
            class="px-6 py-4 flex items-center justify-between"
          >
            <div class="flex items-center gap-4">
              <div class="w-9 h-9 rounded-xl bg-brand-green/10 border border-brand-green/20 flex items-center justify-center">
                <Banknote :size="16" class="text-brand-green" />
              </div>
              <div>
                <p class="text-sm font-bold text-white">{{ payment.method }}</p>
                <p class="text-xs text-zinc-500">
                  {{ new Date(payment.date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) }}
                </p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-sm font-black text-white">
                {{ payment.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
              </p>
              <span class="text-[10px] font-black uppercase tracking-wider text-brand-green">{{ payment.status }}</span>
            </div>
          </div>
        </div>
        <div v-else class="p-12 text-center text-zinc-600">
          <Clock :size="32" class="mx-auto mb-3 opacity-30" />
          <p class="text-sm font-bold">Nenhum pagamento registrado</p>
        </div>
      </div>

    </div>

    <!-- Modal de pagamento -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="isPaymentModalOpen" class="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div class="bg-zinc-900 border border-white/10 w-full max-w-md rounded-[2.5rem] shadow-2xl">
            <div class="p-8 border-b border-white/5 flex justify-between items-center">
              <h2 class="text-xl font-black text-white flex items-center gap-3">
                <CreditCard :size="20" class="text-brand-green" />
                Realizar Pagamento
              </h2>
              <button @click="isPaymentModalOpen = false" class="p-2 text-gray-400 hover:text-white">
                <X :size="20" />
              </button>
            </div>

            <div class="p-8 space-y-4">
              <p class="text-sm text-zinc-400">Selecione o método de pagamento para este ciclo:</p>

              <div
                v-for="method in PAYMENT_METHODS"
                :key="method"
                @click="selectedMethod = method"
                :class="selectedMethod === method
                  ? 'border-brand-green bg-brand-green/10 text-brand-green'
                  : 'border-white/10 bg-white/5 text-zinc-300 hover:border-white/20'"
                class="flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all"
              >
                <div
                  class="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                  :class="selectedMethod === method ? 'border-brand-green' : 'border-zinc-600'"
                >
                  <div v-if="selectedMethod === method" class="w-2.5 h-2.5 rounded-full bg-brand-green" />
                </div>
                <span class="font-bold text-sm">{{ method }}</span>
              </div>

              <div class="pt-2 border-t border-white/5 flex items-center justify-between text-sm">
                <span class="text-zinc-400">Valor</span>
                <span class="font-black text-white">
                  R$ {{ sub?.plan === 'anual'
                    ? subscriptionStore.planPrices.annual.toFixed(2).replace('.', ',')
                    : subscriptionStore.planPrices.monthly.toFixed(2).replace('.', ',') }}
                </span>
              </div>
            </div>

            <div class="p-8 pt-0 flex gap-3">
              <button @click="isPaymentModalOpen = false" class="flex-1 py-3 rounded-2xl text-zinc-400 font-bold hover:bg-white/5 transition-colors">
                Cancelar
              </button>
              <button
                @click="confirmPayment"
                :disabled="!selectedMethod"
                class="flex-1 py-3 rounded-2xl font-black text-sm uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-2"
                :class="selectedMethod ? 'bg-brand-green text-black hover:bg-brand-green-hover' : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'"
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
