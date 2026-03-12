<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { LogIn, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-vue-next';
import { BaseInput, BaseButton } from '@/components/ui';
import imgOndas from '@/assets/ondas.png';
import { PERMISSIONS } from '@/utils/permissions';


const authStore = useAuthStore();
const router = useRouter();

const email = ref('');
const senha = ref('');
const isLoading = ref(false);
const serverError = ref(null);

const handleLogin = async () => {
  isLoading.value = true;
  serverError.value = null;

  try {
    await authStore.login({
      email: email.value,
      senha: senha.value
    });

    const rotasPossiveis = [
      { permission: PERMISSIONS.RELATORIOS, route: "/app/dashboard" },
      { permission: PERMISSIONS.COZINHA, route: "/app/kitchen" },
      { permission: PERMISSIONS.ESTOQUE, route: "/app/stock" },
      { permission: PERMISSIONS.CARDAPIO, route: "/app/menu/manage" }, 
      { permission: PERMISSIONS.FUNCIONARIOS, route: "/app/settings/roles" },
      { permission: PERMISSIONS.CONFIGURACAO, route: "/app/settings/establishment" }, 
      { permission: PERMISSIONS.ASSINATURA, route: "/app/subscription" }
    ];

    const destino = rotasPossiveis.find(item => authStore.hasPermission(item.permission));

    if (destino) {
      router.push(destino.route);
    } else {
      router.push("/app/dashboard");
    }

  } catch (err) {
    console.error(err);
    serverError.value = "Email ou senha incorretos.";
  } finally {
    isLoading.value = false;
  }
};

const goToPlans = () => {
  router.push({ path: '/', hash: '#planos' });
};
</script>

<template>
  <div class="min-h-screen bg-dark-bg font-inter relative flex flex-col items-center justify-center p-4">
    <div class="absolute top-0 left-0 w-full h-full z-0 pointer-events-none opacity-40"
         :style="{ backgroundImage: `url(${imgOndas})`, backgroundSize: 'cover', backgroundPosition: 'center' }">
    </div>

    <div class="z-10 w-full max-w-md bg-dark-card/90 backdrop-blur-md border border-white/10 p-8 sm:p-12 rounded-[2.5rem] shadow-2xl">
      <div class="mb-10 text-center">
        <h2 class="text-3xl font-black text-white mb-2">Bem-vindo de volta</h2>
        <p class="text-gray-400">Entre para gerir o seu restaurante</p>
      </div>

      <div v-if="serverError" class="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm">
        <AlertCircle class="w-5 h-5 shrink-0" />
        <p>{{ serverError }}</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-5">
        <BaseInput 
          v-model="email" 
          type="email" 
          placeholder="exemplo@email.com" 
          :icon="Mail" 
          dark 
          required 
        />
        
        <BaseInput 
          v-model="senha" 
          type="password" 
          placeholder="A sua palavra-passe" 
          :icon="Lock" 
          dark 
          required 
        />

        <div class="pt-4">
          <BaseButton 
            type="submit" 
            variant="brand" 
            size="lg" 
            class="w-full"
            :isLoading="isLoading" 
            :icon="LogIn"
          >
            Entrar no sistema
          </BaseButton>
        </div>
      </form>
      
      <div class="mt-10 pt-6 border-t border-white/5 text-center">
          <p class="text-gray-400 text-sm mb-3">Ainda não é cliente?</p>
          <a @click.prevent="goToPlans" href="/#planos" class="inline-flex items-center gap-2 text-brand-green font-bold hover:text-white transition-colors cursor-pointer group">
            Conheça os nossos planos
            <ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
      </div>
    </div>
  </div>
</template>