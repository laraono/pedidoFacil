<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useOnboardingStore } from '@/stores/onboarding';

const router = useRouter();
const onboardingStore = useOnboardingStore();
const nomeEstabelecimento = ref('');

// caminho ok
const BG_WAVES_URL = '../../assets/image 4.png';

onMounted(() => {
  // 🔒 PROTEÇÃO TOTAL CONTRA undefined
  const nomeOnboarding =
    onboardingStore.estabelecimentoData?.nome_estabelecimento ?? '';

  nomeEstabelecimento.value = nomeOnboarding;
});

const handleSubmit = () => {
  if (!nomeEstabelecimento.value.trim()) return;

  // 🔒 GARANTE QUE O OBJETO EXISTE
  onboardingStore.setEstabelecimentoData(
    'nome_estabelecimento',
    nomeEstabelecimento.value.trim()
  );

  router.push('/onboarding/type');
};
</script>

<template>
  <div class="min-h-screen bg-black relative flex flex-col items-center justify-center p-6 md:p-12 overflow-hidden">
    
    <!-- FUNDO -->
    <div 
      class="absolute inset-0 z-0 opacity-10 md:opacity-15" 
      :style="{ backgroundImage: `url(${BG_WAVES_URL})` }"
      style="background-size: cover; background-position: center;"
    ></div>
    
    <div class="absolute inset-0 z-10 bg-black/95"></div> 

    <!-- CONTEÚDO -->
    <div class="z-20 w-full max-w-2xl text-center">
      <p class="text-xl text-[#00ff6a] font-semibold mb-4">
        Agora, algumas perguntas para melhorar sua experiência...
      </p>
      
      <h1 class="text-5xl font-black text-white mb-12">
        Qual o nome do seu Estabelecimento?
      </h1>
      
      <form @submit.prevent="handleSubmit" class="flex flex-col items-center space-y-8">
        <input
          type="text"
          v-model="nomeEstabelecimento"
          placeholder="Ex: Sabor de Casa..."
          required
          class="w-full max-w-lg p-4 bg-white text-black rounded-xl border-none text-lg placeholder-gray-500 focus:ring-4 focus:ring-[#00ff6a] focus:border-transparent"
        />
        
        <button
          type="submit"
          :disabled="!nomeEstabelecimento.trim()"
          class="py-3 px-12 bg-white text-black font-bold rounded-full text-xl hover:bg-gray-200 transition-colors duration-300 disabled:opacity-50"
        >
          Próximo
        </button>
      </form>
    </div>
  </div>
</template>
