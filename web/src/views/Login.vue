<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { LogIn, Lock, User, AlertCircle, ArrowRight } from 'lucide-vue-next';
import { BaseInput, BaseButton } from '@/components/ui';
import imgOndas from '@/assets/ondas.png';
import { PERMISSIONS } from '@/utils/permissions';

const authStore = useAuthStore();
const router = useRouter();

const username = ref('');
const senha = ref('');
const isLoading = ref(false);
const serverError = ref(null);

const handleLogin = async () => {
  isLoading.value = true;
  serverError.value = null;

  try {
    await authStore.login({ username: username.value, senha: senha.value });

    if (authStore.isAdmin) {
      router.push('/app/dashboard');
      return;
    }

    const rotasPossiveis = [
      { permission: PERMISSIONS.RELATORIOS, route: '/app/dashboard' },
      { permission: PERMISSIONS.COZINHA, route: '/app/kitchen' },
      { permission: PERMISSIONS.CONFIGURACAO, route: '/app/settings/establishment' },
      { permission: PERMISSIONS.ASSINATURA, route: '/app/subscription' }
    ];

    const destino = rotasPossiveis.find(item => authStore.hasPermission(item.permission));
    router.push(destino ? destino.route : '/app/dashboard');

  } catch (err) {
    serverError.value = `Erro: ${err.message || 'Falha de login'}`;
  } finally {
    isLoading.value = false;
  }
};

const goToPlans = () => router.push({ path: '/', hash: '#planos' });
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
          v-model="username"
          type="text"
          placeholder="Nome de usuário"
          :icon="User"
          dark
          required
        />

        <BaseInput
          v-model="senha"
          type="password"
          placeholder="Senha"
          :icon="Lock"
          dark
          required
        />

        <div class="flex justify-end">
          <a @click.prevent="router.push('/forgot-password')" href="/forgot-password"
            class="text-xs text-gray-500 hover:text-brand-green transition-colors cursor-pointer">
            Esqueci minha senha
          </a>
        </div>

        <div class="pt-2">
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
