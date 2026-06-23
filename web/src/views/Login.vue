<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useFeaturesStore } from '@/stores/features';
import { storeToRefs } from 'pinia';
import { LogIn, Lock, User, AlertCircle, Eye, EyeOff } from 'lucide-vue-next';
import { BaseInput, BaseButton } from '@/components/ui';
import AuthLayout from '@/components/AuthLayout.vue';
import { PERMISSIONS } from '@/utils/permissions';

const authStore = useAuthStore();
const { emailEnabled, plansEnabled } = storeToRefs(useFeaturesStore());
const router = useRouter();

const email = ref('');
const senha = ref('');
const isLoading = ref(false);
const serverError = ref(null);
const showPassword = ref(false);

if (authStore.isAuthenticated) router.push('/app/dashboard');

onMounted(() => window.scrollTo(0, 0));

const handleLogin = async () => {
  isLoading.value = true;
  serverError.value = null;

  try {
    await authStore.login({ username: email.value, senha: senha.value });

    if (authStore.isAdmin) {
      router.push({ name: 'admin-subscriptions' });
      return;
    }

    router.push('/app/dashboard');

  } catch (err) {
    serverError.value = (err instanceof Error ? err.message : null) || 'Falha no login';
  } finally {
    isLoading.value = false;
  }
};

const goToPlans = () => router.push({ path: '/', hash: '#planos' });
</script>

<template>
  <AuthLayout>
      <div class="z-10 w-full max-w-md bg-white/90 border border-[#E0E0E0] p-8 sm:p-12 rounded shadow-2xl">
        <div class="mb-10 text-center">
          <h2 class="text-3xl font-black text-[#212121] mb-2">Bem-vindo de volta</h2>
          <p class="text-[#757575]">Acesse sua conta e faça login</p>
        </div>

        <div v-if="serverError" class="mb-6 p-4 bg-danger-light border border-danger rounded flex items-center gap-3 text-danger text-sm">
          <AlertCircle class="w-5 h-5 shrink-0" />
          <p>{{ serverError }}</p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-5">
          <BaseInput
            v-model="email"
            type="email"
            placeholder="E-mail"
            :icon="User"
            dark
            required
          />

          <BaseInput
            v-model="senha"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Senha"
            :icon="Lock"
            dark
            required
          >
            <template #suffix>
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-4 top-1/2 -translate-y-1/2 text-[#757575] hover:text-accent"
              >
                <component :is="showPassword ? EyeOff : Eye" class="w-5 h-5" />
              </button>
            </template>
          </BaseInput>

          <div v-if="emailEnabled" class="flex justify-end">
            <a @click.prevent="router.push('/forgot-password')" href="/forgot-password"
              class="text-xs text-[#757575] hover:text-accent transition-colors cursor-pointer">
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
              Entrar
            </BaseButton>
          </div>
        </form>

        <div v-if="plansEnabled" class="mt-10 pt-6 border-t border-[#E0E0E0] text-center">
          <p class="text-[#757575] text-sm mb-3">Ainda não é cliente?</p>
          <a @click.prevent="goToPlans" href="/#planos" class="text-accent font-bold hover:text-[#212121] transition-colors cursor-pointer">
            Conheça os nossos planos
          </a>
        </div>
      </div>
  </AuthLayout>
</template>