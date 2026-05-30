<script setup lang="ts">
import { loadMercadoPago } from '@mercadopago/sdk-js'
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { planApi } from '@/services/planApi'
import { Check } from 'lucide-vue-next'
import { v4 } from 'uuid'

function formatCurrency(value: number | string | undefined) {
  return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const props = defineProps<{ isSubmitting: boolean }>()
const emit = defineEmits<{
  submit: [payload: { planId: number; payment: unknown }]
}>()

const plans = ref<any[]>([])
const selectedPlan = ref<any>(null)
const showPayment = ref(false)
const error = ref<string | null>(null)

let mp: any = null
let cardPaymentBrickController: any = null

function isAnnual(plan: any) {
  return plan?.frequency === 'anual'
}

function parsedFeatures(features: any): string[] {
  if (!features) return []
  try { return JSON.parse(features) }
  catch { return String(features).split(',').map((f: string) => f.trim()).filter(Boolean) }
}

const selectPlan = async (plan: any) => {
  error.value = null
  if (cardPaymentBrickController) {
    try { await cardPaymentBrickController.unmount() } catch {}
    cardPaymentBrickController = null
  }
  selectedPlan.value = plan
  showPayment.value = true
  await nextTick()
  requestAnimationFrame(renderCardPaymentBrick)
}

const renderCardPaymentBrick = async () => {
  if (!selectedPlan.value || !mp) return

  const amount = parseFloat(selectedPlan.value.price)
  if (!amount || isNaN(amount)) { error.value = 'Valor do plano inválido.'; return }

  const container = document.getElementById('cardPaymentBrick_container')
  if (!container) { error.value = 'Formulário de pagamento não pôde ser carregado.'; return }

  try {
    container.innerHTML = ''
    cardPaymentBrickController = await mp.bricks().create('cardPayment', 'cardPaymentBrick_container', {
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
        onSubmit: async (formData: any, additionalData: any) => {
          emit('submit', {
            planId: selectedPlan.value.id,
            payment: {
              type: 'online',
              external_reference: v4(),
              processing_mode: 'automatic',
              transactions: {
                payments: [{
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
              },
            },
          })
        },
        onError: () => { error.value = 'Erro no sistema de pagamento.' },
      },
    })
  } catch (err: any) {
    error.value = err.message
  }
}

const goBack = () => {
  showPayment.value = false
  selectedPlan.value = null
  error.value = null
  if (cardPaymentBrickController) {
    cardPaymentBrickController.unmount()
    cardPaymentBrickController = null
  }
}

onMounted(async () => {
  plans.value = await planApi.list()
  try {
    await loadMercadoPago()
    mp = new (window as any).MercadoPago(import.meta.env.VITE_MP_PUBLIC_KEY)
  } catch {
    error.value = 'Falha ao carregar o sistema de pagamento.'
  }
})

onUnmounted(() => {
  if (cardPaymentBrickController) cardPaymentBrickController.unmount()
})
</script>

<template>
  <div>
    <div class="mb-6 text-center">
      <h2 class="text-2xl font-black text-[#212121] mb-2">Escolha seu plano</h2>
      <p class="text-[#757575] text-sm">Simples, transparente e sem surpresas.</p>
    </div>

    <!-- Seleção de plano -->
    <div v-if="!showPayment" class="flex flex-col gap-4">
      <div
        v-for="plan in plans"
        :key="plan.id"
        @click="selectPlan(plan)"
        class="bg-gray-50 rounded-xl border-2 border-[#E0E0E0] flex flex-col px-6 py-6 cursor-pointer hover:border-primary/60 hover:shadow-md transition-all duration-200"
      >
        <span
          v-if="isAnnual(plan)"
          class="mb-2 inline-block self-start bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
        >
          Melhor valor
        </span>

        <h3 class="text-[#212121] text-lg font-black mb-1">{{ plan.name }}</h3>

        <div class="flex items-end gap-0.5 leading-none mb-1">
          <span class="text-3xl font-black text-[#212121]">{{ formatCurrency(plan.price / (isAnnual(plan) ? 12 : 1)) }}</span>
          <span class="text-sm font-medium text-[#757575] mb-0.5">/mês</span>
        </div>

        <p v-if="isAnnual(plan)" class="text-xs text-[#757575]">
          Total anual: <span class="font-bold text-[#212121]">{{ formatCurrency(plan.price) }}</span> · Parcele em até 12×
        </p>

        <ul v-if="parsedFeatures(plan.features).length" class="mt-4 space-y-1.5">
          <li
            v-for="feat in parsedFeatures(plan.features)"
            :key="feat"
            class="flex items-center gap-2 text-xs text-[#757575]"
          >
            <Check :size="12" class="text-primary shrink-0" stroke-width="3" />
            {{ feat }}
          </li>
        </ul>
      </div>
    </div>

    <!-- Pagamento -->
    <div v-else>
      <button
        @click="goBack"
        class="mb-4 flex items-center gap-1 text-sm text-[#757575] hover:text-primary transition-colors font-semibold"
      >
        ← Voltar para planos
      </button>

      <div class="bg-gray-50 rounded-xl border border-[#E0E0E0] p-4 mb-4">
        <p class="font-black text-[#212121]">{{ selectedPlan?.name }}</p>
        <p class="text-sm text-[#757575] mt-0.5">
          Total {{ isAnnual(selectedPlan) ? 'anual' : 'mensal' }}:
          <span class="font-black text-primary">{{ formatCurrency(selectedPlan?.price) }}</span>
        </p>
      </div>

      <transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
      >
        <div v-if="error" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p class="font-bold text-red-800 text-sm">Erro no pagamento</p>
          <p class="text-red-700 text-xs mt-1">{{ error }}</p>
        </div>
      </transition>

      <div v-show="!isSubmitting" id="cardPaymentBrick_container" />

      <div v-if="isSubmitting" class="py-16 flex flex-col items-center justify-center gap-4">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
        <p class="text-[#757575] font-medium text-sm">Processando seu pagamento...</p>
      </div>
    </div>
  </div>
</template>
