<script setup lang="ts">
import { ref } from 'vue'
import { Check, ArrowRight, ChefHat, CreditCard, Users, ChevronDown, Tablet } from 'lucide-vue-next'
import { PERMISSIONS } from '@/utils/permissions'

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
    expanded: false,
    allPerms: [
      { id: PERMISSIONS.COZINHA, label: 'Cozinha', checked: true },
      { id: PERMISSIONS.CAIXA, label: 'Caixa', checked: false },
      { id: PERMISSIONS.CRIAR_PEDIDO, label: 'Criar Pedido', checked: false },
    ],
  },
  {
    key: 'caixa',
    label: 'Caixa',
    desc: 'Processa pagamentos e fecha comandas.',
    icon: CreditCard,
    selected: false,
    expanded: false,
    allPerms: [
      { id: PERMISSIONS.COZINHA, label: 'Cozinha', checked: false },
      { id: PERMISSIONS.CAIXA, label: 'Caixa', checked: true },
      { id: PERMISSIONS.CRIAR_PEDIDO, label: 'Criar Pedido', checked: false },
    ],
  },
  {
    key: 'garcom',
    label: 'Garçom',
    desc: 'Anota pedidos no cardápio digital.',
    icon: Users,
    selected: false,
    expanded: false,
    allPerms: [
      { id: PERMISSIONS.COZINHA, label: 'Cozinha', checked: false },
      { id: PERMISSIONS.CAIXA, label: 'Caixa', checked: false },
      { id: PERMISSIONS.CRIAR_PEDIDO, label: 'Criar Pedido', checked: true },
    ],
  },
])

function toggleRole(role: (typeof staffRoles.value)[0]) {
  role.selected = !role.selected
  if (role.selected) {
    staffRoles.value.forEach((r) => { r.expanded = r.key === role.key })
  } else {
    role.expanded = false
  }
}

function expandRole(role: (typeof staffRoles.value)[0]) {
  staffRoles.value.forEach((r) => {
    r.expanded = r.key === role.key ? !r.expanded : false
  })
}

function togglePerm(role: (typeof staffRoles.value)[0], permId: string) {
  const p = role.allPerms.find((p) => p.id === permId)
  if (p) p.checked = !p.checked
}

function buildPayload(): RolePayload {
  return {
    roles: staffRoles.value
      .filter((r) => r.selected)
      .map((r) => ({
        label: r.label,
        permissions: r.allPerms.filter((p) => p.checked).map((p) => p.id),
      })),
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
        class="bg-white rounded border-2 transition-all duration-300 overflow-hidden"
        :class="role.selected ? 'border-accent' : 'border-[#E0E0E0]'"
      >
        <div class="flex items-center gap-4 p-4 cursor-pointer select-none" @click="toggleRole(role)">
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
          <div class="flex items-center gap-2 shrink-0">
            <div
              class="w-5 h-5 rounded border-2 flex items-center justify-center transition-colors"
              :class="role.selected ? 'bg-accent border-accent' : 'border-[#E0E0E0]'"
            >
              <Check v-if="role.selected" :size="12" class="text-black" stroke-width="4" />
            </div>
            <button
              @click.stop="expandRole(role)"
              class="p-1 rounded transition-colors hover:bg-gray-100"
              :class="role.expanded ? 'text-accent' : 'text-[#757575]'"
            >
              <ChevronDown :size="16" class="transition-transform duration-300" :class="role.expanded ? 'rotate-180' : ''" />
            </button>
          </div>
        </div>

        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="max-h-0 opacity-0"
          enter-to-class="max-h-96 opacity-100"
        >
          <div v-if="role.expanded" class="border-t border-[#E0E0E0] px-4 pb-4 overflow-hidden">
            <div class="flex flex-col gap-2 mt-4">
              <label
                v-for="perm in role.allPerms"
                :key="perm.id"
                class="flex items-center gap-3 p-3 rounded border cursor-pointer transition-all"
                :class="perm.checked ? 'bg-accent-light border-accent/30' : 'bg-gray-50 border-[#E0E0E0]'"
                @click.stop="togglePerm(role, perm.id)"
              >
                <div
                  class="w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors"
                  :class="perm.checked ? 'bg-accent border-accent' : 'border-[#E0E0E0]'"
                >
                  <Check v-if="perm.checked" :size="10" class="text-black" stroke-width="4" />
                </div>
                <span class="text-sm font-bold" :class="perm.checked ? 'text-accent' : 'text-[#757575]'">{{ perm.label }}</span>
              </label>
            </div>
          </div>
        </Transition>
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

    <button
      @click="handleNext"
      class="py-3.5 px-6 bg-primary text-white font-bold rounded text-base hover:bg-primary-dark transition-all flex items-center justify-center gap-3 w-full active:scale-[0.98] shadow-lg shadow-primary/30"
    >
      Continuar
      <ArrowRight class="w-5 h-5" />
    </button>

    <button
      @click="handleSkip"
      class="text-[#757575] text-sm font-bold hover:text-primary transition-colors mt-4 underline underline-offset-4 block mx-auto"
    >
      Pular por agora
    </button>
  </div>
</template>
