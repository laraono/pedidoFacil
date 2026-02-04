<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useOnboardingStore } from '@/stores/onboarding'; // Para pré-preencher dados
import { ArrowLeft, CheckCircle, Upload } from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();
const onboardingStore = useOnboardingStore();

// Dados do Formulário (Inicializados com o valor 'ref()' para reatividade)
const nomeEstabelecimento = ref('');
const cnpj = ref('');
const endereco = ref('');
const metodosPagamento = ref([]);
const formasAtendimento = ref([]);
const isLoading = ref(false);

// Opções
const paymentOptions = ['Crédito', 'Débito', 'Dinheiro', 'Pix'];
const serviceOptions = ['Autoatendimento (totens)', 'Atendimento por garçons (tablets)', 'Atendimento no caixa'];

onMounted(() => {
    // PRÉ-PREENCHIMENTO COM DADOS DO ONBOARDING
    
    // 1. Nome do Estabelecimento (Etapa 2 do Onboarding)
    const nomeOnboarding = onboardingStore.estabelecimentoData.nome_estabelecimento;
    if (nomeOnboarding) {
        // Inicializa o ref com o nome salvo no Onboarding, tornando-o editável via v-model
        nomeEstabelecimento.value = nomeOnboarding;
    }
    
    // 2. Tipos de Atendimento (Etapa 3 do Onboarding)
    const tiposAtendimentoOnboarding = onboardingStore.estabelecimentoData.tipo_atendimento; 
    
    if (tiposAtendimentoOnboarding && tiposAtendimentoOnboarding.length > 0) {
        // Mapeia os tipos simples ('Autoatendimento', 'Garçom') para as opções completas do formulário
        const selectedForms = tiposAtendimentoOnboarding.map(tipo => {
            if (tipo === 'Autoatendimento') return 'Autoatendimento (totens)';
            if (tipo === 'Garçom') return 'Atendimento por garçons (tablets)';
            return '';
        }).filter(Boolean); // Filtra quaisquer valores vazios
        
        // Define o estado das checkboxes
        formasAtendimento.value = selectedForms;
    }
});

const saveInfo = () => {
    isLoading.value = true;
    
    // LÓGICA DE BYPASS: Simula a chamada e sucesso
    
    // 1. Marca o passo 'info' como concluído na Auth Store
    authStore.setConfigStepComplete('info'); 
    
    // 2. Redireciona para o Dashboard
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
          Informações do Estabelecimento
          <!-- Ícone de Check se o passo estiver completo -->
          <CheckCircle v-if="authStore.configStatus.info" :size="24" class="text-green-500 ml-4" />
        </h1>
    </div>

    <form @submit.prevent="saveInfo" class="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
        
        <!-- Coluna 1: Informações Gerais -->
        <div>
          <h2 class="text-2xl font-bold text-gray-800 mb-4">Informações gerais</h2>
          
          <div class="mb-6">
            <label for="nome" class="block text-gray-600 font-semibold mb-2">Nome do Estabelecimento:</label>
            <!-- v-model ligado ao ref inicializado com o valor da store, garantindo editabilidade -->
            <input type="text" id="nome" v-model="nomeEstabelecimento" placeholder="Digite o nome" required
                   class="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500" />
          </div>

          <div class="mb-6">
            <label for="cnpj" class="block text-gray-600 font-semibold mb-2">CNPJ:</label>
            <input type="text" id="cnpj" v-model="cnpj" placeholder="Digite o CNPJ"
                   class="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500" />
          </div>

          <div class="mb-6">
            <label for="endereco" class="block text-gray-600 font-semibold mb-2">Endereço:</label>
            <input type="text" id="endereco" v-model="endereco" placeholder="Digite o endereço completo"
                   class="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500" />
          </div>

          <div class="mb-6">
            <label class="block text-gray-600 font-semibold mb-2">Logo da Marca:</label>
            <div class="p-3 border border-gray-300 rounded-lg bg-gray-50 flex justify-between items-center text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors">
              <span>Fazer upload</span>
              <Upload :size="20" class="text-gray-500" />
            </div>
          </div>
        </div>

        <!-- Coluna 2: Configurações de Operação -->
        <div>
          <h2 class="text-2xl font-bold text-gray-800 mb-4">Configurações de Operação</h2>

          <div class="mb-8">
            <p class="block text-gray-600 font-semibold mb-3">Métodos de pagamento:</p>
            <div v-for="option in paymentOptions" :key="option" class="flex items-center mb-2">
              <input type="checkbox" :id="option" :value="option" v-model="metodosPagamento"
                     class="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
              <label :for="option" class="ml-3 text-gray-700">{{ option }}</label>
            </div>
          </div>

          <div class="mb-6">
            <p class="block text-gray-600 font-semibold mb-3">Formas de Atendimento:</p>
            <div v-for="option in serviceOptions" :key="option" class="flex items-center mb-2">
              <input type="checkbox" :id="option" :value="option" v-model="formasAtendimento"
                     class="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
              <label :for="option" class="ml-3 text-gray-700">{{ option }}</label>
            </div>
          </div>
        </div>
      </div>

      <!-- Botão de Ação -->
      <div class="mt-8 pt-6 border-t border-gray-200">
        <button type="submit" :disabled="isLoading"
                class="py-3 px-8 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400">
          {{ isLoading ? 'Salvando...' : 'Salvar Informações' }}
        </button>
      </div>
    </form>
  </main>
</template>