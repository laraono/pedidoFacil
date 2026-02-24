<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { ArrowLeft, CheckCircle, Trash, HelpCircle, PlusCircle, Users, CircleX } from 'lucide-vue-next';

import { PERMISSIONS } from '@/utils/permissions';
import { getRolesMock, saveRolesMock } from '@/mock/authmock';

const router = useRouter();
const authStore = useAuthStore();

const isLoading = ref(false);
const roles = ref([]);

const roleDescriptions = {
  Gerente: "Possui acesso total ao sistema.",
  Garçom: "Pode criar pedidos e enviar notificações."
};

const ALL_PERMISSIONS = [
  { key: PERMISSIONS.RELATORIOS, label: "Acessar Dashboard e Relatórios" },
  { key: PERMISSIONS.COZINHA, label: "Acessar Pedidos (Cozinha)" },
  { key: PERMISSIONS.ESTOQUE, label: "Gerenciar Estoque" },
  { key: PERMISSIONS.CARDAPIO, label: "Gerenciar Cardápio" },
  { key: PERMISSIONS.FUNCIONARIOS, label: "Gerenciar Funcionários" },
  { key: PERMISSIONS.CONFIGURACAO, label: "Configuração do Sistema" },
  { key: PERMISSIONS.ASSINATURA, label: "Gerenciar Assinatura" },
  { key: PERMISSIONS.CRIAR_PEDIDO, label: "Criar Pedido (Garçom)" },
  { key: PERMISSIONS.NOTIFICACOES, label: "Enviar Notificações" }
];

const errors = ref({});

onMounted(() => {
  roles.value = getRolesMock();
});

const addRole = () => {
  roles.value.push({
    id: Date.now(),
    name: 'Novo Cargo',
    permissions: []
  });
};

const removeRole = (id) => {
  if (id === 1) {
    alert("Não é possível remover o Gerente.");
    return;
  }

  roles.value = roles.value.filter(role => role.id !== id);
};

const saveRoles = async () => {
  isLoading.value = true;
  errors.value = {};
  let hasError = false;

  roles.value.forEach(role => {
    if (!role.name || role.name.trim().length < 3) {
      errors.value[role.id] = 'O nome do cargo deve ter pelo menos 3 caracteres.';
      hasError = true;
    }
  });

  if (hasError) {
    isLoading.value = false;
    return;
  }

  await saveRolesMock(roles.value);

  authStore.setConfigStepComplete('roles');
  isLoading.value = false;
  router.push('/app/dashboard');
};
</script>

<template>
  <main class="max-w-4xl mx-auto py-12 px-4 font-inter">
    
    <div class="flex items-center mb-8">
        <button @click="router.back()" class="p-2 text-gray-500 hover:text-gray-800 transition-colors mr-4 outline-none">
            <ArrowLeft :size="30" />
        </button>
        <h1 class="text-3xl font-bold text-gray-800 flex items-center tracking-tight">
          Cargos e Permissões
          <CheckCircle v-if="authStore.configStatus.roles" :size="24" class="text-green-500 ml-4" />
        </h1>
        <button @click="addRole"
                class="py-2.5 px-5 bg-brand-green text-white font-bold rounded-xl flex items-center hover:bg-brand-green-hover transition-all ml-auto shadow-md active:scale-95">
            <PlusCircle :size="20" class="mr-2" />
            Criar Cargo
        </button>
      </div>

      <div class="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-5 mb-8 rounded-r-xl shadow-sm" role="alert">
        <div class="flex items-center mb-1">
            <HelpCircle :size="20" class="mr-2 text-yellow-600" />
            <p class="font-bold">Dica de Configuração</p>
        </div>
        <p class="text-sm opacity-90 font-medium">Os cargos abaixo são sugestões padrão. Você pode personalizar as permissões de cada um ou criar novos cargos conforme a necessidade da sua equipe.</p>
      </div>
      
      <form @submit.prevent="saveRoles" class="space-y-6">
        <div v-for="role in roles" :key="role.id" class="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200 transition-all hover:shadow-md">
          <div class="flex justify-between items-start mb-6">
            <div class="w-full pr-4">
                <label class="text-xs uppercase tracking-widest text-gray-500 font-bold mb-2 flex items-center space-x-2">
                    <span>Nome do Cargo</span>
                    <span class="relative group">
                        <HelpCircle :size="16" class="text-brand-green cursor-help transition-colors" />
                        <div class="absolute left-full top-0 ml-2 w-48 p-3 bg-gray-900 text-white text-[10px] leading-relaxed rounded-xl opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-xl pointer-events-none">
                            {{ roleDescriptions[role.name] || 'Cargo customizado para funções específicas do estabelecimento.' }}
                        </div>
                    </span>
                </label>
                <input type="text" v-model="role.name" placeholder="Ex: Churrasqueiro" maxlength="50"
                       class="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green text-gray-900 placeholder-gray-400 outline-none transition-all font-semibold" />
                <p v-if="errors[role.id]" class="text-red-500 text-sm mt-2 font-medium flex items-center gap-1">
                  <CircleX :size="14" /> {{ errors[role.id] }}
                </p>
            </div>
            <button @click="removeRole(role.id)" 
                    type="button"
                    title="Excluir Cargo"
                    class="mt-7 p-2.5 rounded-xl transition-all outline-none"
                    :class="{ 
                        'text-red-500 hover:bg-red-50 active:scale-90': role.id > 4, 
                        'text-gray-200 cursor-not-allowed': role.id <= 4 
                    }"
                    :disabled="role.id <= 4"
            >
                <Trash :size="24" />
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-100">
            <div>
                <p class="text-sm font-bold text-gray-600 mb-4 uppercase tracking-wide">Permissões Habilitadas:</p>
                <div class="space-y-3">
                    <div v-for="perm in ALL_PERMISSIONS" :key="perm.key" class="flex items-center group cursor-pointer">
                        <input type="checkbox" :id="`${role.id}-${perm.key}`" :value="perm.key" 
                               v-model="role.permissions"
                               class="h-5 w-5 text-brand-green border-gray-300 rounded focus:ring-brand-green cursor-pointer transition-colors" />
                        <label :for="`${role.id}-${perm.key}`" class="ml-3 text-gray-600 text-sm font-medium cursor-pointer group-hover:text-gray-900 transition-colors">
                            {{ perm.label }}
                        </label>
                    </div>
                </div>
            </div>
            <div class="flex flex-col items-center justify-center bg-gray-50/50 rounded-2xl p-6 border border-gray-100/50">
                <Users :size="80" class="text-gray-200 mb-2" />
                <p class="text-[10px] text-gray-400 font-bold uppercase text-center leading-tight">Módulo de Acesso<br>Seguro PedidoFácil</p>
            </div>
          </div>
        </div>
        
        <div class="mt-10 pt-8 border-t border-gray-200 flex justify-end">
            <button type="submit" :disabled="isLoading"
                    class="py-4 px-12 bg-brand-green text-white font-extrabold rounded-2xl hover:bg-brand-green-hover transition-all active:scale-95 disabled:bg-gray-200 disabled:text-gray-400 shadow-lg shadow-brand-green/20">
                {{ isLoading ? 'Processando...' : 'Finalizar Configuração de Cargos' }}
            </button>
        </div>
      </form>
    </main>
</template>