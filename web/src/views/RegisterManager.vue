<script setup>
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { User } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth'; 
import { isValidCPF, maskCPF } from '@/utils/validator';

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

const BG_WAVES_URL = '../assets/image 4.png';

if (authStore.isAuthenticated) {
    router.push('/app/dashboard');
}

watch(cpf, (value) => {
    if (!value) return;
    const masked = maskCPF(value);
    if (masked !== value) {
        cpf.value = masked;
    }
    if (isValidCPF(masked)) {
        localError.value = null;
    }
});

async function handleSubmit() {
    isLoading.value = true;
    localError.value = null;
    serverError.value = null;

    if (senha.value !== confirmar_senha.value) {
        localError.value = 'As senhas não coincidem.';
        isLoading.value = false;
        return;
    }
    if (senha.value.length < 6) {
        localError.value = 'A senha deve ter pelo menos 6 caracteres (mínimo exigido pelo backend).';
        isLoading.value = false;
        return;
    }
    if (!isValidCPF(cpf.value)) {
        localError.value = 'O CPF inserido é inválido.';
        isLoading.value = false;
        return;
    }
    localStorage.setItem('onboarding_personal', JSON.stringify({
        nome: nome.value,
        email: email.value,
        cpf: cpf.value,
        senha: senha.value
    }));

    router.push('/onboarding/name'); 

    isLoading.value = false;
}
</script>

<template>
  <div class="min-h-screen bg-black relative flex items-center justify-center p-6 md:p-12 overflow-hidden">
    
    <div 
      class="absolute inset-0 z-0 opacity-10 md:opacity-15" 
      :style="{ backgroundImage: `url(${BG_WAVES_URL})` }"
      style="background-size: cover; background-position: center;"
    ></div>
    <div class="absolute inset-0 z-10 bg-black/95"></div>

    <div class="z-20 w-full max-w-md bg-[#1A1A1A] p-8 rounded-xl shadow-2xl text-white">
      <h2 class="text-3xl font-black text-center mb-6">
        <span class="text-[#00ff6a] font-bold">Vamos começar</span> criando seu usuário
      </h2>
      
      <p class="text-center text-xl font-semibold mb-8 text-[#00ff6a] flex items-center justify-center">
        <User :size="24" class="mr-2" /> Login
      </p>
      
      <div v-if="localError" class="bg-red-600/20 text-red-400 p-3 rounded mb-4 text-sm">{{ localError }}</div>
      <div v-if="serverError" class="bg-red-600/20 text-red-400 p-3 rounded mb-4 text-sm">{{ serverError }}</div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        
        <label for="nome" class="block text-sm font-semibold text-gray-300">Nome:</label>
        <input id="nome" type="text" v-model="nome" required 
               placeholder="Seu Nome Completo (min. 2 palavras)"
               class="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 text-white focus:ring-2 focus:ring-[#00ff6a] focus:border-[#00ff6a] placeholder-gray-400" />

        <label for="email" class="block text-sm font-semibold text-gray-300">Email:</label>
        <input id="email" type="email" v-model="email" required 
               placeholder="seu.email@restaurante.com"
               class="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 text-white focus:ring-2 focus:ring-[#00ff6a] focus:border-[#00ff6a] placeholder-gray-400" />

        <label for="cpf" class="block text-sm font-semibold text-gray-300">CPF:</label>
        <input id="cpf" type="text" v-model="cpf" required 
               placeholder="000.000.000-00 (Obrigatório)"
               class="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 text-white focus:ring-2 focus:ring-[#00ff6a] focus:border-[#00ff6a] placeholder-gray-400" />

        <label for="senha" class="block text-sm font-semibold text-gray-300">Senha:</label>
        <input id="senha" type="password" v-model="senha" required 
               placeholder="Mínimo 6 caracteres"
               class="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 text-white focus:ring-2 focus:ring-[#00ff6a] focus:border-[#00ff6a] placeholder-gray-400" />

        <label for="confirmar_senha" class="block text-sm font-semibold text-gray-300">Confirmar Senha:</label>
        <input id="confirmar_senha" type="password" v-model="confirmar_senha" required 
               placeholder="Repita a senha"
               class="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 text-white focus:ring-2 focus:ring-[#00ff6a] focus:border-[#00ff6a] placeholder-gray-400" />

        <button type="submit" :disabled="isLoading"
                class="w-full py-3 bg-white text-black font-bold rounded-lg text-lg transition-all hover:bg-gray-200 disabled:opacity-50 mt-8">
          {{ isLoading ? 'Aguarde...' : 'Confirmar' }}
        </button>
      </form>
    </div>
  </div>
</template>