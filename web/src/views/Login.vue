<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { LogIn, Lock, Mail, AlertCircle, Loader2, ArrowRight } from 'lucide-vue-next';
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

  }  catch (err) {
  serverError.value = `Erro: ${err.message || 'Falha de login'}`;

  } finally {
    isLoading.value = false;
  }
};

const goToPlans = () => {
  router.push({ path: '/', hash: '#planos' });
};
</script>

<template>
  <div class="min-h-screen bg-dark-bg font-inter relative flex items-center justify-center p-4 md:p-8 overflow-hidden">
    
    <div 
      class="absolute top-1/2 left-0 w-full -translate-y-1/2 z-0 pointer-events-none opacity-40"
      :style="{ backgroundImage: `url(${imgOndas})` }"
      style="height: 70vh; background-size: cover; background-position: center; background-repeat: no-repeat;"
    ></div>

    <div class="z-10 w-full max-w-md bg-dark-card/90 border border-white/10 p-8 md:p-12 rounded-[2.5rem] shadow-2xl relative backdrop-blur-xl">
      
      <div class="text-center mb-10">
        <h2 class="text-3xl font-bold text-white mb-2 tracking-tight">
          Bem-vindo de volta
        </h2>
        <p class="text-gray-400 text-base font-medium">
          Acesse o painel do <span class="text-brand-green">PedidoFácil</span>.
        </p>
      </div>

      <transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0">
        <div v-if="serverError" class="bg-red-500/10 border border-red-500/30 text-red-300 p-4 rounded-2xl mb-8 flex items-center gap-3 text-sm font-medium">
            <AlertCircle class="w-5 h-5 flex-shrink-0" />
            <span>{{ serverError }}</span>
        </div>
      </transition>

      <form @submit.prevent="handleLogin" class="space-y-6">
        
        <div class="space-y-2">
            <label for="email" class="text-sm font-medium text-gray-300 ml-2">Email de acesso</label>
            <div class="relative">
                <input 
                  id="email" 
                  type="email" 
                  v-model="email" 
                  placeholder="exemplo@restaurante.com" 
                  required 
                  maxlength="255"
                  class="w-full p-4 pl-12 bg-white/5 rounded-2xl border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-brand-green/50 focus:bg-white/10 transition-all duration-300" 
                />
                <Mail class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
            </div>
        </div>
        
        <div class="space-y-2">
            <div class="flex justify-between items-center ml-2 mr-1">
                <label for="senha" class="text-sm font-medium text-gray-300">Sua senha</label>
                <a href="#" class="text-xs text-brand-green hover:text-brand-green-hover transition-colors hover:underline">Esqueceu a senha?</a>
            </div>
            <div class="relative">
                <input 
                  id="senha" 
                  type="password" 
                  v-model="senha" 
                  placeholder="••••••••" 
                  required 
                  maxlength="64"
                  class="w-full p-4 pl-12 bg-white/5 rounded-2xl border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-brand-green/50 focus:bg-white/10 transition-all duration-300" 
                />
                <Lock class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
            </div>
        </div>

        <button 
          type="submit" 
          :disabled="isLoading"
          class="w-full py-4 bg-brand-green text-black font-bold rounded-full text-lg transition-all duration-300 hover:bg-brand-green-hover hover:shadow-lg hover:shadow-brand-green/30 disabled:opacity-50 disabled:cursor-not-allowed mt-8 flex justify-center items-center gap-3 active:scale-[0.98]"
        >
          <Loader2 v-if="isLoading" class="w-6 h-6 animate-spin" />
          <span v-else>Entrar no sistema</span>
          <LogIn v-if="!isLoading" class="w-5 h-5" />
        </button>

      </form>
      
      <div class="mt-10 pt-6 border-t border-white/5 text-center">
          <p class="text-gray-400 text-sm mb-3">Ainda não é cliente?</p>
          <a  
            @click.prevent="goToPlans"
            href="/#planos"
            class="inline-flex items-center gap-2 text-brand-green font-bold hover:text-brand-green-hover transition-all group cursor-pointer"
          >
            Ver planos disponíveis
            <ArrowRight class="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </a>
      </div>

    </div>
  </div>
</template>