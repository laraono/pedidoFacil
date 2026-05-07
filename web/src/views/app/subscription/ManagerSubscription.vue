<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useSubscriptionStore } from '@/stores/subscriptions';
import { subscriptionApi } from '@/services/subscriptionApi';
import { planApi } from '@/services/planApi';
import { loadMercadoPago } from "@mercadopago/sdk-js";
import {
  ArrowLeft, CreditCard, CheckCircle2, AlertTriangle,
  Clock, History, Banknote, X, ArrowLeftRight, Info
} from 'lucide-vue-next';

const error = ref('')
const serverError = ref(null)
const plans = ref([])
const sub = ref(null)
const currentPlan = ref({})
const isLoading = ref(true)
const history = ref([])

onMounted(async () => {
  try {
    plans.value = await planApi.list()
    sub.value = await subscriptionApi.getEstablishmentSubscription()
    history.value = await subscriptionApi.getSubscriptionHistory()
    currentPlan.value = sub.value?.plan ?? {}
    error.value = localStorage.getItem('subscriptionError') || ''
    await loadMercadoPago();
    mp = new window.MercadoPago('APP_USR-639449eb-f800-4563-9304-f64989497a7a');
  } catch (err) {
    console.error("Init error:", err);
    error.value = "Erro ao carregar dados da assinatura";
  } finally {
    isLoading.value = false
  }
})

const router = useRouter();
const subscriptionStore = useSubscriptionStore()

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatFrequency(frequency) {
  const map = { months: 'mês', anual: 'ano', days: 'dia' };
  return map[frequency] || frequency || 'mês';
}

function parsedFeatures(features) {
  if (!features) return [];
  try { return JSON.parse(features); }
  catch { return features.split(',').map(f => f.trim()).filter(Boolean); }
}

const STATUS_PT = {
  ACCREDITED: 'Aprovado', IN_PROCESS: 'Em processamento',
  CANCELED: 'Cancelado', CANCELLED: 'Cancelado',
  PENDING_CAPTURE: 'Aguardando captura', AUTHORIZED: 'Autorizado',
  REJECTED: 'Recusado', REFUNDED: 'Estornado',
  CHARGED_BACK: 'Contestado', PENDING: 'Pendente',
};

function translateStatus(status) {
  return STATUS_PT[status?.toUpperCase()] ?? status ?? '—';
}

// ── Status ────────────────────────────────────────────────────────────────────

const isActive = computed(() => sub.value?.status === 'Paga');

const statusConfig = computed(() => {
  const s = sub.value?.status;
  if (s === 'Paga')      return { label: 'Ativa',     color: 'text-accent',        bg: 'bg-accent-light border-accent/30' };
  if (s === 'Pendente')  return { label: 'Pendente',  color: 'text-amber-600',     bg: 'bg-amber-50 border-amber-400/30' };
  if (s === 'Expirada')  return { label: 'Expirada',  color: 'text-danger',        bg: 'bg-danger-light border-danger' };
  if (s === 'Cancelada') return { label: 'Cancelada', color: 'text-danger',        bg: 'bg-danger-light border-danger' };
  return                        { label: 'Inativa',   color: 'text-[#757575]',     bg: 'bg-gray-200/20 border-[#E0E0E0]' };
});

const daysUntilDue = computed(() => {
  if (!sub.value?.expirationDate) return null;
  const diff = new Date(sub.value.expirationDate).getTime() - new Date().getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

const formattedDueDate = computed(() => {
  if (!sub.value?.expirationDate) return '—';
  return new Date(sub.value.expirationDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
});

// ── Plano agendado ────────────────────────────────────────────────────────────

const isPlanModalOpen = ref(false);
const selectedNewPlan = ref(null);   // plano confirmado para o próximo ciclo
const tempSelectedPlan = ref(null);  // seleção dentro do modal (pré-confirmação)

const openPlanModal = () => {
  // Pré-seleciona no modal o plano já agendado (se houver) ou o plano atual
  tempSelectedPlan.value = selectedNewPlan.value
    ?? plans.value.find(p => p.id === sub.value?.plan?.id)
    ?? null;
  isPlanModalOpen.value = true;
};

const confirmPlanChange = () => {
  if (!tempSelectedPlan.value || tempSelectedPlan.value?.id === sub.value?.plan?.id) {
    isPlanModalOpen.value = false;
    return;
  }
  selectedNewPlan.value = tempSelectedPlan.value;
  subscriptionStore.setPlanToBeSubscribed(tempSelectedPlan.value.id);
  isPlanModalOpen.value = false;
  // Não cobra imediatamente — o novo plano entra apenas no próximo ciclo
};

const cancelPendingPlan = () => {
  selectedNewPlan.value = null;
  subscriptionStore.setPendingPlan(null);
};

// ── Pagamento (Brick) ─────────────────────────────────────────────────────────

let mp = null;
let cardPaymentBrickController = null;

const paymentModal = ref(false);
const isRestoring = ref(false);

const openCardModal = async (restore) => {
  paymentModal.value = true;
  isRestoring.value = restore;

  if (cardPaymentBrickController) {
    try { await cardPaymentBrickController.unmount(); } catch (_) {}
    cardPaymentBrickController = null;
  }
};

const closePaymentModal = () => {
  paymentModal.value = false;
  isRestoring.value = false;
};

const renderCardPaymentBrick = async () => {
  if (!sub.value || !mp) return;

  const amount = parseFloat(sub.value.price ?? sub.value.plan?.price);
  if (!amount || isNaN(amount)) {
    error.value = "Valor da assinatura inválido. Contate o suporte.";
    return;
  }

  const container = document.getElementById("cardPaymentBrick_container");
  if (!container) {
    error.value = "Formulário de pagamento não pôde ser carregado";
    return;
  }

  try {
    container.innerHTML = '';

    const settings = {
      initialization: {
        amount,
      },
      customization: {
        visual: { style: { theme: 'default' } },
        paymentMethods: {
          minInstallments: 1,
          maxInstallments: 1,
        },
      },
      callbacks: {
        onReady: () => {},
        onSubmit: async (formData, additionalData) => {
          try {
            serverError.value = null;
            const submitData = {
              type: "online",
              total_amount: String(formData.transaction_amount),
              external_reference: crypto.randomUUID(),
              processing_mode: "automatic",
              transactions: {
                payments: [{
                  amount: String(formData.transaction_amount),
                  payment_method: {
                    id: formData.payment_method_id,
                    type: additionalData.paymentTypeId,
                    token: formData.token,
                    installments: formData.installments,
                  },
                }],
              },
              payer: {
                email: formData.payer.email,
                identification: formData.payer.identification,
              }
            };

            if (isRestoring.value) {
              await subscriptionApi.restoreSubscription(sub.value.id, submitData);
            } else {
              await subscriptionApi.post(submitData, subscriptionStore.getPlanToBeSubscribed());
            }
            closePaymentModal();
          } catch (err) {
            console.error("Payment error:", err);
            serverError.value = err.message || "Erro ao processar pagamento. Tente novamente.";
          }
        },
        onError: (err) => {
          console.error("Brick error:", err);
          error.value = "Erro no sistema de pagamento";
        },
      },
    };

    cardPaymentBrickController = await mp.bricks().create(
      "cardPayment",
      "cardPaymentBrick_container",
      settings
    );
  } catch (err) {
    console.error("Render error:", err);
    error.value = err.message;
  }
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

    <transition enter-active-class="transition duration-300" enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0">
      <div v-if="error" class="bg-danger-light border border-danger text-danger p-3 rounded mb-6 inline-block font-medium text-sm">
        {{ error }}
      </div>
    </transition>

    <div v-if="sub" class="space-y-6">

      <!-- 1. Nota de plano agendado (topo) -->
      <div v-if="selectedNewPlan" class="bg-amber-50 border border-amber-400/50 rounded p-5 flex items-start gap-4">
        <Info :size="18" class="text-amber-500 shrink-0 mt-0.5" />
        <div class="flex-1">
          <p class="text-sm font-bold text-[#212121]">Alteração de plano agendada</p>
          <p class="text-xs text-[#757575] mt-1">
            Seu plano será alterado para
            <span class="font-black text-[#212121]">{{ selectedNewPlan.name }}</span>
            ({{ formatCurrency(selectedNewPlan.price) }}/{{ formatFrequency(selectedNewPlan.frequency) }})
            a partir da próxima renovação.
          </p>
        </div>
        <button @click="cancelPendingPlan" class="text-[#757575] hover:text-red-500 transition-colors shrink-0">
          <X :size="16" />
        </button>
      </div>

      <!-- 2. Card de status e cobrança -->
      <div class="rounded p-8 border border-[#E0E0E0] bg-white flex flex-col sm:flex-row sm:items-center gap-6">
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
            <span class="text-xs text-[#757575] font-bold uppercase tracking-wider">Plano {{ currentPlan?.name }}</span>
          </div>
          <p class="text-4xl font-black text-[#212121]">{{ formatCurrency(sub?.price) }}</p>
          <p class="text-[#757575] text-sm mt-1">cobrado por {{ formatFrequency(currentPlan?.frequency) }}</p>
        </div>

        <button
          v-if="sub?.status !== 'Pendente'"
          @click="openCardModal(true)"
          class="shrink-0 flex items-center gap-2 px-6 py-3.5 rounded font-black text-sm uppercase tracking-wider transition-all active:scale-95"
          :class="isActive ? 'bg-primary text-white hover:bg-primary-dark' : 'bg-danger text-white hover:bg-red-700'"
        >
          <CreditCard :size="16" />
          {{ isActive ? 'Mudar Cartão de Pagamento' : 'Reativar Assinatura' }}
        </button>
      </div>

      <!-- 3. Alternar plano -->
      <div class="bg-white border border-[#E0E0E0] rounded p-6 flex items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#757575] mb-1">
            <ArrowLeftRight :size="14" />
            Plano Atual
          </div>
          <p class="text-lg font-black text-[#212121]">{{ currentPlan?.name }}</p>
          <p class="text-xs text-[#757575] mt-0.5">{{ formatCurrency(sub?.price) }}/{{ formatFrequency(currentPlan?.frequency) }}</p>
        </div>
        <button
          @click="openPlanModal"
          class="flex items-center gap-2 px-4 py-2.5 rounded border border-[#E0E0E0] text-[#757575] font-bold text-sm hover:border-accent hover:text-accent transition-all"
        >
          <ArrowLeftRight :size="14" />
          Alterar Plano
        </button>
      </div>

      <!-- 4. Histórico de pagamentos -->
      <div class="bg-white border border-[#E0E0E0] rounded overflow-hidden">
        <div class="p-6 border-b border-[#E0E0E0] flex items-center gap-3">
          <History :size="18" class="text-accent" />
          <h2 class="font-black text-[#212121]">Histórico de Pagamentos</h2>
        </div>

        <div v-if="history?.length" class="divide-y divide-[#E0E0E0]">
          <div
            v-for="payment in history"
            :key="payment.date"
            class="px-6 py-4 flex items-center justify-between"
          >
            <div class="flex items-center gap-4">
              <div class="w-9 h-9 rounded bg-accent-light border border-accent/30 flex items-center justify-center">
                <Banknote :size="16" class="text-accent" />
              </div>
              <div>
                <p class="text-sm font-bold text-[#212121]">{{ payment.type }}</p>
                <p class="text-xs text-[#757575]">
                  {{ new Date(payment.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) }}
                </p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-sm font-black text-[#212121]">
                {{ formatCurrency(payment.amount) }}
              </p>
              <span class="text-[10px] font-black uppercase tracking-wider text-accent">
                {{ translateStatus(payment.status) }}
              </span>
            </div>
          </div>
        </div>
        <div v-else class="p-12 text-center text-[#757575]">
          <Clock :size="32" class="mx-auto mb-3 opacity-30" />
          <p class="text-sm font-bold">Nenhum pagamento registrado</p>
        </div>
      </div>

    </div>

    <!-- Modal de pagamento (Teleport) -->
    <Teleport to="body">
      <Transition name="fade" @after-enter="renderCardPaymentBrick">
        <div v-if="paymentModal" class="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4">
          <div class="bg-white border border-[#E0E0E0] w-full max-w-lg rounded shadow-2xl max-h-[90vh] overflow-y-auto">
            <div class="p-6 border-b border-[#E0E0E0] flex justify-between items-center">
              <h2 class="text-xl font-black text-[#212121]">
                {{ isRestoring ? 'Mudar Cartão de Pagamento' : 'Confirmar Pagamento' }}
              </h2>
              <button @click="closePaymentModal" class="p-2 text-[#757575] hover:text-[#212121] transition-colors">
                <X :size="20" />
              </button>
            </div>
            <div class="p-6">
              <div v-if="serverError" class="bg-danger-light border border-danger text-danger p-3 rounded mb-4 text-sm font-medium">
                {{ serverError }}
              </div>
              <div id="cardPaymentBrick_container" style="min-height: 450px; width: 100%;"></div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Modal de seleção de plano (Teleport) -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="isPlanModalOpen" class="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div class="bg-white border border-[#E0E0E0] w-full max-w-md rounded shadow-2xl">
            <div class="p-8 border-b border-[#E0E0E0] flex justify-between items-center">
              <h2 class="text-xl font-black text-[#212121] flex items-center gap-3">
                <ArrowLeftRight :size="20" class="text-accent" />
                Alterar Plano
              </h2>
              <button @click="isPlanModalOpen = false" class="p-2 text-[#757575] hover:text-[#212121]">
                <X :size="20" />
              </button>
            </div>

            <div class="p-8 space-y-4">
              <div
                v-for="plan in plans"
                :key="plan.id"
                @click="tempSelectedPlan = plan"
                :class="tempSelectedPlan?.id === plan.id
                  ? 'border-accent bg-accent-light'
                  : 'border-[#E0E0E0] bg-gray-50 hover:border-accent/40'"
                class="p-4 rounded border cursor-pointer transition-all"
              >
                <div class="flex items-center justify-between mb-1">
                  <div class="flex items-center gap-3">
                    <div class="w-5 h-5 rounded border-2 flex items-center justify-center"
                      :class="tempSelectedPlan?.id === plan.id ? 'border-accent' : 'border-zinc-400'">
                      <div v-if="tempSelectedPlan?.id === plan.id" class="w-2.5 h-2.5 rounded bg-accent" />
                    </div>
                    <p class="font-bold text-sm" :class="tempSelectedPlan?.id === plan.id ? 'text-accent' : 'text-[#212121]'">
                      {{ plan?.name }}
                    </p>
                  </div>
                  <div class="flex items-center gap-2">
                    <p class="text-xs text-[#757575]">{{ formatCurrency(plan.price) }}/{{ formatFrequency(plan.frequency) }}</p>
                    <span v-if="plan.id === sub?.plan?.id" class="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-accent-light text-accent rounded border border-accent/30">Atual</span>
                  </div>
                </div>
                <ul v-if="parsedFeatures(plan.features).length" class="mt-2 space-y-1 pl-8">
                  <li
                    v-for="feat in parsedFeatures(plan.features)"
                    :key="feat"
                    class="text-xs text-[#757575] flex items-center gap-1.5"
                  >
                    <span class="w-1 h-1 rounded-full bg-accent shrink-0"></span>
                    {{ feat }}
                  </li>
                </ul>
              </div>

              <div class="p-4 bg-amber-50 border border-amber-400/40 rounded flex items-start gap-3">
                <Info :size="15" class="text-amber-500 shrink-0 mt-0.5" />
                <p class="text-xs text-[#757575] leading-relaxed">
                  A alteração de plano <strong class="text-[#212121]">só entrará em vigor na próxima renovação</strong>.
                </p>
              </div>
            </div>

            <div class="p-8 pt-0 flex gap-3">
              <button @click="isPlanModalOpen = false" class="flex-1 py-3 rounded text-[#757575] font-bold hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button
                @click="confirmPlanChange"
                :disabled="!tempSelectedPlan || tempSelectedPlan?.id === sub?.plan?.id"
                class="flex-1 py-3 rounded font-black text-sm uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-2"
                :class="(tempSelectedPlan && tempSelectedPlan?.id !== sub?.plan?.id)
                  ? 'bg-primary text-white hover:bg-primary-dark'
                  : 'bg-gray-200 text-[#757575] cursor-not-allowed'"
              >
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
