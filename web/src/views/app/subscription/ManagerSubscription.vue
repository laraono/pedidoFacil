<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { subscriptionApi } from '@/services/subscriptionApi';
import { planApi } from '@/services/planApi';
import { loadMercadoPago } from "@mercadopago/sdk-js";
import {
  CreditCard, CheckCircle2, AlertTriangle,
  Clock, History, Banknote, X, ArrowLeftRight, Info,
  XCircle, FileText, ExternalLink
} from 'lucide-vue-next';
import { PageHeader, BaseButton, FormModal } from '@/components/ui';
import { formatFrequency } from '@/utils/frequency';
import { useUtils } from '@/composables/useUtils';

const { formatCurrency, parsedFeatures } = useUtils();

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
    mp = new window.MercadoPago(import.meta.env.VITE_MP_PUBLIC_KEY);
  } catch (err) {
    console.error("Init error:", err);
    error.value = "Erro ao carregar dados da assinatura";
  } finally {
    isLoading.value = false
  }
})

const authStore = useAuthStore();

const effectivePrice = computed(() =>
  sub.value?.price ?? sub.value?.plan?.price ?? 0
);

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
  if (!sub.value?.nextPaymentDate) return null;
  const diff = new Date(sub.value.nextPaymentDate).getTime() - new Date().getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

const formattedDueDate = computed(() => {
  const date = sub.value?.nextPaymentDate ?? sub.value?.expirationDate;
  if (!date) return '—';
  return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
});

const isPlanModalOpen = ref(false);
const showConfirmPlanModal = ref(false);
const tempSelectedPlan = ref(null);
const isChanging = ref(false);

const openPlanModal = () => {
  tempSelectedPlan.value = plans.value.find(p => p.id === sub.value?.plan?.id) ?? null;
  isPlanModalOpen.value = true;
};

const requestPlanChange = () => {
  if (!tempSelectedPlan.value || tempSelectedPlan.value.id === sub.value?.plan?.id) return;
  showConfirmPlanModal.value = true;
};

const confirmPlanChange = async () => {
  if (!tempSelectedPlan.value) { showConfirmPlanModal.value = false; return; }
  try {
    isChanging.value = true;
    sub.value = await subscriptionApi.changePlan(tempSelectedPlan.value.id);
    currentPlan.value = sub.value?.plan ?? {};
    showConfirmPlanModal.value = false;
    isPlanModalOpen.value = false;
  } catch (err) {
    error.value = err.message || 'Erro ao alterar plano';
    showConfirmPlanModal.value = false;
  } finally {
    isChanging.value = false;
  }
};

const showCancelModal = ref(false);
const isCancelling = ref(false);
const cancelError = ref('');

const confirmCancel = async () => {
  if (!sub.value?.id) return;
  isCancelling.value = true;
  cancelError.value = '';
  try {
    await subscriptionApi.cancelSubscription(sub.value.id);
    sub.value = await subscriptionApi.getEstablishmentSubscription();
    showCancelModal.value = false;
  } catch (err) {
    cancelError.value = err.message || 'Erro ao cancelar assinatura';
  } finally {
    isCancelling.value = false;
  }
};

let mp = null;
let cardFormInstance = null;

const paymentModal = ref(false);
const payerEmail = ref('');
const isTokenizing = ref(false);

const destroyCardForm = () => {
  try { cardFormInstance?.unmount(); } catch {}
  cardFormInstance = null;
};

const initCardForm = async () => {
  if (!mp || !sub.value) return;
  destroyCardForm();
  await nextTick();

  const amount = String(sub.value.price ?? sub.value.plan?.price ?? 1);

  cardFormInstance = mp.cardForm({
    amount,
    iframe: true,
    form: {
      id: 'mp-manager-card-form',
      cardNumber: { id: 'mp-mgr-cardNumber', placeholder: '0000 0000 0000 0000' },
      expirationDate: { id: 'mp-mgr-expirationDate', placeholder: 'MM/AA' },
      securityCode: { id: 'mp-mgr-securityCode', placeholder: 'CVV' },
      cardholderName: { id: 'mp-mgr-cardholderName' },
      issuer: { id: 'mp-mgr-issuer', placeholder: 'Banco emissor' },
      installments: { id: 'mp-mgr-installments' },
      identificationType: { id: 'mp-mgr-identificationType' },
      identificationNumber: { id: 'mp-mgr-identificationNumber' },
    },
    callbacks: {
      onFormMounted: (err) => {
        if (err) { serverError.value = 'Erro ao carregar formulário de pagamento.'; console.error(err); }
      },
      onSubmit: async (event) => {
        event.preventDefault();
        if (isTokenizing.value) return;
        serverError.value = null;
        isTokenizing.value = true;
        try {
          const { token } = cardFormInstance.getCardFormData();
          if (!token) throw new Error('Não foi possível gerar o token. Verifique os dados do cartão.');
          await subscriptionApi.restoreSubscription(sub.value.id, { cardToken: token, payerEmail: payerEmail.value });
          closePaymentModal();
          sub.value = await subscriptionApi.getEstablishmentSubscription();
          currentPlan.value = sub.value?.plan ?? {};
        } catch (err) {
          serverError.value = err.message || 'Erro ao processar pagamento. Tente novamente.';
        } finally {
          isTokenizing.value = false;
        }
      },
      onError: () => { serverError.value = 'Verifique os dados do cartão e tente novamente.'; },
    },
  });
};

const openCardModal = () => {
  serverError.value = null;
  paymentModal.value = true;
};

const closePaymentModal = () => {
  destroyCardForm();
  paymentModal.value = false;
  payerEmail.value = '';
};
</script>

<template>
  <main class="max-w-4xl mx-auto py-12 px-6 font-inter">

    <PageHeader
      title="Minha Assinatura"
      subtitle="Gerencie seu plano e pagamentos"
      back-to="/app/dashboard"
    />

    <transition enter-active-class="transition duration-300" enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0">
      <div v-if="error" class="bg-danger-light border border-danger text-danger p-3 rounded mb-6 inline-block font-medium text-sm">
        {{ error }}
      </div>
    </transition>

    <div v-if="sub" class="space-y-6">

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
          <p class="text-4xl font-black text-[#212121]">{{ formatCurrency(effectivePrice) }}</p>
          <p class="text-[#757575] text-sm mt-1">cobrado por {{ formatFrequency(currentPlan?.frequency) }}</p>
        </div>

        <div class="flex flex-col sm:flex-row gap-3 shrink-0">
          <button
            v-if="sub?.status !== 'Pendente'"
            @click="openCardModal()"
            class="flex items-center gap-2 px-6 py-3.5 rounded font-black text-sm uppercase tracking-wider transition-all active:scale-95"
            :class="isActive ? 'bg-primary text-white hover:bg-primary-dark' : 'bg-danger text-white hover:bg-red-700'"
          >
            <CreditCard :size="16" />
            {{ isActive ? 'Mudar Cartão' : 'Reativar Assinatura' }}
          </button>

          <button
            v-if="isActive"
            @click="showCancelModal = true"
            class="flex items-center gap-2 px-6 py-3.5 rounded font-black text-sm uppercase tracking-wider border border-danger text-danger hover:bg-danger-light transition-all active:scale-95"
          >
            <XCircle :size="16" />
            Cancelar Assinatura
          </button>
        </div>
      </div>

      <div class="bg-white border border-[#E0E0E0] rounded p-6 flex items-center justify-between gap-4">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#757575] mb-1">
            <ArrowLeftRight :size="14" />
            Plano Atual
          </div>
          <p class="text-lg font-black text-[#212121]">{{ currentPlan?.name }}</p>
          <p class="text-xs text-[#757575] mt-0.5">{{ formatCurrency(effectivePrice) }}/{{ formatFrequency(currentPlan?.frequency) }}</p>
        </div>
        <button
          @click="openPlanModal"
          class="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded border border-[#E0E0E0] text-[#757575] font-bold text-sm hover:border-accent hover:text-accent transition-all"
        >
          <ArrowLeftRight :size="14" />
          Alterar Plano
        </button>
      </div>

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
            <div class="text-right flex flex-col items-end gap-1">
              <p class="text-sm font-black text-[#212121]">{{ formatCurrency(payment.amount) }}</p>
              <span class="text-[10px] font-black uppercase tracking-wider text-accent">{{ payment.status ?? '—' }}</span>
              <p v-if="payment.installments && payment.installments > 1" class="text-[10px] text-[#757575]">
                {{ payment.installments }}x de {{ formatCurrency(payment.amount / payment.installments) }}
              </p>
              <a
                v-if="payment.receipt"
                :href="payment.receipt"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-1 text-[10px] font-bold text-primary hover:underline"
              >
                <FileText :size="11" />
                Ver fatura
                <ExternalLink :size="10" />
              </a>
            </div>
          </div>
        </div>
        <div v-else class="p-12 text-center text-[#757575]">
          <Clock :size="32" class="mx-auto mb-3 opacity-30" />
          <p class="text-sm font-bold">Nenhum pagamento registrado</p>
        </div>
      </div>

    </div>
  </main>

  <FormModal
    :show="showCancelModal"
    title="Cancelar Assinatura"
    size="sm"
    hide-save
    @close="showCancelModal = false"
  >
    <div class="space-y-4">
      <p class="text-sm text-[#757575] leading-relaxed">
        Tem certeza que deseja cancelar sua assinatura?
        O acesso permanece ativo até o vencimento em
        <span class="font-bold text-[#212121]">{{ formattedDueDate }}</span>.
      </p>
      <div v-if="cancelError" class="bg-danger-light border border-danger text-danger p-3 rounded text-sm font-medium">
        {{ cancelError }}
      </div>
    </div>
    <template #footer-actions>
      <BaseButton variant="danger" :isLoading="isCancelling" @click="confirmCancel">
        Confirmar Cancelamento
      </BaseButton>
    </template>
  </FormModal>

  <FormModal
    :show="isPlanModalOpen"
    title="Alterar Plano"
    size="sm"
    save-label="Confirmar"
    :save-disabled="!tempSelectedPlan || tempSelectedPlan?.id === sub?.plan?.id"
    @close="isPlanModalOpen = false"
    @save="requestPlanChange"
  >
    <div class="space-y-4">
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
          A mudança é <strong class="text-[#212121]">imediata</strong>. O novo valor será cobrado na próxima renovação.
        </p>
      </div>
    </div>
  </FormModal>

  <FormModal
    :show="showConfirmPlanModal"
    title="Confirmar Alteração de Plano"
    size="sm"
    save-label="Confirmar Troca"
    :is-loading="isChanging"
    @close="showConfirmPlanModal = false"
    @save="confirmPlanChange"
  >
    <p class="text-sm text-[#757575] leading-relaxed">
      Tem certeza que deseja trocar para o plano
      <span class="font-bold text-[#212121]">{{ tempSelectedPlan?.name }}</span>
      por <span class="font-bold text-[#212121]">{{ formatCurrency(tempSelectedPlan?.price) }}/{{ formatFrequency(tempSelectedPlan?.frequency) }}</span>?
      A mudança é imediata e o novo valor será cobrado na próxima renovação.
    </p>
  </FormModal>

  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200 ease-in-out"
      leave-active-class="transition-opacity duration-150 ease-in-out"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
      @after-enter="initCardForm"
    >
      <div v-if="paymentModal" class="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4">
        <div class="bg-white border border-[#E0E0E0] w-full max-w-lg rounded shadow-2xl max-h-[90vh] overflow-y-auto">
          <div class="p-6 border-b border-[#E0E0E0] flex justify-between items-center">
            <h2 class="text-xl font-black text-[#212121]">Mudar Cartão de Pagamento</h2>
            <button @click="closePaymentModal" class="p-2 text-[#757575] hover:text-[#212121] transition-colors">
              <X :size="20" />
            </button>
          </div>
          <div class="p-6">
            <div v-if="serverError" class="bg-danger-light border border-danger text-danger p-3 rounded mb-4 text-sm font-medium">
              {{ serverError }}
            </div>

            <div v-show="!isTokenizing">
              <div class="mb-4">
                <label class="block text-xs font-bold text-[#757575] uppercase tracking-wider mb-1.5">E-mail cadastrado no Mercado Pago</label>
                <input
                  v-model="payerEmail"
                  type="email"
                  placeholder="seu@email.com"
                  class="w-full border border-[#E0E0E0] rounded bg-white px-3 text-sm text-[#212121] placeholder-[#BDBDBD] focus:outline-none focus:border-primary transition-colors"
                  style="height: 42px;"
                />
              </div>
              <form id="mp-manager-card-form" class="space-y-4" @submit.prevent>
                <div>
                  <label class="block text-xs font-bold text-[#757575] uppercase tracking-wider mb-1.5">Número do cartão</label>
                  <div id="mp-mgr-cardNumber" class="w-full border border-[#E0E0E0] rounded bg-white" style="height: 42px;"></div>
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-bold text-[#757575] uppercase tracking-wider mb-1.5">Validade</label>
                    <div id="mp-mgr-expirationDate" class="w-full border border-[#E0E0E0] rounded bg-white" style="height: 42px;"></div>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-[#757575] uppercase tracking-wider mb-1.5">CVV</label>
                    <div id="mp-mgr-securityCode" class="w-full border border-[#E0E0E0] rounded bg-white" style="height: 42px;"></div>
                  </div>
                </div>
                <div>
                  <label class="block text-xs font-bold text-[#757575] uppercase tracking-wider mb-1.5">Nome no cartão</label>
                  <input
                    id="mp-mgr-cardholderName"
                    type="text"
                    placeholder="Como impresso no cartão"
                    class="w-full border border-[#E0E0E0] rounded bg-white px-3 text-sm text-[#212121] placeholder-[#BDBDBD] focus:outline-none focus:border-primary transition-colors"
                    style="height: 42px;"
                  />
                </div>
                <select id="mp-mgr-issuer" class="hidden"></select>
                <select id="mp-mgr-installments" class="hidden"></select>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-bold text-[#757575] uppercase tracking-wider mb-1.5">Tipo de documento</label>
                    <select
                      id="mp-mgr-identificationType"
                      class="w-full border border-[#E0E0E0] rounded bg-white px-3 text-sm text-[#212121] focus:outline-none focus:border-primary transition-colors"
                      style="height: 42px;"
                    ></select>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-[#757575] uppercase tracking-wider mb-1.5">Número do documento</label>
                    <input
                      id="mp-mgr-identificationNumber"
                      type="text"
                      placeholder="000.000.000-00"
                      class="w-full border border-[#E0E0E0] rounded bg-white px-3 text-sm text-[#212121] placeholder-[#BDBDBD] focus:outline-none focus:border-primary transition-colors"
                      style="height: 42px;"
                    />
                  </div>
                </div>
                <BaseButton type="submit" variant="primary" class="w-full">
                  Atualizar Cartão
                </BaseButton>
              </form>
            </div>

            <div v-if="isTokenizing" class="py-12 flex flex-col items-center justify-center gap-4">
              <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
              <p class="text-[#757575] font-medium text-sm">Processando...</p>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
