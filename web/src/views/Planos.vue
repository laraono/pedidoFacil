<!-- src/views/Planos.vue -->
<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useOnboardingStore } from '@/stores/onboarding';
import { User, CheckCircle } from 'lucide-vue-next'; 
import PlanConfirmationModal from '@/components/PlanConfirmationModal.vue'; // <-- Importa o Modal Corretamente

const router = useRouter();
const onboardingStore = useOnboardingStore();

// Gerenciamento do estado do Modal
const isModalVisible = ref(false);
const planToConfirm = ref({});

// Dados dos planos (usados no card e no modal)
const plansData = {
    Mensal: {
        name: 'Mensal',
        price: '79.90',
        description: 'Ideal para testar a plataforma e desfrutar de todas as funcionalidades básicas de gestão e cardápio digital.',
        features: ['Suporte ao Usuário', 'Relatórios de Desempenho', 'Automação do Sistema']
    },
    Anual: {
        name: 'Anual',
        price: '49.90',
        description: 'Melhor custo-benefício, inclui todos os recursos e garante maior estabilidade e prioridade no suporte técnico.',
        features: ['Suporte ao Usuário', 'Relatórios de Desempenho', 'Automação do Sistema', 'Maior Estabilidade']
    }
};

// Funções de Navegação
const navigateToLogin = () => router.push('/login');
const navigateToHome = () => router.push('/');

/**
 * Abre o modal preenchendo os dados do plano clicado.
 * @param {string} planType - 'Mensal' ou 'Anual'.
 */
const openModal = (planType) => {
    planToConfirm.value = plansData[planType];
    isModalVisible.value = true;
};

/**
 * Fecha o modal.
 */
const closeModal = () => {
    isModalVisible.value = false;
};

/**
 * Ação final de confirmação do modal.
 * Salva na Store e navega para o cadastro.
 * @param {string} planName - O nome do plano.
 */
const finalizePlanSelection = (planName) => {
    closeModal(); // Fecha o modal
    onboardingStore.selectPlan(planName); // Salva na Pinia Store
    router.push('/register'); // Navega para o Cadastro (Etapa 1: Dados Pessoais)
};
</script>

<template>
  <div class="min-h-screen bg-black text-white font-sans flex flex-col items-center">
    
    <!-- HEADER -->
    <header class="w-full max-w-7xl mx-auto flex justify-between items-center py-6 px-4 md:px-8">
      <div class="text-xl font-bold text-[#00ff6a] cursor-pointer" @click="navigateToHome">FoodSystem</div>
      <nav class="flex space-x-8">
        <a @click="() => {}" class="text-gray-300 hover:text-[#00ff6a] transition-colors cursor-pointer">Sobre</a>
        <a @click="router.push('/planos')" class="text-[#00ff6a] font-bold">Planos</a>
        <a @click="() => {}" class="text-gray-300 hover:text-[#00ff6a] transition-colors cursor-pointer">Contato</a>
      </nav>
      <button @click="navigateToLogin" class="flex items-center space-x-2 text-gray-300 hover:text-[#00ff6a] transition-colors cursor-pointer">
        <span>Login</span>
        <User :size="20" />
      </button>
    </header>

    <!-- TÍTULO -->
    <h1 class="text-5xl font-bold mt-16 mb-12">Escolha seu plano</h1>

    <!-- CARDS DE PLANOS (Estilo dos cards: Fundo escuro e layout lado a lado) -->
    <div class="flex flex-col md:flex-row gap-8 max-w-4xl w-full px-4">
      
      <!-- Card Mensal -->
      <div class="flex-1 bg-[#1A1A1A] p-8 rounded-xl shadow-lg flex flex-col items-center">
        <h2 class="text-4xl font-extrabold text-[#00ff6a] mb-4">{{ plansData.Mensal.name }}</h2>
        <p class="text-5xl font-black text-white mb-8">R${{ plansData.Mensal.price.replace('.', ',') }}<span class="text-xl text-gray-400">/mês</span></p>
        
        <ul class="space-y-4 mb-10 text-lg text-gray-300 w-full text-left">
          <li v-for="feature in plansData.Mensal.features" :key="feature" class="flex items-center space-x-3">
            <CheckCircle :size="24" class="text-[#00ff6a]" />
            <span>{{ feature }}</span>
          </li>
        </ul>

        <!-- Botão que abre o modal -->
        <button @click="openModal('Mensal')"
                class="w-full py-4 bg-white text-black text-xl font-bold rounded-lg hover:bg-gray-200 transition-colors duration-300">
          Confirmar
        </button>
      </div>

      <!-- Card Anual -->
      <div class="flex-1 bg-[#1A1A1A] p-8 rounded-xl shadow-lg flex flex-col items-center">
        <h2 class="text-4xl font-extrabold text-[#00ff6a] mb-4">{{ plansData.Anual.name }}</h2>
        <p class="text-5xl font-black text-white mb-8">R${{ plansData.Anual.price.replace('.', ',') }}<span class="text-xl text-gray-400">/mês</span></p>
        
        <ul class="space-y-4 mb-10 text-lg text-gray-300 w-full text-left">
          <li v-for="feature in plansData.Anual.features" :key="feature" class="flex items-center space-x-3">
            <CheckCircle :size="24" class="text-[#00ff6a]" />
            <span>{{ feature }}</span>
          </li>
        </ul>

        <!-- Botão que abre o modal -->
        <button @click="openModal('Anual')"
                class="w-full py-4 bg-white text-black text-xl font-bold rounded-lg hover:bg-gray-200 transition-colors duration-300">
          Confirmar
        </button>
      </div>
    </div>
  </div>

  <!-- Componente Modal de Confirmação (Renderizado fora do container principal) -->
  <PlanConfirmationModal
    :isVisible="isModalVisible"
    :plan="planToConfirm"
    @close="closeModal"
    @confirm="finalizePlanSelection"
  />
</template>