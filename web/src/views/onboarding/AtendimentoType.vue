<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useOnboardingStore } from '@/stores/onboarding';
import { useAuthStore } from '@/stores/auth';
import { Check, ArrowRight, Loader2, MonitorSmartphone, Users } from 'lucide-vue-next';
import { getRolesMock, initMockRoles } from '@/mock/authmock';

import imgOndas from '@/assets/ondas.png';
import imgTotemMockup from '@/assets/atendimento2.png'; 
import imgGarcomMockup from '@/assets/atendimento1.png'; 

const router = useRouter();
const onboardingStore = useOnboardingStore();
const authStore = useAuthStore();

const totens = ref(false);
const garcons = ref(false);
const isLoading = ref(false);
const serverError = ref(null);

const nomeEstabelecimento = computed(
  () => onboardingStore.estabelecimentoData?.nome_estabelecimento || ''
);

const getPersonalData = () => {
    try {
        return JSON.parse(localStorage.getItem('onboarding_personal') || '{}');
    } catch (e) {
        return {};
    }
};

const pessoalData = getPersonalData();

const isSelectionValid = computed(() => totens.value || garcons.value);

const finalizeRegistration = async () => {
  serverError.value = null;

  if (!pessoalData.email || !nomeEstabelecimento.value) {
    serverError.value = 'Dados perdidos. Por favor, reinicie o cadastro.';
    return;
  }

  if (!isSelectionValid.value) return;

  isLoading.value = true;

  setTimeout(() => {
    try {
      initMockRoles();
      const roles = getRolesMock();

      const gerenteRole = roles.find(
        r => r.role === 'GERENTE' || r.name.toLowerCase().includes('gerente')
      );

      if (!gerenteRole) {
        throw new Error('Cargo gerente não encontrado.');
      }

      let tipoAtendimento = 'Mesa';
      if (totens.value && garcons.value) tipoAtendimento = 'Híbrido';
      else if (totens.value) tipoAtendimento = 'Autoatendimento';
      else if (garcons.value) tipoAtendimento = 'Garçom';

      const mockUser = {
        id: Date.now(),
        name: pessoalData.nome,
        email: pessoalData.email,
        password: pessoalData.password,
        roleId: gerenteRole.id,
        permissions: gerenteRole.permissions,
        estabelecimento: {
          nome: nomeEstabelecimento.value,
          tipoAtendimento,
          usa_totens: totens.value,
          usa_garcons: garcons.value
        }
      };

      localStorage.removeItem('onboarding_personal');
      onboardingStore.clearOnboarding();

      const userWithRole = {
        ...mockUser,
        role: gerenteRole
      };

      localStorage.setItem('user', JSON.stringify(userWithRole));
      localStorage.setItem('userToken', 'mock-token');

      authStore.user = userWithRole;
      authStore.roles = roles;
      authStore.isAuthenticated = true;

      router.push('/app/dashboard');

    } catch (err) {
      console.error(err);
      serverError.value = 'Erro ao finalizar cadastro.';
    } finally {
      isLoading.value = false;
    }
  }, 1000);
};
</script>

<template>
  <div class="min-h-screen bg-dark-bg font-inter relative flex flex-col items-center justify-center p-4 md:p-12 overflow-hidden">
    
    <div 
      class="absolute top-1/2 left-0 w-full -translate-y-1/2 z-0 pointer-events-none opacity-40"
      :style="{ backgroundImage: `url(${imgOndas})` }"
      style="height: 70vh; background-size: cover; background-position: center; background-repeat: no-repeat;"
    ></div>

    <div class="z-10 w-full max-w-5xl text-center">
      
      <div class="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6 md:mb-8 backdrop-blur-md">
        <span class="text-brand-green text-[10px] md:text-xs font-bold uppercase tracking-widest">Etapa Final</span>
      </div>

      <h1 class="text-2xl md:text-5xl font-bold text-white mb-4 md:mb-6 tracking-tight leading-tight">
        Como será o atendimento aos clientes?
      </h1>
      
      <p class="text-gray-400 text-sm md:text-lg mb-8 md:mb-12 font-medium">
        Selecione os modelos que deseja habilitar no seu <span class="text-white">PedidoFácil</span>.
      </p>
      
      <transition enter-active-class="transition duration-300" enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0">
        <div v-if="serverError" class="bg-red-500/10 border border-red-500/30 text-red-300 p-3 rounded-xl mb-6 inline-block font-medium text-sm">
            {{ serverError }}
        </div>
      </transition>

      <div class="flex flex-row justify-center gap-4 md:gap-8 lg:gap-12 mb-12 w-full">
        
        <div 
            @click="totens = !totens"
            class="group relative w-1/2 md:w-80 bg-dark-card/80 backdrop-blur-sm rounded-2xl md:rounded-[2.5rem] border-2 cursor-pointer transition-all duration-500 overflow-hidden flex flex-col"
            :class="totens ? 'border-brand-green scale-[1.03] shadow-[0_0_30px_rgba(0,210,106,0.15)]' : 'border-white/5 hover:border-white/20 hover:bg-white/[0.02]'"
        >
          <div class="absolute top-3 right-3 md:top-6 md:right-6 z-20 transition-all duration-300" :class="totens ? 'opacity-100 scale-100' : 'opacity-0 scale-75'">
             <div class="bg-brand-green text-black rounded-full p-1 md:p-1.5 shadow-lg">
                 <Check class="w-3 h-3 md:w-5 md:h-5" stroke-width="4" />
             </div>
          </div>

          <div class="h-44 md:h-80 bg-gradient-to-b from-white/5 to-transparent relative overflow-hidden">
             <img :src="imgTotemMockup" class="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700" :class="totens ? 'scale-110' : ''" />
             
             <div class="absolute inset-0 bg-gradient-to-t from-dark-card via-transparent to-transparent"></div>
             
             <div class="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md p-2 md:p-3 rounded-xl border border-white/10 shadow-xl">
                <MonitorSmartphone class="w-5 h-5 md:w-7 md:h-7 text-white" />
             </div>
          </div>
          
          <div class="p-4 md:p-8 text-center flex-grow flex flex-col justify-center">
             <h3 class="text-sm md:text-xl font-bold text-white mb-1 md:mb-2 transition-colors" :class="totens ? 'text-brand-green' : ''">Autoatendimento</h3>
             <p class="text-[10px] md:text-sm text-gray-500 leading-tight md:leading-relaxed font-medium">
               Totens, tablets e QR Codes.
             </p>
          </div>
        </div>

        <div 
            @click="garcons = !garcons"
            class="group relative w-1/2 md:w-80 bg-dark-card/80 backdrop-blur-sm rounded-2xl md:rounded-[2.5rem] border-2 cursor-pointer transition-all duration-500 overflow-hidden flex flex-col"
            :class="garcons ? 'border-brand-green scale-[1.03] shadow-[0_0_30px_rgba(0,210,106,0.15)]' : 'border-white/5 hover:border-white/20 hover:bg-white/[0.02]'"
        >
          <div class="absolute top-3 right-3 md:top-6 md:right-6 z-20 transition-all duration-300" :class="garcons ? 'opacity-100 scale-100' : 'opacity-0 scale-75'">
             <div class="bg-brand-green text-black rounded-full p-1 md:p-1.5 shadow-lg">
                 <Check class="w-3 h-3 md:w-5 md:h-5" stroke-width="4" />
             </div>
          </div>

          <div class="h-44 md:h-80 bg-gradient-to-b from-white/5 to-transparent relative overflow-hidden">
             <img :src="imgGarcomMockup" class="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700" :class="garcons ? 'scale-110' : ''" />
             
             <div class="absolute inset-0 bg-gradient-to-t from-dark-card via-transparent to-transparent"></div>
             
             <div class="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md p-2 md:p-3 rounded-xl border border-white/10 shadow-xl">
                <Users class="w-5 h-5 md:w-7 md:h-7 text-white" />
             </div>
          </div>
          
          <div class="p-4 md:p-8 text-center flex-grow flex flex-col justify-center">
             <h3 class="text-sm md:text-xl font-bold text-white mb-1 md:mb-2 transition-colors" :class="garcons ? 'text-brand-green' : ''">Garçons</h3>
             <p class="text-[10px] md:text-sm text-gray-500 leading-tight md:leading-relaxed font-medium">
               Atendimento em mesa e balcão.
             </p>
          </div>
        </div>

      </div>
      
      <button 
        @click="finalizeRegistration" 
        :disabled="isLoading || !isSelectionValid"
        class="py-4 px-10 md:py-5 md:px-14 bg-brand-green text-black font-extrabold rounded-full text-lg md:text-xl hover:bg-brand-green-hover transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-3 mx-auto w-full md:w-auto min-w-[280px] shadow-xl shadow-brand-green/20 active:scale-95"
      >
        <Loader2 v-if="isLoading" class="w-5 h-5 md:w-6 md:h-6 animate-spin" />
        <span v-else>Finalizar e Acessar Sistema</span>
        <ArrowRight v-if="!isLoading" class="w-5 h-5 md:w-6 md:h-6" />
      </button>

      <p v-if="!isSelectionValid" class="text-xs md:text-sm text-gray-500 mt-6 font-bold uppercase tracking-widest animate-pulse">
          Selecione ao menos uma opção para prosseguir
      </p>

    </div>
  </div>
</template>