<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useOnboardingStore } from '@/stores/onboarding';
import { Store, ArrowRight } from 'lucide-vue-next';
import imgOndas from '@/assets/ondas.png';

const router = useRouter();
const onboardingStore = useOnboardingStore();
const nomeEstabelecimento = ref('');

onMounted(() => {
  const nomeOnboarding = onboardingStore.estabelecimentoData?.nome_estabelecimento ?? '';
  nomeEstabelecimento.value = nomeOnboarding;
});

const handleSubmit = () => {
  if (!nomeEstabelecimento.value.trim()) return;

  onboardingStore.setEstabelecimentoData(
    'nome_estabelecimento',
    nomeEstabelecimento.value.trim()
  );

  router.push('/onboarding/type');
};
</script>

<template>
  <div class="min-h-screen bg-page font-inter relative flex flex-col items-center justify-center p-6 md:p-12 overflow-hidden">
    
    <div 
      class="absolute top-1/2 left-0 w-full -translate-y-1/2 z-0 pointer-events-none opacity-40"
      :style="{ backgroundImage: `url(${imgOndas})` }"
      style="height: 70vh; background-size: cover; background-position: center; background-repeat: no-repeat;"
    ></div>

    <div class="z-10 w-full max-w-2xl bg-white/90 border border-[#E0E0E0] p-8 md:p-16 rounded shadow-2xl relative backdrop-blur-xl text-center">
      
      <div class="inline-flex items-center justify-center px-4 py-1.5 rounded bg-gray-50 border border-[#E0E0E0] mb-8">
        <span class="text-accent text-xs font-bold uppercase tracking-widest">Etapa 2 de 3</span>
      </div>
      
      <h1 class="text-3xl md:text-5xl font-bold text-[#212121] mb-6 tracking-tight leading-tight">
        Qual o nome do seu <br class="hidden md:block" />
        <span class="text-primary">estabelecimento?</span>
      </h1>
      
      <p class="text-[#757575] text-lg mb-12 max-w-lg mx-auto leading-relaxed">
        Esse é o nome que seus clientes verão ao acessar seu cardápio digital.
      </p>
      
      <form @submit.prevent="handleSubmit" class="flex flex-col items-center w-full">
        
        <div class="relative w-full max-w-lg group">
            <div class="absolute left-5 top-1/2 -translate-y-1/2 text-[#757575] group-focus-within:text-accent transition-colors duration-300">
                <Store class="w-6 h-6" />
            </div>
            
            <input
              type="text"
              v-model="nomeEstabelecimento"
              placeholder="Ex: Pizzaria Sabor de Casa"
              required
              autofocus
              minlength="3"
              maxlength="100"
              class="w-full p-6 pl-16 bg-gray-50 text-[#212121] rounded border border-[#E0E0E0] text-xl placeholder-gray-600 focus:outline-none focus:border-primary/50 focus:bg-gray-100 focus: transition-all duration-300"
            />
        </div>
        
        <button
          type="submit"
          :disabled="!nomeEstabelecimento.trim() || nomeEstabelecimento.length < 3"
          class="mt-12 py-4 px-10 bg-primary text-white font-bold rounded text-xl hover:bg-primary-dark shadow-lg shadow-primary/40 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none flex items-center gap-3 group active:scale-[0.98]"
        >
          <span>Continuar</span>
          <ArrowRight class="w-6 h-6 transition-transform group-hover:translate-x-1" />
        </button>

      </form>
    </div>
  </div>
</template>