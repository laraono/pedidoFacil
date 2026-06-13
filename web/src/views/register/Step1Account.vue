<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Eye, EyeOff, UserPlus } from 'lucide-vue-next'
import { BaseInput, BaseButton } from '@/components/ui'
import { isValidCPF, maskCPF } from '@/utils/validator'
import { validatePasswordStrength, isPasswordStrong } from '@/utils/password'
import { authApi } from '@/services/authApi'
import { planApi } from '@/services/planApi'

interface AccountData {
  nome: string
  email: string
  cpf: string
  senha: string
  confirmarSenha: string
}

const props = defineProps<{ initial: AccountData }>()
const emit = defineEmits<{ next: [data: AccountData] }>()

const nome = ref(props.initial.nome)
const email = ref(props.initial.email)
const cpf = ref(props.initial.cpf)
const senha = ref(props.initial.senha)
const confirmarSenha = ref(props.initial.confirmarSenha)

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isLoading = ref(false)
const apiErrors = ref<Record<string, string>>({})
const noPlans = ref(false)

onMounted(async () => {
  try {
    const plans = await planApi.list()
    noPlans.value = plans.length === 0
  } catch {
    noPlans.value = false
  }
})

const errors = computed(() => {
  const e: Record<string, string> = { ...apiErrors.value }

  if (nome.value && nome.value.length > 100)
    e.nome ??= 'Nome muito longo (máx. 100 caracteres).'
  if (nome.value && !/^[a-zA-ZÀ-ÿ\s]+$/.test(nome.value))
    e.nome ??= 'O nome não pode conter números ou caracteres especiais.'
  if (nome.value && !nome.value.trim().includes(' '))
    e.nome ??= 'Por favor, insira seu nome e sobrenome.'
  if (email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()))
    e.email ??= 'Insira um e-mail válido.'
  if (cpf.value && !isValidCPF(cpf.value))
    e.cpf ??= 'Insira um CPF válido.'
  if (senha.value) {
    const senhaErr = validatePasswordStrength(senha.value)
    if (senhaErr) e.senha ??= senhaErr
  }
  if (confirmarSenha.value && senha.value !== confirmarSenha.value)
    e.confirmarSenha ??= 'As senhas não coincidem.'

  return e
})

const canSubmit = computed(() =>
  nome.value.trim().includes(' ') &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()) &&
  isPasswordStrong(senha.value) &&
  senha.value === confirmarSenha.value &&
  !isLoading.value,
)

function onCpfInput(event: Event) {
  const input = event.target as HTMLInputElement
  const masked = maskCPF(input.value)
  cpf.value = masked
  input.value = masked
}

async function handleNext() {
  if (!canSubmit.value) return
  apiErrors.value = {}
  isLoading.value = true
  try {
    await Promise.all([
      authApi.checkEmail(email.value.trim()),
      cpf.value ? authApi.checkCpf(cpf.value.replace(/\D/g, '')) : Promise.resolve(),
    ])
    emit('next', {
      nome: nome.value.trim(),
      email: email.value.trim(),
      cpf: cpf.value.replace(/\D/g, ''),
      senha: senha.value,
      confirmarSenha: confirmarSenha.value,
    })
  } catch (err: any) {
    const msg: string = err.message || ''
    if (msg.toLowerCase().includes('cpf')) apiErrors.value.cpf = msg
    else apiErrors.value.email = msg
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div>
    <div class="mb-8 text-center">
      <h2 class="text-3xl font-black text-[#212121] mb-2">Crie a sua conta</h2>
      <p class="text-[#757575]">Preencha os dados do gestor principal</p>
    </div>

    <div v-if="noPlans" class="mb-6 p-4 bg-danger-light border border-danger rounded text-danger text-sm font-bold text-center">
      Cadastro indisponível no momento. Nenhum plano está ativo. Entre em contato com o administrador.
    </div>

    <form @submit.prevent="handleNext" class="space-y-5" :class="{ 'pointer-events-none opacity-40': noPlans }">
      <BaseInput v-model="nome" label="Nome Completo" placeholder="Ex: João da Silva" dark :error="errors.nome" />

      <BaseInput v-model="email" label="E-mail de Acesso" type="email" placeholder="Ex: joao@restaurante.com" dark :error="errors.email" />

      <BaseInput v-model="cpf" label="CPF" placeholder="000.000.000-00" dark maxlength="14" :error="errors.cpf" @input="onCpfInput" />

      <BaseInput v-model="senha" label="Senha" :type="showPassword ? 'text' : 'password'" placeholder="••••••••" dark :error="errors.senha">
        <template #suffix>
          <button type="button" @click="showPassword = !showPassword" class="absolute right-4 top-1/2 -translate-y-1/2 text-[#757575] hover:text-accent">
            <component :is="showPassword ? EyeOff : Eye" class="w-5 h-5" />
          </button>
        </template>
      </BaseInput>

      <BaseInput v-model="confirmarSenha" label="Confirme sua Senha" :type="showConfirmPassword ? 'text' : 'password'" placeholder="••••••••" dark :error="errors.confirmarSenha">
        <template #suffix>
          <button type="button" @click="showConfirmPassword = !showConfirmPassword" class="absolute right-4 top-1/2 -translate-y-1/2 text-[#757575] hover:text-accent">
            <component :is="showConfirmPassword ? EyeOff : Eye" class="w-5 h-5" />
          </button>
        </template>
      </BaseInput>

      <div class="pt-4">
        <BaseButton type="submit" variant="brand" size="lg" class="w-full" :isLoading="isLoading" :disabled="!canSubmit" :icon="UserPlus">
          Continuar
        </BaseButton>
      </div>
    </form>
  </div>
</template>