<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { ArrowLeft, CheckCircle, Trash, HelpCircle, PlusCircle, Users } from 'lucide-vue-next';

import { PERMISSIONS } from '@/utils/permissions';
import { getRolesMock, saveRolesMock } from '@/mock/rolesmock';

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

  await saveRolesMock(roles.value);

  authStore.setConfigStepComplete('roles');
  isLoading.value = false;

  router.push('/app/dashboard');
};
</script>

<template>
  <main class="max-w-4xl mx-auto py-12 px-4">
    
    <div class="flex items-center mb-8">
        <button @click="router.back()" class="p-2 text-gray-500 hover:text-gray-800 transition-colors mr-4">
            <ArrowLeft :size="30" />
        </button>
        <h1 class="text-3xl font-bold text-gray-800 flex items-center">
          Cargos e Permissões
          <CheckCircle v-if="authStore.configStatus.roles" :size="24" class="text-green-500 ml-4" />
        </h1>
        <button @click="addRole"
                class="py-2 px-4 bg-green-600 text-white font-semibold rounded-lg flex items-center hover:bg-green-700 transition-colors ml-auto">
            <PlusCircle :size="20" class="mr-2" />
            Criar Cargo
        </button>
      </div>

      <div class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded-lg" role="alert">
        <div class="flex items-center">
            <HelpCircle :size="20" class="mr-2" />
            <p class="font-bold">Recomendação:</p>
        </div>
        <p class="text-sm">Os cargos abaixo são sugestões padrão com permissões básicas já pré-marcadas para agilizar sua configuração inicial.</p>
      </div>
      
      <form @submit.prevent="saveRoles" class="space-y-6">
        <div v-for="role in roles" :key="role.id" class="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <div class="flex justify-between items-start mb-4">
            <div class="w-full pr-4">
                <p class="text-gray-600 font-semibold mb-2 flex items-center space-x-2">
                    <span>Cargo</span>
                    <span class="relative group">
                        <HelpCircle :size="20" class="text-blue-500 cursor-help hover:text-blue-700 transition-colors" />
                        <div class="absolute left-full top-0 ml-2 w-48 p-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-lg whitespace-normal">
                            {{ roleDescriptions[role.name] || 'Cargo customizado sem descrição.' }}
                        </div>
                    </span>
                </p>
                <input type="text" v-model="role.name" placeholder="Nome do cargo" required
                       class="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500" />
            </div>
            <button @click="removeRole(role.id)" 
                    type="button"
                    title="Excluir Cargo"
                    class="mt-8 p-2 transition-colors"
                    :class="{ 
                        'text-red-600 hover:text-red-700 cursor-pointer': role.id > 4, 
                        'text-gray-300 cursor-not-allowed': role.id <= 4 
                    }"
                    :disabled="role.id <= 4"
            >
                <Trash :size="24" />
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
            <div>
                <p class="text-gray-600 font-semibold mb-3">Permissões do cargo:</p>
                <div v-for="perm in ALL_PERMISSIONS" :key="perm.key" class="flex items-center mb-2">
                    <input type="checkbox" :id="`${role.id}-${perm.key}`" :value="perm.key" 
                           v-model="role.permissions"
                           class="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                    <label :for="`${role.id}-${perm.key}`" class="ml-3 text-gray-700 text-sm">{{ perm.label }}</label>
                </div>
            </div>
            <div>
                <Users :size="120" class="text-gray-200 hidden md:block mx-auto mt-4" />
            </div>
          </div>
        </div>
        
        <div class="mt-8 pt-6 border-t border-gray-200">
            <button type="submit" :disabled="isLoading"
                    class="py-3 px-8 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400">
                {{ isLoading ? 'Salvando...' : 'Salvar Cargos e Permissões' }}
            </button>
        </div>
      </form>
    </main>
</template>