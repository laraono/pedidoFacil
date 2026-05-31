<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { authApi } from '@/services/authApi'
import { ArrowLeft } from 'lucide-vue-next'
import LandingHeader from '@/components/LandingHeader.vue'
import imgOndas from '@/assets/ondas.png'
import Step1Account from './register/Step1Account.vue'
import Step2Establishment from './register/Step2Establishment.vue'
import Step3Roles from './register/Step3Roles.vue'
import Step4Subscription from './register/Step4Subscription.vue'

const router = useRouter()
const authStore = useAuthStore()

if (authStore.isAuthenticated) router.push('/app/dashboard')

const step = ref(1)
const serverError = ref('')
const isSubmitting = ref(false)

const account = reactive({ nome: '', email: '', cpf: '', senha: '', confirmarSenha: '' })
const establishment = reactive({ nome: '', cnpj: '' })
const roles = ref<Array<{ label: string; permissions: string[] }>>([])
const hasTotem = ref(false)

function nextStep() {
  serverError.value = ''
  step.value++
}

function prevStep() {
  serverError.value = ''
  step.value--
}

function onStep1Next(data: typeof account) {
  Object.assign(account, data)
  nextStep()
}

function onStep2Next(data: typeof establishment) {
  Object.assign(establishment, data)
  nextStep()
}

function onStep3Next(payload: { roles: typeof roles.value; hasTotem: boolean }) {
  roles.value = payload.roles
  hasTotem.value = payload.hasTotem
  nextStep()
}

async function handlePaymentSubmit(payload: { planId: number; cardToken: string; payerEmail: string }) {
  serverError.value = ''
  isSubmitting.value = true
  try {
    const res = await authApi.registerComplete({
      nome_usuario: account.nome,
      email: account.email,
      cpf: account.cpf,
      senha: account.senha,
      establishment: { name: establishment.nome, cnpj: establishment.cnpj },
      roles: roles.value,
      hasTotem: hasTotem.value,
      planId: payload.planId,
      payment: { cardToken: payload.cardToken, payerEmail: payload.payerEmail },
    })
    if (res.accessToken) localStorage.setItem('accessToken', res.accessToken)
    authStore.setUserFromOnboarding(res)
    router.push('/app/dashboard')
  } catch (err: any) {
    serverError.value = err.message || 'Erro ao finalizar cadastro. Tente novamente.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-page font-inter flex flex-col">
    <LandingHeader />

    <div class="flex-1 relative flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div
        class="absolute top-0 left-0 w-full h-full z-0 pointer-events-none opacity-40"
        :style="{ backgroundImage: `url(${imgOndas})`, backgroundSize: 'cover', backgroundPosition: 'center' }"
      />

      <div class="z-10 w-full max-w-xl">
        <button
          v-if="step > 1"
          @click="prevStep"
          class="mb-4 flex items-center gap-2 text-[#757575] hover:text-[#212121] transition-colors font-semibold text-sm"
        >
          <ArrowLeft class="w-4 h-4" />
          Voltar
        </button>

        <div class="bg-white border border-[#E0E0E0] p-8 sm:p-12 rounded shadow-2xl">
          <div class="mb-8 text-center">
            <div class="inline-flex items-center justify-center px-4 py-1.5 rounded bg-gray-50 border border-[#E0E0E0]">
              <span class="text-accent text-xs font-bold uppercase tracking-widest">
                Etapa {{ step }} de 4
              </span>
            </div>
          </div>

          <transition
            enter-active-class="transition duration-300"
            enter-from-class="opacity-0 -translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
          >
            <div
              v-if="serverError"
              class="mb-6 p-4 bg-danger-light border border-danger rounded text-danger font-bold text-sm"
            >
              {{ serverError }}
            </div>
          </transition>

          <Step1Account
            v-if="step === 1"
            :initial="account"
            @next="onStep1Next"
          />
          <Step2Establishment
            v-else-if="step === 2"
            :initial="establishment"
            @next="onStep2Next"
          />
          <Step3Roles
            v-else-if="step === 3"
            @next="onStep3Next"
          />
          <Step4Subscription
            v-else-if="step === 4"
            :isSubmitting="isSubmitting"
            :payerEmail="account.email"
            @submit="handlePaymentSubmit"
          />
        </div>

        <p v-if="step === 1" class="text-center text-[#757575] font-medium text-sm mt-6">
          Já tem uma conta?
          <a
            href="#"
            @click.prevent="router.push('/login')"
            class="text-accent hover:text-[#212121] transition-colors cursor-pointer font-bold"
          >Faça login aqui</a>
        </p>
      </div>
    </div>
  </div>
</template>
