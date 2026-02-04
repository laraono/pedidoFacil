<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useOnboardingStore } from '@/stores/onboarding';
import { useAuthStore } from '@/stores/auth';
import { Check } from 'lucide-vue-next';

// Assets
const BG_WAVES_URL = '/assets/bg-waves.jpg'; 
const MOCKUP_TOTEM_URL = '/assets/image-3-totem.jpg'; 
const MOCKUP_GARCOM_URL = '/assets/image-25-garcom.jpg'; 

// Router & Stores
const router = useRouter();
const onboardingStore = useOnboardingStore();
const authStore = useAuthStore();

// Estados
const totens = ref(false);
const garcons = ref(false);
const isLoading = ref(false);
const serverError = ref(null);

// Dados do onboarding
const nomeEstabelecimento = computed(
  () => onboardingStore.estabelecimentoData?.nome_estabelecimento || ''
);

const pessoalData = JSON.parse(
  localStorage.getItem('onboarding_personal') || '{}'
);

// Validação geral
const isDataReady = computed(() => {
  return (
    pessoalData.email &&
    pessoalData.senha &&
    nomeEstabelecimento.value &&
    (totens.value || garcons.value)
  );
});

// 🔥 FINALIZAÇÃO COM MOCK
const finalizeRegistration = async () => {
  if (!isDataReady.value) {
    serverError.value = 'Dados incompletos. Recomece o cadastro.';
    return;
  }

  isLoading.value = true;
  serverError.value = null;

  try {
    // Define tipo de atendimento
    let tipo_atendimento = 'Mesa';
    if (totens.value) tipo_atendimento = 'Autoatendimento';
    else if (garcons.value) tipo_atendimento = 'Garçom';

    // 🔹 MOCK DO USUÁRIO
    const mockUser = {
      id: Date.now(),
      nome: pessoalData.nome,
      email: pessoalData.email,
      estabelecimento: {
        nome: nomeEstabelecimento.value,
        tipo_atendimento
      }
    };

    // 🔹 SALVA "USUÁRIO REGISTRADO"
    localStorage.setItem('user', JSON.stringify(mockUser));

    // 🔹 LIMPA ONBOARDING
    localStorage.removeItem('onboarding_personal');
    onboardingStore.clearOnboarding();

    // 🔹 LOGIN MOCK
    authStore.user = mockUser;
    authStore.isAuthenticated = true;

    // 🔹 REDIRECIONA
    router.push('/app/dashboard');

  } catch (err) {
    console.error(err);
    serverError.value = 'Erro ao finalizar cadastro (mock).';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-black relative flex flex-col items-center justify-center p-6 md:p-12 overflow-hidden">
    
    <!-- Fundo de Ondas e Overlay -->
    <div 
      class="absolute inset-0 z-0 opacity-10 md:opacity-15" 
      :style="{ backgroundImage: `url(${BG_WAVES_URL})` }"
      style="background-size: cover; background-position: center;"
    ></div>
    <div class="absolute inset-0 z-10 bg-black/95"></div>

    <!-- Conteúdo Centralizado -->
    <div class="z-20 w-full max-w-4xl text-center">
      <p class="text-lg text-gray-400 font-semibold mb-4">
        Perguntas iniciais
      </p>
      
      <h1 class="text-4xl md:text-5xl font-black text-white mb-12">
        Que tipo(s) de Atendimento o seu Estabelecimento oferece?
      </h1>
      
      <div v-if="serverError" class="bg-red-600/20 text-red-400 p-3 rounded mb-6 mx-auto max-w-md">{{ serverError }}</div>

      <!-- Opções de Atendimento (GRID com cards clicáveis) -->
      <div class="flex flex-col md:flex-row justify-center gap-8">
        
        <!-- Opção 1: Totens / Autoatendimento -->
        <div 
            @click="totens = !totens"
            class="w-full md:w-80 bg-[#1A1A1A] rounded-xl p-4 cursor-pointer transition-all duration-300 border-4"
            :class="{'border-[#00ff6a] shadow-lg': totens, 'border-transparent hover:border-gray-700': !totens}"
        >
          <!-- CONTAINER DA IMAGEM (h-48 define a proporção) -->
          <div class="relative overflow-hidden h-48 mb-4 rounded-lg bg-gray-800 flex items-center justify-center">
            <!-- IMAGEM DO TOTEM: object-cover e object-top para focar na tela -->
            <img :src="MOCKUP_TOTEM_URL" alt="Totem de Autoatendimento" 
                 class="w-full h-full object-cover object-top" /> 
            
            <!-- Checkmark de seleção -->
            <div v-if="totens" class="absolute inset-0 flex items-start justify-end p-2">
                <Check :size="32" class="text-[#00ff6a] bg-black rounded-full p-1" />
            </div>
          </div>
          
          <p class="text-xl font-semibold text-center mt-2">
            Autoatendimento com Totens
          </p>
        </div>

        <!-- Opção 2: Garçons / Atendimento com Pessoas -->
        <div 
            @click="garcons = !garcons"
            class="w-full md:w-80 bg-[#1A1A1A] rounded-xl p-4 cursor-pointer transition-all duration-300 border-4"
            :class="{'border-[#00ff6a] shadow-lg': garcons, 'border-transparent hover:border-gray-700': !garcons}"
        >
          <!-- CONTAINER DA IMAGEM (h-48 define a proporção) -->
          <div class="relative overflow-hidden h-48 mb-4 rounded-lg bg-gray-800 flex items-center justify-center">
            <!-- IMAGEM DA GARÇONETE: object-cover e object-top para focar no rosto e tablet -->
            <img :src="MOCKUP_GARCOM_URL" alt="Atendimento com Garçons" 
                 class="w-full h-full object-cover object-top" />
            
            <!-- Checkmark de seleção -->
            <div v-if="garcons" class="absolute inset-0 flex items-start justify-end p-2">
                <Check :size="32" class="text-[#00ff6a] bg-black rounded-full p-1" />
            </div>
          </div>
          
          <p class="text-xl font-semibold text-center mt-2">
            Atendimento com Garçons
          </p>
        </div>

      </div>
      
      <!-- Botão de Ação -->
      <button @click="finalizeRegistration" 
              :disabled="isLoading || (!totens && !garcons)"
              class="mt-12 py-3 px-12 bg-white text-black font-bold rounded-full text-xl hover:bg-gray-200 transition-colors duration-300 disabled:opacity-50">
        {{ isLoading ? 'Finalizando...' : 'Finalizar Cadastro' }}
      </button>

      <p v-if="!totens && !garcons" class="text-sm text-gray-500 mt-3">
          Selecione pelo menos uma opção.
      </p>
    </div>
  </div>
</template>