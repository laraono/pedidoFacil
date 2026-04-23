<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useOnboardingStore } from '@/stores/onboarding';
import { useAuthStore } from '@/stores/auth';
import { Check, ArrowRight, ArrowLeft, Loader2, ChefHat, CreditCard, Users, ChevronDown, Tablet } from 'lucide-vue-next';
import { PERMISSIONS } from '@/utils/permissions';
import { authApi } from '@/services/authApi';
import LandingHeader from '@/components/LandingHeader.vue';

import imgOndas from '@/assets/ondas.png';

const router = useRouter();
const onboardingStore = useOnboardingStore();
const authStore = useAuthStore();

const totens = ref(false);
const isLoading = ref(false);
const serverError = ref(null);

const staffRoles = ref([
  {
    key: 'cozinheiro',
    label: 'Cozinha',
    desc: 'Recebe e gerencia os pedidos na fila.',
    icon: ChefHat,
    selected: false,
    expanded: false,
    permissions: [PERMISSIONS.COZINHA],
    allPerms: [
      { id: PERMISSIONS.COZINHA,             label: 'Cozinha',         checked: true },
      { id: PERMISSIONS.CAIXA,               label: 'Caixa',           checked: false },
      { id: PERMISSIONS.CRIAR_PEDIDO,        label: 'Criar Pedido',    checked: false },
    ],
  },
  {
    key: 'caixa',
    label: 'Caixa',
    desc: 'Processa pagamentos e fecha comandas.',
    icon: CreditCard,
    selected: false,
    expanded: false,
    permissions: [PERMISSIONS.CAIXA, PERMISSIONS.COMANDAS_FINALIZADAS],
    allPerms: [
      { id: PERMISSIONS.COZINHA,             label: 'Cozinha',         checked: false },
      { id: PERMISSIONS.CAIXA,               label: 'Caixa',           checked: true },
      { id: PERMISSIONS.CRIAR_PEDIDO,        label: 'Criar Pedido',    checked: false },
    ],
  },
  {
    key: 'garcom',
    label: 'Garçom',
    desc: 'Anota pedidos no cardápio digital.',
    icon: Users,
    selected: false,
    expanded: false,
    permissions: [PERMISSIONS.CRIAR_PEDIDO],
    allPerms: [
      { id: PERMISSIONS.COZINHA,             label: 'Cozinha',         checked: false },
      { id: PERMISSIONS.CAIXA,               label: 'Caixa',           checked: false },
      { id: PERMISSIONS.CRIAR_PEDIDO,        label: 'Criar Pedido',    checked: true },
    ],
  },
]);

onMounted(() => {
  try {
    const saved = JSON.parse(localStorage.getItem('onboarding_roles') || '{}');
    if (saved.totens !== undefined) totens.value = saved.totens;
    if (saved.staffRoles) {
      saved.staffRoles.forEach((saved: any) => {
        const role = staffRoles.value.find(r => r.key === saved.key);
        if (!role) return;
        role.selected = saved.selected;
        saved.allPerms?.forEach((sp: any) => {
          const perm = role.allPerms.find(p => p.id === sp.id);
          if (perm) perm.checked = sp.checked;
        });
      });
    }
  } catch {}
});

function saveRolesToStorage() {
  localStorage.setItem('onboarding_roles', JSON.stringify({
    totens: totens.value,
    staffRoles: staffRoles.value.map(r => ({
      key: r.key,
      selected: r.selected,
      allPerms: r.allPerms.map(p => ({ id: p.id, checked: p.checked })),
    })),
  }));
}

const nomeEstabelecimento = computed(() => {
  try {
    const personal = JSON.parse(localStorage.getItem('onboarding_personal') || '{}');
    return personal.nome_estabelecimento || onboardingStore.estabelecimentoData?.nome_estabelecimento || '';
  } catch {
    return onboardingStore.estabelecimentoData?.nome_estabelecimento || '';
  }
});

const getPersonalData = () => {
  try { return JSON.parse(localStorage.getItem('onboarding_personal') || '{}'); }
  catch { return {}; }
};

const skipRoles = ref(false);

const isSelectionValid = computed(() =>
  skipRoles.value || totens.value || staffRoles.value.some(r => r.selected)
);

const pularOnboarding = () => {
  skipRoles.value = true;
  finalizeRegistration();
};

const toggleStaffRole = (role) => {
  role.selected = !role.selected;
  if (role.selected) {
    staffRoles.value.forEach(r => { r.expanded = r.key === role.key; });
  } else {
    role.expanded = false;
  }
  saveRolesToStorage();
};

const expandRole = (role) => {
  staffRoles.value.forEach(r => { r.expanded = r.key === role.key ? !r.expanded : false; });
};

const togglePerm = (role, permId) => {
  const p = role.allPerms.find(p => p.id === permId);
  if (p) p.checked = !p.checked;
  saveRolesToStorage();
};

const goBack = () => {
  saveRolesToStorage();
  router.push('/onboarding/name');
};

const finalizeRegistration = async () => {
  serverError.value = null;
  const pessoalData = getPersonalData();
  if (!pessoalData.email || !nomeEstabelecimento.value) {
    serverError.value = 'Dados perdidos. Por favor, volte e preencha as etapas anteriores.';
    return;
  }
  if (!isSelectionValid.value) return;

  isLoading.value = true;

  try {
    const cargos = staffRoles.value
      .filter(r => r.selected)
      .map(r => ({
        nome: r.label,
        permissoes: r.allPerms.filter(p => p.checked).map(p => p.id),
      }));

    const { accessToken } = await authApi.register({
      nome_usuario: pessoalData.nome,
      email: pessoalData.email,
      senha: pessoalData.senha,
      nome_estabelecimento: nomeEstabelecimento.value,
      cnpj: pessoalData.cnpj,
      cargos: cargos.length ? cargos : undefined,
    });

    localStorage.setItem('accessToken', accessToken);

    const perfil = await authApi.me();
    const permissoes = typeof perfil.cargo.permissoes === 'string'
      ? JSON.parse(perfil.cargo.permissoes)
      : perfil.cargo.permissoes;

    const user = {
      id: perfil.usuario.id,
      name: perfil.usuario.nome,
      email: perfil.usuario.email,
      cargo: { id: perfil.cargo.id, name: perfil.cargo.nome, permissoes },
    };

    localStorage.setItem('user', JSON.stringify(user));
    localStorage.removeItem('onboarding_personal');
    localStorage.removeItem('onboarding_roles');
    onboardingStore.clearOnboarding();

    authStore.user = user;
    authStore.isAuthenticated = true;

    router.push('/app/dashboard');
  } catch (err) {
    console.error(err);
    serverError.value = err.message || 'Erro ao finalizar cadastro.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-page font-inter flex flex-col overflow-hidden">
    <LandingHeader />

    <div class="flex-1 relative flex flex-col items-center justify-center p-4 md:p-12">

    <div
      class="absolute top-1/2 left-0 w-full -translate-y-1/2 z-0 pointer-events-none opacity-40"
      :style="{ backgroundImage: `url(${imgOndas})` }"
      style="height: 70vh; background-size: cover; background-position: center; background-repeat: no-repeat;"
    ></div>

    <div class="z-10 w-full max-w-5xl text-center">

      <div class="inline-flex items-center justify-center px-4 py-1.5 rounded bg-gray-50 border border-[#E0E0E0] mb-6 md:mb-8 ">
        <span class="text-accent text-[10px] md:text-xs font-bold uppercase tracking-widest">Etapa 3 de 3</span>
      </div>

      <h1 class="text-2xl md:text-5xl font-bold text-[#212121] mb-4 md:mb-6 tracking-tight leading-tight">
        Como será o atendimento aos clientes?
      </h1>
      <p class="text-[#757575] text-sm md:text-lg mb-2 font-medium">
        Selecione os modelos que deseja habilitar no seu <span class="text-[#212121]">PedidoFácil</span>.
      </p>
      <p class="text-[#757575] text-xs mb-8 md:mb-12 font-medium">
        Você poderá alterar esses cargos depois em Configurações.
      </p>

      <transition enter-active-class="transition duration-300" enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0">
        <div v-if="serverError" class="bg-danger-light border border-danger text-danger p-3 rounded mb-6 inline-block font-medium text-sm">
          {{ serverError }}
          <button
            @click="goBack"
            class="ml-3 underline underline-offset-2 font-bold hover:opacity-70 transition-opacity"
          >Voltar e corrigir</button>
        </div>
      </transition>

      <div class="flex flex-col gap-3 mb-12 w-full max-w-xl mx-auto text-left">
        <p class="text-xs font-black uppercase tracking-widest text-[#757575] mb-1">Selecione os modelos que utilizará</p>

        <!-- Staff role accordion cards -->
        <div
          v-for="role in staffRoles"
          :key="role.key"
          class="bg-white  rounded border-2 transition-all duration-300 overflow-hidden"
          :class="role.selected ? 'border-accent ' : 'border-[#E0E0E0]'"
        >
          <div class="flex items-center gap-4 p-4 cursor-pointer select-none" @click="toggleStaffRole(role)">
            <div class="w-10 h-10 rounded border flex items-center justify-center shrink-0 transition-colors"
              :class="role.selected ? 'bg-accent-light border-accent/40' : 'bg-gray-50 border-[#E0E0E0]'">
              <component :is="role.icon" :size="18" :class="role.selected ? 'text-accent' : 'text-[#757575]'" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-bold text-sm" :class="role.selected ? 'text-accent' : 'text-[#212121]'">{{ role.label }}</p>
              <p class="text-[#757575] text-xs truncate">{{ role.desc }}</p>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <div class="w-5 h-5 rounded border-2 flex items-center justify-center transition-colors"
                :class="role.selected ? 'bg-accent border-accent' : 'border-[#E0E0E0]'">
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
            leave-active-class="transition-all duration-200 ease-in"
            leave-from-class="max-h-96 opacity-100"
            leave-to-class="max-h-0 opacity-0"
          >
            <div v-if="role.expanded" class="border-t border-[#E0E0E0] px-4 pb-4 overflow-hidden">
              <p class="text-[10px] font-black uppercase tracking-widest text-[#757575] mt-4 mb-3">Permissões para este cargo</p>
              <div class="flex flex-col gap-2">
                <label
                  v-for="perm in role.allPerms"
                  :key="perm.id"
                  class="flex items-center gap-3 p-3 rounded border cursor-pointer transition-all"
                  :class="perm.checked ? 'bg-accent-light border-accent/30' : 'bg-gray-50 border-[#E0E0E0] hover:bg-gray-50'"
                  @click.stop="togglePerm(role, perm.id)"
                >
                  <div class="w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors"
                    :class="perm.checked ? 'bg-accent border-accent' : 'border-[#E0E0E0]'">
                    <Check v-if="perm.checked" :size="10" class="text-black" stroke-width="4" />
                  </div>
                  <span class="text-sm font-bold" :class="perm.checked ? 'text-accent' : 'text-[#757575]'">{{ perm.label }}</span>
                </label>
              </div>
            </div>
          </Transition>
        </div>

        <div
          @click="totens = !totens; saveRolesToStorage()"
          class="bg-white  rounded border-2 transition-all duration-300 cursor-pointer select-none"
          :class="totens ? 'border-accent ' : 'border-[#E0E0E0] hover:border-[#E0E0E0]'"
        >
          <div class="flex items-center gap-4 p-4">
            <div class="w-10 h-10 rounded border flex items-center justify-center shrink-0 transition-colors"
              :class="totens ? 'bg-accent-light border-accent/40' : 'bg-gray-50 border-[#E0E0E0]'">
              <Tablet :size="18" :class="totens ? 'text-accent' : 'text-[#757575]'" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-bold text-sm" :class="totens ? 'text-accent' : 'text-[#212121]'">Autoatendimento</p>
              <p class="text-[#757575] text-xs truncate">Totens, tablets e QR Codes para pedidos sem garçom.</p>
            </div>
            <div class="w-5 h-5 rounded border-2 flex items-center justify-center transition-colors shrink-0"
              :class="totens ? 'bg-accent border-accent' : 'border-[#E0E0E0]'">
              <Check v-if="totens" :size="12" class="text-black" stroke-width="4" />
            </div>
          </div>
        </div>

      </div>

      <div class="flex flex-col items-center gap-4">
        <div class="flex gap-3 w-full max-w-xl justify-center">
          <button
            type="button"
            @click="goBack"
            :disabled="isLoading"
            class="flex items-center gap-2 px-5 py-4 rounded border border-[#E0E0E0] text-[#757575] font-semibold hover:border-[#212121] hover:text-[#212121] transition-colors disabled:opacity-40"
          >
            <ArrowLeft class="w-5 h-5" />
            Voltar
          </button>

          <button
            @click="finalizeRegistration"
            :disabled="isLoading || !isSelectionValid"
            class="flex-1 py-4 px-10 bg-primary text-white font-extrabold rounded text-lg hover:bg-primary-dark transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl shadow-primary/20 active:scale-95"
          >
            <Loader2 v-if="isLoading" class="w-5 h-5 animate-spin" />
            <span v-else>Finalizar e Acessar Sistema</span>
            <ArrowRight v-if="!isLoading" class="w-5 h-5" />
          </button>
        </div>

        <p v-if="!isSelectionValid" class="text-xs md:text-sm text-[#757575] font-bold uppercase tracking-widest animate-pulse">
          Selecione ao menos uma opção para prosseguir
        </p>

        <button
          @click="pularOnboarding"
          :disabled="isLoading"
          class="text-[#757575] text-sm font-bold hover:text-[#757575] transition-colors underline underline-offset-4 disabled:opacity-40"
        >
          Pular por agora
        </button>
      </div>

    </div>
    </div>
  </div>
</template>
