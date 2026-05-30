<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Store, Building2, ArrowRight, Loader2 } from 'lucide-vue-next'
import { isValidCNPJ, maskCNPJ } from '@/utils/validator'
import { establishmentApi } from '@/services/establishmentApi'

interface EstablishmentData {
  nome: string
  cnpj: string
}

const props = defineProps<{ initial: EstablishmentData }>()
const emit = defineEmits<{ next: [data: EstablishmentData] }>()

const nome = ref(props.initial.nome)
const cnpj = ref(props.initial.cnpj)

const isLoading = ref(false)
const apiErrors = ref<Record<string, string>>({})

watch(cnpj, (val) => {
  const masked = maskCNPJ(val)
  if (masked !== val) cnpj.value = masked
  if (apiErrors.value.cnpj) delete apiErrors.value.cnpj
})

watch(nome, () => {
  if (apiErrors.value.nome) delete apiErrors.value.nome
})

const errors = computed(() => {
  const e: Record<string, string> = { ...apiErrors.value }

  if (nome.value && nome.value.trim().length < 3)
    e.nome ??= 'Informe o nome do estabelecimento (mín. 3 caracteres).'
  if (cnpj.value && !isValidCNPJ(cnpj.value))
    e.cnpj ??= 'O CNPJ inserido é inválido.'

  return e
})

const canSubmit = computed(() =>
  nome.value.trim().length >= 3 &&
  isValidCNPJ(cnpj.value) &&
  !isLoading.value,
)

async function handleNext() {
  if (!canSubmit.value) return
  apiErrors.value = {}
  isLoading.value = true
  try {
    await establishmentApi.checkCnpj(cnpj.value.replace(/\D/g, ''))
    emit('next', { nome: nome.value.trim(), cnpj: cnpj.value })
  } catch (err: any) {
    apiErrors.value.cnpj = err.message || 'Este CNPJ já está cadastrado.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div>
    <div class="mb-8 text-center">
      <h2 class="text-3xl font-black text-[#212121] mb-2">Seu estabelecimento</h2>
      <p class="text-[#757575]">Informe o nome e CNPJ do seu negócio</p>
    </div>

    <form @submit.prevent="handleNext" class="flex flex-col gap-5">
      <div class="flex flex-col gap-1">
        <label class="flex items-center gap-1.5 text-xs font-bold text-[#757575] uppercase tracking-wider">
          <Store class="w-4 h-4" />
          Nome do Estabelecimento
        </label>
        <input
          v-model="nome"
          type="text"
          placeholder="Ex: Pizzaria Sabor de Casa"
          maxlength="100"
          :disabled="isLoading"
          class="w-full p-4 bg-gray-50 text-[#212121] rounded border text-base placeholder-gray-400 focus:outline-none focus:bg-gray-100 transition-all disabled:opacity-50"
          :class="errors.nome ? 'border-red-500 bg-red-500/5' : 'border-[#E0E0E0] focus:border-primary/50'"
        />
        <p v-if="errors.nome" class="text-red-500 text-xs font-bold">{{ errors.nome }}</p>
      </div>

      <div class="flex flex-col gap-1">
        <label class="flex items-center gap-1.5 text-xs font-bold text-[#757575] uppercase tracking-wider">
          <Building2 class="w-4 h-4" />
          CNPJ
        </label>
        <input
          v-model="cnpj"
          type="text"
          placeholder="00.000.000/0000-00"
          maxlength="18"
          :disabled="isLoading"
          class="w-full p-4 bg-gray-50 text-[#212121] rounded border text-base placeholder-gray-400 focus:outline-none focus:bg-gray-100 transition-all disabled:opacity-50"
          :class="errors.cnpj ? 'border-red-500 bg-red-500/5' : 'border-[#E0E0E0] focus:border-primary/50'"
        />
        <p v-if="errors.cnpj" class="text-red-500 text-xs font-bold">{{ errors.cnpj }}</p>
      </div>

      <button
        type="submit"
        :disabled="!canSubmit"
        class="mt-2 py-3.5 px-6 bg-primary text-white font-bold rounded text-base hover:bg-primary-dark shadow-lg shadow-primary/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-3 group active:scale-[0.98] w-full"
      >
        <Loader2 v-if="isLoading" class="w-5 h-5 animate-spin" />
        <span v-else>Continuar</span>
        <ArrowRight v-if="!isLoading" class="w-5 h-5 transition-transform group-hover:translate-x-1" />
      </button>
    </form>
  </div>
</template>