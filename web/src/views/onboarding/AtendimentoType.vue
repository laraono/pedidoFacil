<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useOnboardingStore } from '@/stores/onboarding';
import { useAuthStore } from '@/stores/auth';
import { Check, ArrowRight, Loader2, MonitorSmartphone, Users } from 'lucide-vue-next';
import { getRolesMock, initMockRoles } from '@/mock/rolesmock';

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

      let tipo_atendimento = 'Mesa';
      if (totens.value && garcons.value) tipo_atendimento = 'Híbrido';
      else if (totens.value) tipo_atendimento = 'Autoatendimento';
      else if (garcons.value) tipo_atendimento = 'Garçom';

      const mockUser = {
        id: Date.now(),
        name: pessoalData.nome,
        email: pessoalData.email,
        password: pessoalData.password,
        roleId: gerenteRole.id,
        permissions: gerenteRole.permissions,
        estabelecimento: {
          nome: nomeEstabelecimento.value,
          tipo_atendimento,
          usa_totens: totens.value,
          usa_garcons: garcons.value
        }
      };

      localStorage.setItem('user', JSON.stringify(mockUser));
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
  <div class="min-h-screen bg-[#050505] font-inter relative flex flex-col items-center justify-center p-4 md:p-12 overflow-hidden">
    
    <div 
      class="absolute top-1/2 left-0 w-full -translate-y-1/2 z-0 pointer-events-none opacity-40"
      :style="{ backgroundImage: `url(${imgOndas})` }"
      style="height: 70vh; background-size: cover; background-position: center; background-repeat: no-repeat;"
    ></div>

    <div class="z-10 w-full max-w-5xl text-center">
      
      <div class="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6 md:mb-8 backdrop-blur-md">
        <span class="text-[#00D26A] text-[10px] md:text-xs font-bold uppercase tracking-widest">Etapa 3 de 3</span>
      </div>

      <h1 class="text-2xl md:text-5xl font-bold text-white mb-4 md:mb-6 tracking-tight leading-tight">
        Como será o atendimento aos clientes?
      </h1>
      
      <p class="text-gray-400 text-sm md:text-lg mb-8 md:mb-12">
        Selecione uma ou ambas as opções.
      </p>
      
      <transition enter-active-class="transition duration-300" enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0">
        <div v-if="serverError" class="bg-red-500/10 border border-red-500/30 text-red-300 p-3 rounded-xl mb-6 inline-block">
            {{ serverError }}
        </div>
      </transition>

      <div class="flex flex-row justify-center gap-3 md:gap-6 lg:gap-10 mb-12 w-full">
        
        <div 
            @click="totens = !totens"
            class="group relative w-1/2 md:w-80 bg-[#121212]/80 backdrop-blur-sm rounded-2xl md:rounded-[2rem] border-2 cursor-pointer transition-all duration-300 overflow-hidden flex flex-col"
            :class="totens ? 'border-[#00D26A] scale-[1.02]' : 'border-white/10 hover:border-white/30 hover:bg-[#1A1A1A]'"
        >
          <div class="absolute top-2 right-2 md:top-4 md:right-4 z-20 transition-all duration-300" :class="totens ? 'opacity-100 scale-100' : 'opacity-0 scale-75'">
             <div class="bg-[#00D26A] text-black rounded-full p-1 md:p-1.5">
                 <Check class="w-3 h-3 md:w-5 md:h-5" stroke-width="3" />
             </div>
          </div>

          <div class="h-40 md:h-80 bg-gradient-to-b from-gray-800 to-[#121212] relative overflow-hidden">
             <img :src="imgTotemMockup" class="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
             
             <div class="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent"></div>
             
             <div class="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md p-2 md:p-3 rounded-xl md:rounded-2xl border border-white/10">
                <MonitorSmartphone class="w-5 h-5 md:w-8 md:h-8 text-white" />
             </div>
          </div>
          
          <div class="p-3 md:p-6 text-center flex-grow flex flex-col justify-center">
             <h3 class="text-sm md:text-xl font-bold text-white mb-1 md:mb-2 group-hover:text-[#00D26A] transition-colors">Autoatendimento</h3>
             <p class="text-[10px] md:text-sm text-gray-400 leading-tight md:leading-relaxed">
               Totens e tablets.
             </p>
          </div>
        </div>

        <div 
            @click="garcons = !garcons"
            class="group relative w-1/2 md:w-80 bg-[#121212]/80 backdrop-blur-sm rounded-2xl md:rounded-[2rem] border-2 cursor-pointer transition-all duration-300 overflow-hidden flex flex-col"
            :class="garcons ? 'border-[#00D26A] scale-[1.02]' : 'border-white/10 hover:border-white/30 hover:bg-[#1A1A1A]'"
        >
          <div class="absolute top-2 right-2 md:top-4 md:right-4 z-20 transition-all duration-300" :class="garcons ? 'opacity-100 scale-100' : 'opacity-0 scale-75'">
             <div class="bg-[#00D26A] text-black rounded-full p-1 md:p-1.5">
                 <Check class="w-3 h-3 md:w-5 md:h-5" stroke-width="3" />
             </div>
          </div>

          <div class="h-40 md:h-80 bg-gradient-to-b from-gray-800 to-[#121212] relative overflow-hidden">
             <img :src="imgGarcomMockup" class="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
             
             <div class="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent"></div>
             
             <div class="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md p-2 md:p-3 rounded-xl md:rounded-2xl border border-white/10">
                <Users class="w-5 h-5 md:w-8 md:h-8 text-white" />
             </div>
          </div>
          
          <div class="p-3 md:p-6 text-center flex-grow flex flex-col justify-center">
             <h3 class="text-sm md:text-xl font-bold text-white mb-1 md:mb-2 group-hover:text-[#00D26A] transition-colors">Garçons</h3>
             <p class="text-[10px] md:text-sm text-gray-400 leading-tight md:leading-relaxed">
               Mesas e balcão.
             </p>
          </div>
        </div>

      </div>
      
      <button 
        @click="finalizeRegistration" 
        :disabled="isLoading || !isSelectionValid"
        class="py-3 px-8 md:py-4 md:px-12 bg-[#00D26A] text-black font-bold rounded-full text-lg md:text-xl hover:bg-[#00b058] transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-3 mx-auto w-full md:w-auto min-w-[200px]"
      >
        <Loader2 v-if="isLoading" class="w-5 h-5 md:w-6 md:h-6 animate-spin" />
        <span v-else>Acessar Sistema</span>
        <ArrowRight v-if="!isLoading" class="w-5 h-5 md:w-6 md:h-6" />
      </button>

      <p v-if="!isSelectionValid" class="text-xs md:text-sm text-gray-600 mt-4 animate-pulse">
          Selecione uma opção
      </p>

    </div>
  </div>
</template>