<script setup>
import { loadMercadoPago } from "@mercadopago/sdk-js";
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useSubscriptionStore } from '@/stores/subscriptions';
import { subscriptionApi } from "@/services/subscriptionApi";
import { planApi } from '@/services/planApi';
import { useRouter } from "vue-router";
import LandingHeader from "@/components/LandingHeader.vue";
import { Check } from 'lucide-vue-next';
import { v4 } from 'uuid';

const plans = ref([]);

const subscriptionStore = useSubscriptionStore();
const planId = ref(0);
const selectedPlan = ref(null);
const router = useRouter();
const showPayment = ref(false);
const error = ref(null);
const serverError = ref(null);
const isSubmitting = ref(false);

let mp = null;
let cardPaymentBrickController = null;

function normalizeFrequency(frequency) {
  const f = String(frequency ?? '').trim().toLowerCase();
  if (['anual', '12', 'annual', 'yearly'].includes(f)) return 'anual';
  if (['months', '1', 'mensal', 'monthly', 'month'].includes(f)) return 'mensal';
  if (['days', '30', 'diario', 'daily'].includes(f)) return 'diario';
  return f;
}

function formatFrequency(frequency) {
  const norm = normalizeFrequency(frequency);
  return { anual: 'ano', mensal: 'mês', diario: 'dia' }[norm] ?? 'mês';
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function isAnnual(plan) {
  return normalizeFrequency(plan?.frequency) === 'anual';
}

function parsedFeatures(features) {
  if (!features) return [];
  try { return JSON.parse(features); }
  catch { return features.split(',').map(f => f.trim()).filter(Boolean); }
}

const selectPlan = async (plan) => {
  serverError.value = null;
  error.value = null;

  if (cardPaymentBrickController) {
    try { await cardPaymentBrickController.unmount(); } catch (e) {}
    cardPaymentBrickController = null;
  }

  selectedPlan.value = plan;
  planId.value = plan.id;
  showPayment.value = true;

  await nextTick();
  requestAnimationFrame(() => { renderCardPaymentBrick(); });
};

const renderCardPaymentBrick = async () => {
  if (!selectedPlan.value || !mp) return;

  const basePrice = parseFloat(selectedPlan.value.price);
  const amount = isAnnual(selectedPlan.value) ? basePrice * 12 : basePrice;
  if (!amount || isNaN(amount)) {
    error.value = "Valor do plano inválido.";
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
      initialization: { amount },
      customization: {
        visual: { style: { theme: 'default' } },
        paymentMethods: {
          minInstallments: 1,
          maxInstallments: isAnnual(selectedPlan.value) ? 12 : 1,
        },
      },
      callbacks: {
        onReady: () => {},
        onSubmit: async (formData, additionalData) => {
          try {
            serverError.value = null;
            isSubmitting.value = true;

            const submitData = {
              preapproval_plan_id: planId.value,
              type: "online",
              total_amount: String(formData.transaction_amount),
              external_reference: v4(),
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

            await subscriptionApi.post(submitData, planId.value);
            router.push("/app/dashboard");
          } catch (err) {
            serverError.value = err?.message || "Erro ao registrar pagamento. Tente novamente.";
          } finally {
            isSubmitting.value = false;
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

const goBack = () => {
  showPayment.value = false;
  planId.value = 0;
  selectedPlan.value = null;
  error.value = null;

  if (cardPaymentBrickController) {
    cardPaymentBrickController.unmount();
    cardPaymentBrickController = null;
  }
};

onMounted(async () => {
  plans.value = await planApi.list();
  planId.value = subscriptionStore.getPlanToBeSubscribed() ?? 0;

  try {
    await loadMercadoPago();
    mp = new window.MercadoPago('APP_USR-639449eb-f800-4563-9304-f64989497a7a');

    if (planId.value && plans.value.length > 0) {
      const plan = plans.value.find(p => p.id === Number(planId.value));
      if (plan) await selectPlan(plan);
    }
  } catch (err) {
    console.error("Init error:", err);
    error.value = "Falha ao carregar o sistema de pagamento";
  }
});

onUnmounted(() => {
  if (cardPaymentBrickController) cardPaymentBrickController.unmount();
  subscriptionStore.setPlanToBeSubscribed(0);
});
</script>

<template>
  <div class="min-h-screen bg-page font-inter flex flex-col">
    <LandingHeader />

    <!-- Seleção de plano -->
    <div v-if="planId == 0" class="flex-1 px-4 py-14">
      <div class="max-w-4xl mx-auto">

        <div class="text-center mb-12">
          <h1 class="text-3xl font-black text-[#212121] mb-2">Escolha seu plano</h1>
          <p class="text-[#757575] text-base">Simples, transparente e sem surpresas.</p>
        </div>

        <div class="flex flex-wrap justify-center gap-6">
          <div
            v-for="plan in plans"
            :key="plan.id"
            @click="selectPlan(plan)"
            class="bg-white rounded-2xl border-2 border-[#E0E0E0] flex flex-col items-center px-8 py-10 w-full max-w-[320px] cursor-pointer shadow-sm hover:border-primary/60 hover:shadow-xl transition-all duration-200"
          >
            <span
              v-if="isAnnual(plan)"
              class="mb-4 inline-block bg-primary/10 text-primary text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full"
            >
              Melhor valor
            </span>

            <h3 class="text-[#212121] text-2xl font-black mb-4">{{ plan.name }}</h3>

            <div class="flex items-end gap-0.5 leading-none">
              <span class="text-5xl font-black text-[#212121]">{{ formatCurrency(plan.price) }}</span>
              <span class="text-base font-medium text-[#757575] mb-1">/mês</span>
            </div>

            <template v-if="isAnnual(plan)">
              <p class="text-xs text-[#757575] mt-1">Preço total anual: <span class="font-bold text-[#212121]">{{ formatCurrency(plan.price * 12) }}</span></p>
              <p class="text-xs text-[#757575]">Parcele em até 12× no cartão</p>
            </template>

            <ul v-if="parsedFeatures(plan.features).length" class="w-full mt-6 space-y-2 text-left">
              <li
                v-for="feat in parsedFeatures(plan.features)"
                :key="feat"
                class="flex items-center gap-3 text-sm text-[#757575]"
              >
                <Check :size="15" class="text-primary shrink-0" stroke-width="3" />
                {{ feat }}
              </li>
            </ul>

            <button class="bg-primary text-white font-bold py-3.5 px-6 rounded-xl w-full mt-8 uppercase tracking-wider hover:bg-primary-dark transition-colors active:scale-95">
              Escolher plano
            </button>
          </div>
        </div>

      </div>
    </div>

    <!-- Pagamento -->
    <div v-else class="flex-1 px-4 py-12">
      <div class="max-w-2xl mx-auto">

        <button @click="goBack" class="mb-6 flex items-center gap-2 text-[#757575] hover:text-primary transition-colors font-semibold">
          <span>←</span> Voltar para planos
        </button>

        <div class="bg-white rounded-2xl shadow-xl overflow-hidden border border-[#E0E0E0]">
          <div class="p-8 bg-gray-50 border-b border-[#E0E0E0]">
            <h2 class="text-2xl font-black text-[#212121]">{{ selectedPlan?.name }}</h2>
            <div class="flex items-baseline gap-2 mt-2">
              <p class="text-[#757575] text-sm">Total {{ isAnnual(selectedPlan) ? 'anual' : 'mensal' }}:</p>
              <span class="font-black text-primary text-xl">
                {{ formatCurrency(isAnnual(selectedPlan) ? selectedPlan?.price * 12 : selectedPlan?.price) }}
              </span>
            </div>
            <p v-if="isAnnual(selectedPlan)" class="text-xs text-[#757575] mt-1">
              {{ formatCurrency(selectedPlan?.price) }}/mês · Parcele em até 12× no cartão
            </p>
          </div>

          <div class="p-8">
            <transition
              enter-active-class="transition duration-300 ease-out"
              enter-from-class="transform scale-95 opacity-0"
              enter-to-class="transform scale-100 opacity-100"
            >
              <div v-if="serverError || error" class="mb-6 p-5 bg-red-50 border border-red-200 rounded-xl flex flex-col gap-2">
                <p class="font-bold text-red-800">Erro no pagamento</p>
                <p class="text-red-700 text-sm">{{ serverError || error }}</p>
                <p class="text-xs text-red-600/80">Verifique os dados do cartão ou o saldo e tente novamente.</p>
              </div>
            </transition>

            <div v-show="!isSubmitting" id="cardPaymentBrick_container"></div>

            <div v-if="isSubmitting" class="py-20 flex flex-col items-center justify-center gap-4">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p class="text-[#757575] font-medium">Processando seu pagamento...</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>
