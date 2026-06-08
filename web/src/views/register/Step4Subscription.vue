<script setup lang="ts">
import { loadMercadoPago } from '@mercadopago/sdk-js'
import { ref, onBeforeUnmount, nextTick } from 'vue'
import { planApi } from '@/services/planApi'
import { Check } from 'lucide-vue-next'
import { useUtils } from '@/composables/useUtils'
import { BaseButton, BaseInput } from '@/components/ui'

const { formatCurrency, parsedFeatures } = useUtils()

const WIN = window as any
if (!WIN.__mpState) WIN.__mpState = { mp: null as any, cardForm: null as any, lastUnmountAt: 0 }

async function getOrCreateMp(): Promise<any> {
  if (WIN.__mpState.mp) return WIN.__mpState.mp
  await loadMercadoPago()
  WIN.__mpState.mp = new WIN.MercadoPago(import.meta.env.VITE_MP_PUBLIC_KEY, { locale: 'pt-BR' })
  return WIN.__mpState.mp
}

const props = defineProps<{ isSubmitting: boolean; payerEmail: string }>()
const emit = defineEmits<{
  submit: [payload: { planId: number; cardToken: string; payerEmail: string }]
}>()

const plans = ref<any[]>([])
const selectedPlan = ref<any>(null)
const showPayment = ref(false)
const error = ref<string | null>(null)
const isTokenizing = ref(false)
const mpPayerEmail = ref(props.payerEmail)

function isAnnual(plan: any) {
  return plan?.frequency === 'anual'
}

const initCardForm = async () => {
  const elapsed = Date.now() - WIN.__mpState.lastUnmountAt
  if (elapsed < 500) {
    await new Promise(resolve => setTimeout(resolve, 500 - elapsed))
  }

  let mp: any
  try {
    mp = await getOrCreateMp()
  } catch {
    error.value = 'Falha ao carregar o sistema de pagamento.'
    return
  }

  try {
    WIN.__mpState.cardForm = mp.cardForm({
      amount: Number(selectedPlan.value.price).toFixed(2),
      iframe: true,
      form: {
        id: 'mp-card-form',
        cardNumber: { id: 'mp-cardNumber', placeholder: '0000 0000 0000 0000' },
        expirationDate: { id: 'mp-expirationDate', placeholder: 'MM/AA' },
        securityCode: { id: 'mp-securityCode', placeholder: 'CVV' },
        cardholderName: { id: 'mp-cardholderName' },
        issuer: { id: 'mp-issuer', placeholder: 'Banco emissor' },
        installments: { id: 'mp-installments' },
        identificationType: { id: 'mp-identificationType' },
        identificationNumber: { id: 'mp-identificationNumber' },
      },
      callbacks: {
        onFormMounted: (err: any) => {
          if (err) { error.value = 'Erro ao carregar formulário de pagamento.'; console.error(err) }
        },
        onSubmit: async (event: any) => {
          event.preventDefault()
          if (props.isSubmitting || isTokenizing.value) return
          error.value = null
          isTokenizing.value = true
          try {
            const { token } = WIN.__mpState.cardForm.getCardFormData()
            if (!token) throw new Error('Não foi possível gerar o token. Verifique os dados do cartão.')
            emit('submit', {
              planId: selectedPlan.value.id,
              cardToken: token,
              payerEmail: mpPayerEmail.value,
            })
          } catch (err: any) {
            error.value = err.message || 'Erro ao processar cartão.'
          } finally {
            isTokenizing.value = false
          }
        },
        onError: (err: any) => {
          console.error('MP Card Form error:', err)
        },
      },
    })
  } catch (e: any) {
    error.value = 'Erro ao carregar formulário de pagamento.'
    console.error('cardForm init error:', e)
  }
}

const selectPlan = async (plan: any) => {
  error.value = null
  selectedPlan.value = plan
  showPayment.value = true
  if (!WIN.__mpState.cardForm) {
    await nextTick()
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
    await initCardForm()
  }
}

const goBack = () => {
  showPayment.value = false
  selectedPlan.value = null
  error.value = null
}

planApi.list().then(async data => {
  plans.value = data
  const pendingId = localStorage.getItem('pendingPlanId')
  if (pendingId) {
    localStorage.removeItem('pendingPlanId')
    const match = data.find((p: any) => String(p.id) === pendingId)
    if (match) await selectPlan(match)
  }
})

onBeforeUnmount(() => {
  try { WIN.__mpState.cardForm?.unmount() } catch {}
  WIN.__mpState.cardForm = null
  WIN.__mpState.lastUnmountAt = Date.now()
})
</script>

<template>
  <div>
    <div class="mb-6 text-center">
      <h2 class="text-2xl font-black text-[#212121] mb-2">Escolha seu plano</h2>
      <p class="text-[#757575] text-sm">Simples, transparente e sem surpresas.</p>
    </div>

    <div v-show="!showPayment" class="flex flex-col gap-4">
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

    <div v-show="showPayment">
      <BaseButton
        variant="ghost"
        class="mb-4 text-sm text-[#757575] hover:text-primary font-semibold"
        @click="goBack"
      >
        ← Voltar para planos
      </BaseButton>

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

      <div v-show="!isSubmitting && !isTokenizing">
        <div class="mb-4">
          <BaseInput
            v-model="mpPayerEmail"
            type="email"
            label="E-mail do pagante (MercadoPago)"
            placeholder="E-mail cadastrado no MercadoPago"
            :dark="false"
          />
          <p class="text-xs text-[#757575] mt-1">Pode ser diferente do e-mail de cadastro.</p>
        </div>

        <form id="mp-card-form" class="space-y-4" @submit.prevent>

          <div>
            <label class="block text-xs font-bold text-[#757575] uppercase tracking-wider mb-1.5">Número do cartão</label>
            <div id="mp-cardNumber" class="w-full border border-[#E0E0E0] rounded bg-white" style="height: 42px;"></div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-[#757575] uppercase tracking-wider mb-1.5">Validade</label>
              <div id="mp-expirationDate" class="w-full border border-[#E0E0E0] rounded bg-white" style="height: 42px;"></div>
            </div>
            <div>
              <label class="block text-xs font-bold text-[#757575] uppercase tracking-wider mb-1.5">CVV</label>
              <div id="mp-securityCode" class="w-full border border-[#E0E0E0] rounded bg-white" style="height: 42px;"></div>
            </div>
          </div>

          <select id="mp-issuer" class="hidden"></select>
          <select id="mp-installments" class="hidden"></select>

          <div>
            <label class="block text-xs font-bold text-[#757575] uppercase tracking-wider mb-1.5">Nome no cartão</label>
            <input
              id="mp-cardholderName"
              type="text"
              placeholder="Como impresso no cartão"
              class="w-full border border-[#E0E0E0] rounded bg-white px-3 text-sm text-[#212121] placeholder-[#BDBDBD] focus:outline-none focus:border-primary transition-colors"
              style="height: 42px;"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-[#757575] uppercase tracking-wider mb-1.5">Tipo de documento</label>
              <select
                id="mp-identificationType"
                class="w-full border border-[#E0E0E0] rounded bg-white px-3 text-sm text-[#212121] focus:outline-none focus:border-primary transition-colors"
                style="height: 42px;"
              ></select>
            </div>
            <div>
              <label class="block text-xs font-bold text-[#757575] uppercase tracking-wider mb-1.5">Número do documento</label>
              <input
                id="mp-identificationNumber"
                type="text"
                placeholder="000.000.000-00"
                class="w-full border border-[#E0E0E0] rounded bg-white px-3 text-sm text-[#212121] placeholder-[#BDBDBD] focus:outline-none focus:border-primary transition-colors"
                style="height: 42px;"
              />
            </div>
          </div>

          <BaseButton
            type="submit"
            variant="primary"
            size="lg"
            :disabled="isSubmitting || isTokenizing"
            class="w-full"
          >
            Confirmar Assinatura
          </BaseButton>
        </form>
      </div>

      <div v-if="isSubmitting || isTokenizing" class="py-16 flex flex-col items-center justify-center gap-4">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
        <p class="text-[#757575] font-medium text-sm">Processando seu pagamento...</p>
      </div>
    </div>
  </div>
</template>
