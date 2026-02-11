<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
// Importamos os ícones que serão usados
import { ArrowLeft, CheckCircle, Trash, HelpCircle, PlusCircle, Users } from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();

const isLoading = ref(false);

// Definição das descrições dos cargos para o tooltip "?"
const roleDescriptions = {
    Gerente: "Possui acesso total ao sistema, incluindo configurações financeiras e de funcionários.",
    Caixa: "Responsável por finalizar pedidos e gerenciar o fluxo de comandas prontas para entrega.",
    Cozinha: "Acesso limitado, apenas visualiza e gerencia o status de pedidos 'em preparo'.",
    Garçom: "Pode abrir e adicionar itens a novas comandas (pedidos)."
};

// Simulação das permissões do backend (app/utils/permissions.js)
const ALL_PERMISSIONS = [
    { key: "Controle de Estoque", label: "Controle de Estoque" },
    { key: "Acesso a Histórico de Pedidos", label: "Histórico de Pedidos" },
    { key: "Acesso à lista de Pedidos Prontos", label: "Pedidos Prontos" },
    { key: "Enviar notificações", label: "Enviar notificações" },
    { key: "Acesso à lista de Pedidos em preparo", label: "Pedidos em preparo" },
    { key: "Pode criar Pedidos (Garçom)", label: "Criar Pedidos (Garçom)" }
];

// Dados dos cargos (pré-seleção baseada em cargos padrão do backend)
const roles = ref([
    { 
        id: 1, 
        name: 'Gerente', 
        permissions: ["Controle de Estoque", "Acesso a Histórico de Pedidos", "Enviar notificações"] 
    },
    { 
        id: 2, 
        name: 'Caixa', 
        permissions: ["Acesso à lista de Pedidos Prontos", "Enviar notificações"] 
    },
    { 
        id: 3, 
        name: 'Cozinha', 
        permissions: ["Acesso à lista de Pedidos em preparo", "Acesso à lista de Pedidos Prontos"] 
    },
    { 
        id: 4, 
        name: 'Garçom', 
        permissions: ["Pode criar Pedidos (Garçom)", "Enviar notificações"] 
    },
]);

// Funções
const addRole = () => {
    roles.value.push({
        id: Date.now(), // ID temporário para a interface
        name: 'Novo Cargo',
        permissions: []
    });
};

const removeRole = (id) => {
    // Apenas permite remover cargos criados dinamicamente (id > 4)
    if (id > 4) {
        roles.value = roles.value.filter(role => role.id !== id);
    } else {
        alert("Não é possível remover cargos padrão (Gerente, Caixa, Cozinha, Garçom).");
    }
};

const saveRoles = () => {
    isLoading.value = true;
    
    // LÓGICA DE BYPASS: Simula a chamada e sucesso no frontend
    
    // Marca o passo 'roles' como concluído na Auth Store
    authStore.setConfigStepComplete('roles'); 
    
    // Redireciona para o Dashboard
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
          <!-- Ícone de Check se o passo estiver completo -->
          <CheckCircle v-if="authStore.configStatus.roles" :size="24" class="text-green-500 ml-4" />
        </h1>
        <button @click="addRole"
                class="py-2 px-4 bg-green-600 text-white font-semibold rounded-lg flex items-center hover:bg-green-700 transition-colors ml-auto">
            <PlusCircle :size="20" class="mr-2" />
            Criar Cargo
        </button>
      </div>

      <!-- Aviso de Recomendações -->
      <div class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded-lg" role="alert">
        <div class="flex items-center">
            <HelpCircle :size="20" class="mr-2" />
            <p class="font-bold">Recomendação:</p>
        </div>
        <p class="text-sm">Os cargos abaixo são sugestões padrão com permissões básicas já pré-marcadas para agilizar sua configuração inicial.</p>
      </div>
      
      <!-- Lista de Cargos (Cards) -->
      <form @submit.prevent="saveRoles" class="space-y-6">
        <div v-for="role in roles" :key="role.id" class="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <div class="flex justify-between items-start mb-4">
            <div class="w-full pr-4">
                <p class="text-gray-600 font-semibold mb-2 flex items-center space-x-2">
                    <span>Cargo</span>
                    
                    <!-- ÍCONE DE AJUDA/DESCRIÇÃO DO CARGO: AUMENTADO PARA 20 e AZUL -->
                    <span class="relative group">
                        <HelpCircle :size="20" class="text-blue-500 cursor-help hover:text-blue-700 transition-colors" />
                        <div class="absolute left-full top-0 ml-2 w-48 p-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-lg whitespace-normal">
                            {{ roleDescriptions[role.name] || 'Cargo customizado sem descrição.' }}
                        </div>
                    </span>
                </p>
                <!-- Input com Placeholder/Texto Escuro -->
                <input type="text" v-model="role.name" placeholder="Nome do cargo" required
                       class="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500" />
            </div>
            
            <!-- CONTÊINER DO ÍCONE DE DELETAR (Lixeira) -->
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
                <!-- ÍCONE DE LIXEIRA: AUMENTADO PARA 24 E VERMELHO -->
                <Trash :size="24" />
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
            <!-- Permissões -->
            <div>
                <p class="text-gray-600 font-semibold mb-3">Permissões do cargo:</p>
                <div v-for="perm in ALL_PERMISSIONS" :key="perm.key" class="flex items-center mb-2">
                    <input type="checkbox" :id="`${role.id}-${perm.key}`" :value="perm.key" 
                           v-model="role.permissions"
                           class="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                    <label :for="`${role.id}-${perm.key}`" class="ml-3 text-gray-700 text-sm">{{ perm.label }}</label>
                </div>
            </div>
            <!-- Coluna Vazia para Layout/Imagem UX -->
            <div>
                <Users :size="120" class="text-gray-200 hidden md:block mx-auto mt-4" />
            </div>
          </div>
        </div>
        
        <!-- Botão de Ação -->
        <div class="mt-8 pt-6 border-t border-gray-200">
            <button type="submit" :disabled="isLoading"
                    class="py-3 px-8 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400">
                {{ isLoading ? 'Salvando...' : 'Salvar Cargos e Permissões' }}
            </button>
        </div>
      </form>
    </main>
</template>