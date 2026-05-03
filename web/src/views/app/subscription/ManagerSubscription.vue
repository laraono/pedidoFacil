<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useSubscriptionStore } from '@/stores/subscriptions';
import { subscriptionApi } from '@/services/subscriptionApi';
import { planApi } from '@/services/planApi';
import { loadMercadoPago } from "@mercadopago/sdk-js";
import {
  ArrowLeft, CreditCard, Calendar, CheckCircle2, AlertTriangle,
  Clock, History, Banknote, RefreshCw, X, ChevronRight, ArrowLeftRight, Info
} from 'lucide-vue-next';

const error = ref('')
const plans = ref([])
const sub = ref()
const currentPlan = ref({})
const isLoading = ref(true)
const history = ref([])

onMounted(async () => {
  plans.value = await planApi.list()
  sub.value = await subscriptionApi.getEstablishmentSubscription()
  history.value = await subscriptionApi.getSubscriptionHistory()
      currentPlan.value = sub.value.plan
   error.value = localStorage.getItem('subscriptionError')
   try {
        await loadMercadoPago();
        mp = new window.MercadoPago('APP_USR-639449eb-f800-4563-9304-f64989497a7a');
        console.log("MercadoPago ready");
    } catch (err) {
        console.error("Init error:", err);
        error.value = "Failed to load payment system";
    }
})

const router = useRouter();

const subscriptionStore = useSubscriptionStore()

const daysUntilDue = computed((sub) => {
  if (!sub.value.expirationDate) return null;
  const diff = new Date(sub.value.expirationDate).getTime() - new Date().getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

const isActive = computed(() => {
  if (!sub.value) return false 
  return sub.value.status === 'Pendente' || sub.value.status === 'Ativa'
});

const isPaymentModalOpen = ref(false);
const selectedMethod = ref('');

const PAYMENT_METHODS = ['Cartão de Crédito', 'Pix', 'Boleto Bancário'];

const statusConfig = computed(() => {
  const s = sub.value?.status;
  if (s === 'ativo') return { label: 'Ativa', color: 'text-accent', bg: 'bg-accent-light border-accent/30' };
  if (s === 'expirado') return { label: 'Expirada', color: 'text-danger', bg: 'bg-danger-light border-danger' };
  return { label: 'Desativada', color: 'text-[#757575]', bg: 'bg-gray-200/20 border-[#E0E0E0]' };
});

const formattedDueDate = computed(() => {
  if (!sub.value?.nextDueDate) return '—';
  return new Date(sub.value.nextDueDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
});

// Plan switching
const isPlanModalOpen = ref(false);
const selectedNewPlan = ref('');

const paymentModal = ref(false)
const isRestoring = ref(false)

const openPlanModal = () => {
  selectedNewPlan.value = currentPlan.value;
  isPlanModalOpen.value = true;
};

const confirmPlanChange = () => {
  if (!selectedNewPlan.value || selectedNewPlan.value === sub.value?.plan) {
    isPlanModalOpen.value = false;
    return;
  }
  subscriptionStore.setPlanToBeSubscribed(selectedNewPlan.value);
  isPlanModalOpen.value = false;

  openCardModal(false)

};

const cancelPendingPlan = () => {
  subscriptionStore.setPendingPlan(null);
};

let mp = null;
let cardPaymentBrickController = null;

const openCardModal = async (restore) => {
    paymentModal.value = true
    isRestoring.value = restore

    if (cardPaymentBrickController) {
        try {
            await cardPaymentBrickController.unmount();
        } catch(e) {}
        cardPaymentBrickController = null;
    }

    await nextTick();
    
    requestAnimationFrame(() => {
        renderCardPaymentBrick();
    });
};

function diffMeses(dataInicio, dataFim, consideraDia = true) {
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);

    let meses = (fim.getFullYear() - inicio.getFullYear()) * 12 + (fim.getMonth() - inicio.getMonth());

    if (consideraDia && inicio.getDate() > fim.getDate()) {
        meses--;
    }

    return meses;
}

const closePaymentModal = () => {
    paymentModal.value = false
    isRestoring.value = false
  }

const renderCardPaymentBrick = async () => {
    
    if (!sub.value) {
        console.error("No selected plan");
        return;
    }
    
        const container = document.getElementById("cardPaymentBrick_container");
        const meses = diffMeses(sub.value.initialDate, sub.value.expirationDate)

        console.log('MESES', meses)
        
        if (container) {
            try {
                container.innerHTML = '';
                
                const settings = {
                    initialization: {
                        amount: parseFloat(sub.value.price) * meses,
                    },
                    customization: {
                        visual: {
                            style: {
                                theme: 'default'
                            }
                        },
                        paymentMethods: {
                            minInstallments: meses,
                            maxInstallments: meses,
                        },
                    },
                    callbacks: {
                        onReady: () => {
                        },
                        onSubmit: async (formData, additionalData) => {
                            try {
                                serverError.value = null;

                                const submitData = {
                                    type: "online",
                                    total_amount: String(formData.transaction_amount), 
                                    external_reference: v4(), 
                                    processing_mode: "automatic",
                                    transactions: {
                                        payments: [
                                            {
                                                amount: String(formData.transaction_amount), 
                                                payment_method: {
                                                    id: formData.payment_method_id,
                                                    type: additionalData.paymentTypeId,
                                                    token: formData.token,
                                                    installments: formData.installments,
                                                },
                                            },
                                        ],
                                    },
                                    payer: {
                                        email: formData.payer.email,
                                        identification: formData.payer.identification,
                                    }
                                };

                                if(isRestoring) {
                                  await subscriptionApi.restoreSubscription(sub.value.id, submitData);
                                } else {
                                  await subscriptionApi.post(submitData, subscriptionStore.getPlanToBeSubscribed())
                                }
                            } catch (err) {
                                console.error("Payment error:", err);
                                error.value = "Payment failed";
                                serverError.value = err.message || "Erro ao registrar o estabelecimento. Tente novamente.";
                            }
                        },
                        onError: (error) => {
                            console.error("Brick error:", error);
                            error.value = "Payment system error";
                        },
                    },
                };
                
                cardPaymentBrickController = await mp.bricks().create(
                    "cardPayment",
                    "cardPaymentBrick_container",
                    settings
                );
                return true;
            } catch (err) {
                console.error("Render error:", err);
                error.value = err.message;
                return false;
            }
        } else {
            console.error("Container never found");
            error.value = "Payment form failed to load";
        }
    
    await renderCardPaymentBrick();
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
            <span class="text-xs text-[#757575] font-bold uppercase tracking-wider">Plano {{ currentPlan?.name  }}</span>
          </div>
          <p class="text-4xl font-black text-[#212121]"> R$ {{ sub?.price }}</p>
          <p class="text-[#757575] text-sm mt-1">cobrado mensalmente</p>
        </div>

        <button
          @click="openCardModal(true)"
          class="shrink-0 flex items-center gap-2 px-6 py-3.5 rounded font-black text-sm uppercase tracking-wider transition-all active:scale-95"
          :class="isActive ? 'bg-primary text-white hover:bg-primary-dark' : 'bg-danger text-white hover:bg-red-600'"
        >
          <CreditCard :size="16" />
          {{ isActive ? 'Mudar Cartão de Pagamento' : 'Reativar Assinatura' }}
        </button>
      </div>

      <div v-if="paymentModal" class="bg-amber-50 border border-amber-400/50 rounded p-5 flex items-start gap-4">
        <div class="modal-content">
            <div class="modal-header flex justify-between items-center p-4 border-b">
                <h2 class="text-xl font-semibold">Detalhes do pagamento</h2>
                <button @click="closePaymentModal" class="close-button text-gray-500 hover:text-gray-700">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            
            <div class="modal-body p-6">
                <div class="bg-white rounded-lg shadow-md p-6">
                    <div id="cardPaymentBrick_container" style="min-height: 450px; width: 100%;"></div>
                </div>
            </div>
        </div>
      </div>

      <!-- Troca de plano pendente -->
      <div v-if="selectedNewPlan" class="bg-amber-50 border border-amber-400/50 rounded p-5 flex items-start gap-4">
        <Info :size="18" class="text-amber-500 shrink-0 mt-0.5" />
        <div class="flex-1">
          <p class="text-sm font-bold text-[#212121]">Alteração de plano agendada</p>
          <p class="text-xs text-[#757575] mt-1">
            Seu plano será alterado para
            <span class="font-black text-[#212121]">{{ selectedNewPlan.name}}</span>
            a partir da próxima renovação.
          </p>
        </div>
        <button @click="cancelPendingPlan" class="text-[#757575] hover:text-red-500 transition-colors shrink-0">
          <X :size="16" />
        </button>
      </div>

      <!-- Alternar plano -->
      <div class="bg-white border border-[#E0E0E0] rounded p-6 flex items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#757575] mb-1">
            <ArrowLeftRight :size="14" />
            Plano Atual
          </div>
          <p class="text-lg font-black text-[#212121]">{{ currentPlan?.name }}</p>
          <p class="text-xs text-[#757575] mt-0.5">{{ sub?.price }}</p>
        </div>
        <button
          @click="openPlanModal"
          class="flex items-center gap-2 px-4 py-2.5 rounded border border-[#E0E0E0] text-[#757575] font-bold text-sm hover:border-accent hover:text-accent transition-all"
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

        <div v-if="history?.length" class="divide-y divide-white/5">
          <div
            v-for="payment in history"
            :key="payment.id"
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
                :key="plan"
                @click="selectedNewPlan = plan"
                :class="selectedNewPlan === plan
                  ? 'border-accent bg-accent-light'
                  : 'border-[#E0E0E0] bg-gray-50 hover:border-[#E0E0E0]'"
                class="flex items-center justify-between p-4 rounded border cursor-pointer transition-all"
              >
                <div class="flex items-center gap-3">
                  <div class="w-5 h-5 rounded border-2 flex items-center justify-center"
                    :class="selectedNewPlan === plan ? 'border-accent' : 'border-zinc-400'">
                    <div v-if="selectedNewPlan === plan" class="w-2.5 h-2.5 rounded bg-accent" />
                  </div>
                  <div>
                    <p class="font-bold text-sm" :class="selectedNewPlan === plan ? 'text-accent' : 'text-[#212121]'">
                      {{ plan?.name }}
                    </p>
                    <p class="text-xs text-[#757575]">
                      R$ {{ plan.price }}/mês
                    </p>
                  </div>
                </div>
                <span v-if="plan.id === sub?.plan.id" class="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-accent-light text-accent rounded border border-accent/30">Atual</span>
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
                :disabled="selectedNewPlan === sub?.plan"
                class="flex-1 py-3 rounded font-black text-sm uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-2"
                :class="(selectedNewPlan !== sub?.plan)
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
