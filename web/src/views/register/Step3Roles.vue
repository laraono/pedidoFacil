<script setup lang="ts">
import { ref } from 'vue'
import { Check, ArrowRight, ChefHat, CreditCard, Users, Tablet } from 'lucide-vue-next'
import { PERMISSIONS } from '@/utils/permissions'
import { BaseButton } from '@/components/ui'

interface RolePayload {
  roles: Array<{ label: string; permissions: string[] }>
  hasTotem: boolean
}

const emit = defineEmits<{ next: [payload: RolePayload] }>()

const hasTotem = ref(false)

const staffRoles = ref([
  {
    key: 'cozinheiro',
    label: 'Cozinha',
    desc: 'Recebe e gerencia os pedidos na fila.',
    icon: ChefHat,
    selected: false,
    perms: [PERMISSIONS.COZINHA],
  },
  {
    key: 'caixa',
    label: 'Caixa',
    desc: 'Processa pagamentos e fecha comandas.',
    icon: CreditCard,
    selected: false,
    perms: [PERMISSIONS.CAIXA],
  },
  {
    key: 'garcom',
    label: 'Garçom',
    desc: 'Anota pedidos no cardápio digital.',
    icon: Users,
    selected: false,
    perms: [PERMISSIONS.CRIAR_PEDIDO],
  },
])

function toggleRole(role: (typeof staffRoles.value)[0]) {
  role.selected = !role.selected
}

function buildPayload(): RolePayload {
  return {
    roles: staffRoles.value
      .filter((r) => r.selected)
      .map((r) => ({ label: r.label, permissions: r.perms })),
    hasTotem: hasTotem.value,
  }
}

function handleNext() {
  emit('next', buildPayload())
}

function handleSkip() {
  emit('next', { roles: [], hasTotem: false })
}
</script>

<template>
  <div>
    <div class="mb-8 text-center">
      <h2 class="text-2xl font-black text-[#212121] mb-2">Como será o atendimento?</h2>
      <p class="text-[#757575] text-sm">Selecione os cargos que sua equipe vai usar. Pode pular e configurar depois.</p>
    </div>

    <div class="flex flex-col gap-3 mb-6">
      <div
        v-for="role in staffRoles"
        :key="role.key"
        class="bg-white rounded border-2 transition-all duration-300 cursor-pointer select-none"
        :class="role.selected ? 'border-accent' : 'border-[#E0E0E0]'"
        @click="toggleRole(role)"
      >
        <div class="flex items-center gap-4 p-4">
          <div
            class="w-9 h-9 rounded border flex items-center justify-center shrink-0 transition-colors"
            :class="role.selected ? 'bg-accent-light border-accent/40' : 'bg-gray-50 border-[#E0E0E0]'"
          >
            <component :is="role.icon" :size="16" :class="role.selected ? 'text-accent' : 'text-[#757575]'" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-bold text-sm" :class="role.selected ? 'text-accent' : 'text-[#212121]'">{{ role.label }}</p>
            <p class="text-[#757575] text-xs truncate">{{ role.desc }}</p>
          </div>
          <div
            class="w-5 h-5 rounded border-2 flex items-center justify-center transition-colors shrink-0"
            :class="role.selected ? 'bg-accent border-accent' : 'border-[#E0E0E0]'"
          >
            <Check v-if="role.selected" :size="12" class="text-black" stroke-width="4" />
          </div>
        </div>
      </div>

      <div
        @click="hasTotem = !hasTotem"
        class="bg-white rounded border-2 transition-all duration-300 cursor-pointer select-none"
        :class="hasTotem ? 'border-accent' : 'border-[#E0E0E0]'"
      >
        <div class="flex items-center gap-4 p-4">
          <div
            class="w-9 h-9 rounded border flex items-center justify-center shrink-0 transition-colors"
            :class="hasTotem ? 'bg-accent-light border-accent/40' : 'bg-gray-50 border-[#E0E0E0]'"
          >
            <Tablet :size="16" :class="hasTotem ? 'text-accent' : 'text-[#757575]'" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-bold text-sm" :class="hasTotem ? 'text-accent' : 'text-[#212121]'">Autoatendimento (Totem)</p>
            <p class="text-[#757575] text-xs">Clientes fazem pedidos pelo cardápio digital</p>
          </div>
          <div
            class="w-5 h-5 rounded border-2 flex items-center justify-center transition-colors shrink-0"
            :class="hasTotem ? 'bg-accent border-accent' : 'border-[#E0E0E0]'"
          >
            <Check v-if="hasTotem" :size="12" class="text-black" stroke-width="4" />
          </div>
        </div>
      </div>
    </div>

    <BaseButton
      variant="brand"
      size="lg"
      :icon="ArrowRight"
      class="w-full"
      @click="handleNext"
    >
      Continuar
    </BaseButton>

    <div class="flex justify-center mt-4">
      <BaseButton
        variant="ghost"
        class="text-sm underline underline-offset-4"
        @click="handleSkip"
      >
        Pular por agora
      </BaseButton>
    </div>
  </div>
</template>
