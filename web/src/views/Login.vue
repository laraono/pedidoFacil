<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const router = useRouter();

const email = ref('');
const senha = ref('');
const isLoading = ref(false);
const serverError = ref(null);

const handleLogin = async () => {
  try {
    authStore.login({
      email: email.value,
      senha: senha.value
    });

    router.push("/app/dashboard");
  } catch (err) {
    serverError.value = "Email ou senha inválidos.";
  }
};

</script>

<template>
  <div class="min-h-screen bg-black flex items-center justify-center p-6">
    <div class="login-card w-full max-w-md p-8 bg-[#1f1f1f] rounded-xl shadow-2xl text-white">
      <h2 class="text-3xl font-bold text-center mb-6 text-[#00ff6a]">Acesso ao FoodSystem</h2>
      
      <div v-if="serverError" class="bg-red-600/20 text-red-400 p-3 rounded mb-4">{{ serverError }}</div>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <input type="email" v-model="email" placeholder="Email de login" required 
               class="w-full p-3 bg-gray-800 rounded-lg border-none text-white focus:ring-2 focus:ring-[#00ff6a] placeholder-gray-400" />
        
        <input type="password" v-model="senha" placeholder="Senha" required 
               class="w-full p-3 bg-gray-800 rounded-lg border-none text-white focus:ring-2 focus:ring-[#00ff6a] placeholder-gray-400" />

        <button type="submit" :disabled="isLoading"
                class="w-full bg-[#00ff6a] text-black font-bold py-3 rounded-lg text-lg transition-all hover:bg-green-400 disabled:opacity-50 mt-6">
          {{ isLoading ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>
      
      <p class="text-center text-sm text-gray-500 mt-4">
          Primeiro acesso? <router-link to="/planos" class="text-[#00ff6a] hover:underline">Comece por aqui</router-link>
      </p>
    </div>
  </div>
</template>