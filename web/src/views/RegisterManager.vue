<script setup>
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { UserPlus, Info, AlertCircle, Loader2Plus, Info, AlertCircle, Loader2 } from 'lucide-vue-next';  
import { useAuthStore } from '@/stores/auth'; 
import { isValidCPF, maskCPF } from '@/utils/validator';
import imgOndas from '@/assets/ondas.png';
import imgOndas from '@/assets/ondas.png';

const router = useRouter();
const authStore = useAuthStore();

const nome = ref('');
const email = ref('');
const cpf = ref('');
const senha = ref('');
const confirmar_senha = ref('');

const isLoading = ref(false);
const localError = ref(null); 
const serverError = ref(null); 

if (authStore.isAuthenticated) {
    router.push('/app/dashboard');
};

watch(cpf, (value) => {
    if (!value) return;
    const masked = maskCPF(value);
    if (masked !== value) {
        cpf.value = masked;
    };
    if (isValidCPF(masked)) {
        localError.value = null;
    };
});

async function handleSubmit() {
    isLoading.value = true;
    localError.value = null;
    serverError.value = null;

    if (!nome.value.trim().includes(' ')) {
        localError.value = 'Por favor, insira seu nome e sobrenome.';
        isLoading.value = false;
        return;
    };
    if (senha.value !== confirmar_senha.value) {
        localError.value = 'As senhas não coincidem.';
        isLoading.value = false;
        return;
    };
    };
    if (senha.value.length < 6) {
        localError.value = 'A senha deve ter pelo menos 6 caracteres.';
        localError.value = 'A senha deve ter pelo menos 6 caracteres.';
        isLoading.value = false;
        return;
    };
    };
    if (!isValidCPF(cpf.value)) {
        localError.value = 'O CPF inserido é inválido.';
        isLoading.value = false;
        return;
    };

    localStorage.setItem('onboarding_personal', JSON.stringify({
        nome: nome.value,
        email: email.value,
        cpf: cpf.value,
        senha: senha.value
    }));

    setTimeout(() => {
        router.push('/onboarding/name'); 
        isLoading.value = false;
    }, 1000);
};
    setTimeout(() => {
        router.push('/onboarding/name'); 
        isLoading.value = false;
    }, 1000);
};
</script>

<template>
  <div class="min-h-screen bg-[#050505] font-inter relative flex items-center justify-center p-4 md:p-8 overflow-hidden">
  <div class="min-h-screen bg-[#050505] font-inter relative flex items-center justify-center p-4 md:p-8 overflow-hidden">
    
    <div 
      class="absolute top-1/2 left-0 w-full -translate-y-1/2 z-0 pointer-events-none opacity-40"
      :style="{ backgroundImage: `url(${imgOndas})` }"
      style="height: 70vh; background-size: cover; background-position: center; background-repeat: no-repeat;"
      class="absolute top-1/2 left-0 w-full -translate-y-1/2 z-0 pointer-events-none opacity-40"
      :style="{ backgroundImage: `url(${imgOndas})` }"
      style="height: 70vh; background-size: cover; background-position: center; background-repeat: no-repeat;"
    ></div>

    <div class="z-10 w-full max-w-lg bg-[#121212]/90 border border-white/10 p-8 md:p-12 rounded-[2.5rem] shadow-2xl relative backdrop-blur-xl">
      
      <div class="text-center mb-10">
        <h2 class="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">
          Crie sua conta
        </h2>
        <p class="text-gray-400 text-base font-medium leading-relaxed">
          Preencha os dados para começar a usar o <span class="text-[#00D26A]">PedidoFácil</span>.
        </p>
      </div>
      
      <transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0">
        <div v-if="localError || serverError" class="bg-red-500/10 border border-red-500/30 text-red-300 p-4 rounded-2xl mb-8 flex items-start gap-3 text-sm font-medium">
            <AlertCircle class="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{{ localError || serverError }}</span>
        </div>
      </transition>

    <div class="z-10 w-full max-w-lg bg-[#121212]/90 border border-white/10 p-8 md:p-12 rounded-[2.5rem] shadow-2xl relative backdrop-blur-xl">
      
      <div class="text-center mb-10">
        <h2 class="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">
          Crie sua conta
        </h2>
        <p class="text-gray-400 text-base font-medium leading-relaxed">
          Preencha os dados para começar a usar o <span class="text-[#00D26A]">PedidoFácil</span>.
        </p>
      </div>
      
      <transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0">
        <div v-if="localError || serverError" class="bg-red-500/10 border border-red-500/30 text-red-300 p-4 rounded-2xl mb-8 flex items-start gap-3 text-sm font-medium">
            <AlertCircle class="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{{ localError || serverError }}</span>
        </div>
      </transition>

      <form @submit.prevent="handleSubmit" class="space-y-6">
      <form @submit.prevent="handleSubmit" class="space-y-6">
        
        <div class="space-y-2">
            <div class="flex items-center justify-between ml-2">
                <label for="nome" class="text-sm font-medium text-gray-300">Nome completo</label>
                <div class="group relative flex items-center">
                    <Info class="w-4 h-4 text-gray-500 hover:text-[#00D26A] cursor-help transition-colors" />
                    <div class="absolute bottom-full right-0 mb-3 w-48 p-3 bg-[#1A1A1A] border border-white/10 text-xs text-gray-200 text-center rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 shadow-xl z-20 pointer-events-none">
                        Obrigatório. Digite seu nome e sobrenome.
                    </div>
                </div>
            </div>
            <input id="nome" type="text" v-model="nome" required 
                   placeholder="Ex: João da Silva"
                   class="w-full p-4 bg-white/5 rounded-2xl border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#00D26A]/50 focus:bg-white/10 transition-all duration-300" />
        </div>

        <div class="space-y-2">
            <div class="flex items-center justify-between ml-2">
                <label for="email" class="text-sm font-medium text-gray-300">Email</label>
                <div class="group relative flex items-center">
                    <Info class="w-4 h-4 text-gray-500 hover:text-[#00D26A] cursor-help transition-colors" />
                    <div class="absolute bottom-full right-0 mb-3 w-48 p-3 bg-[#1A1A1A] border border-white/10 text-xs text-gray-200 text-center rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 shadow-xl z-20 pointer-events-none">
                        Usaremos este email para login e comunicações importantes.
                    </div>
                </div>
            </div>
            <input id="email" type="email" v-model="email" required 
                   placeholder="seu.email@restaurante.com"
                   class="w-full p-4 bg-white/5 rounded-2xl border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#00D26A]/50 focus:bg-white/10 transition-all duration-300" />
        </div>

        <div class="space-y-2">
            <div class="flex items-center justify-between ml-2">
                <label for="cpf" class="text-sm font-medium text-gray-300">CPF do responsável</label>
                <div class="group relative flex items-center">
                    <Info class="w-4 h-4 text-gray-500 hover:text-[#00D26A] cursor-help transition-colors" />
                    <div class="absolute bottom-full right-0 mb-3 w-48 p-3 bg-[#1A1A1A] border border-white/10 text-xs text-gray-200 text-center rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 shadow-xl z-20 pointer-events-none">
                        Necessário para fins fiscais e segurança da conta.
                    </div>
                </div>
            </div>
            <input id="cpf" type="text" v-model="cpf" required maxlength="14"
                   placeholder="000.000.000-00"
                   class="w-full p-4 bg-white/5 rounded-2xl border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#00D26A]/50 focus:bg-white/10 transition-all duration-300" />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div class="space-y-2">
                <div class="flex items-center justify-between ml-2">
                    <label for="senha" class="text-sm font-medium text-gray-300">Senha</label>
                    <div class="group relative flex items-center">
                        <Info class="w-4 h-4 text-gray-500 hover:text-[#00D26A] cursor-help transition-colors" />
                        <div class="absolute bottom-full right-0 mb-3 w-40 p-3 bg-[#1A1A1A] border border-white/10 text-xs text-gray-200 text-center rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 shadow-xl z-20 pointer-events-none">
                            Mínimo de 6 caracteres.
                        </div>
                    </div>
                </div>
                <input id="senha" type="password" v-model="senha" required 
                       placeholder="******"
                       class="w-full p-4 bg-white/5 rounded-2xl border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#00D26A]/50 focus:bg-white/10 transition-all duration-300" />
            </div>
        <div class="space-y-2">
            <div class="flex items-center justify-between ml-2">
                <label for="nome" class="text-sm font-medium text-gray-300">Nome completo</label>
                <div class="group relative flex items-center">
                    <Info class="w-4 h-4 text-gray-500 hover:text-[#00D26A] cursor-help transition-colors" />
                    <div class="absolute bottom-full right-0 mb-3 w-48 p-3 bg-[#1A1A1A] border border-white/10 text-xs text-gray-200 text-center rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 shadow-xl z-20 pointer-events-none">
                        Obrigatório. Digite seu nome e sobrenome.
                    </div>
                </div>
            </div>
            <input id="nome" type="text" v-model="nome" required 
                   placeholder="Ex: João da Silva"
                   class="w-full p-4 bg-white/5 rounded-2xl border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#00D26A]/50 focus:bg-white/10 transition-all duration-300" />
        </div>

        <div class="space-y-2">
            <div class="flex items-center justify-between ml-2">
                <label for="email" class="text-sm font-medium text-gray-300">Email</label>
                <div class="group relative flex items-center">
                    <Info class="w-4 h-4 text-gray-500 hover:text-[#00D26A] cursor-help transition-colors" />
                    <div class="absolute bottom-full right-0 mb-3 w-48 p-3 bg-[#1A1A1A] border border-white/10 text-xs text-gray-200 text-center rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 shadow-xl z-20 pointer-events-none">
                        Usaremos este email para login e comunicações importantes.
                    </div>
                </div>
            </div>
            <input id="email" type="email" v-model="email" required 
                   placeholder="seu.email@restaurante.com"
                   class="w-full p-4 bg-white/5 rounded-2xl border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#00D26A]/50 focus:bg-white/10 transition-all duration-300" />
        </div>

        <div class="space-y-2">
            <div class="flex items-center justify-between ml-2">
                <label for="cpf" class="text-sm font-medium text-gray-300">CPF do responsável</label>
                <div class="group relative flex items-center">
                    <Info class="w-4 h-4 text-gray-500 hover:text-[#00D26A] cursor-help transition-colors" />
                    <div class="absolute bottom-full right-0 mb-3 w-48 p-3 bg-[#1A1A1A] border border-white/10 text-xs text-gray-200 text-center rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 shadow-xl z-20 pointer-events-none">
                        Necessário para fins fiscais e segurança da conta.
                    </div>
                </div>
            </div>
            <input id="cpf" type="text" v-model="cpf" required maxlength="14"
                   placeholder="000.000.000-00"
                   class="w-full p-4 bg-white/5 rounded-2xl border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#00D26A]/50 focus:bg-white/10 transition-all duration-300" />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div class="space-y-2">
                <div class="flex items-center justify-between ml-2">
                    <label for="senha" class="text-sm font-medium text-gray-300">Senha</label>
                    <div class="group relative flex items-center">
                        <Info class="w-4 h-4 text-gray-500 hover:text-[#00D26A] cursor-help transition-colors" />
                        <div class="absolute bottom-full right-0 mb-3 w-40 p-3 bg-[#1A1A1A] border border-white/10 text-xs text-gray-200 text-center rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 shadow-xl z-20 pointer-events-none">
                            Mínimo de 6 caracteres.
                        </div>
                    </div>
                </div>
                <input id="senha" type="password" v-model="senha" required 
                       placeholder="******"
                       class="w-full p-4 bg-white/5 rounded-2xl border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#00D26A]/50 focus:bg-white/10 transition-all duration-300" />
            </div>

            <div class="space-y-2">
                <div class="flex items-center justify-between ml-2">
                    <label for="confirmar_senha" class="text-sm font-medium text-gray-300">Confirmar senha</label>
                </div>
                <input id="confirmar_senha" type="password" v-model="confirmar_senha" required 
                       placeholder="******"
                       class="w-full p-4 bg-white/5 rounded-2xl border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#00D26A]/50 focus:bg-white/10 transition-all duration-300" />
            </div>
        </div>

        <button type="submit" :disabled="isLoading"
                class="w-full py-4 bg-[#00D26A] text-black font-bold rounded-full text-lg transition-all duration-300 hover:bg-[#00b058] hover:shadow-[0_0_25px_rgba(0,210,106,0.3)] disabled:opacity-50 disabled:cursor-not-allowed mt-10 flex justify-center items-center gap-3 active:scale-[0.98]">
          <Loader2 v-if="isLoading" class="w-6 h-6 animate-spin" />
          <span v-else>Finalizar cadastro</span>
          <UserPlus v-if="!isLoading" class="w-5 h-5" />
        </button>
        
        <p class="text-center text-gray-400 font-medium text-sm mt-8">
            Já tem uma conta? <a href="#" @click.prevent="router.push('/login')" class="text-[#00D26A] hover:text-[#00b058] transition-colors hover:underline">Fazer Login</a>
        </p>

      </form>
    </div>
  </div>
</template>