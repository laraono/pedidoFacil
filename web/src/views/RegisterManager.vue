<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { UserPlus, Eye, EyeOff, ArrowLeft } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';
import { BaseInput, BaseButton } from '@/components/ui';
import { isValidCPF, maskCPF } from '@/utils/validator';
import LandingHeader from '@/components/LandingHeader.vue';
import imgOndas from '@/assets/ondas.png';
import { authApi } from "@/services/authApi";

const router = useRouter();
const authStore = useAuthStore();

const nome = ref("");
const email = ref("");
const senha = ref("");
const confirmarSenha = ref("");

const showPassword = ref(false);
const showConfirmPassword = ref(false);

const isLoading = ref(false);
const errors = ref({});
const serverError = ref(null);

if (authStore.isAuthenticated) router.push("/app/dashboard");

onMounted(() => window.scrollTo(0, 0));

function validate() {
  errors.value = {};

  if (!nome.value.trim().includes(" ")) {
    errors.value.nome = "Por favor, insira seu nome e sobrenome.";
  }

  if (!email.value.trim()) {
    errors.value.email = "O e-mail é obrigatório.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
    errors.value.email = "Insira um e-mail válido.";
  }

  const passErrors = [];
  if (senha.value.length < 8) passErrors.push("8 caracteres");
  if (!/[A-Z]/.test(senha.value)) passErrors.push("uma letra maiúscula");
  if (!/[0-9]/.test(senha.value)) passErrors.push("um número");
  if (!/[^A-Za-z0-9]/.test(senha.value))
    passErrors.push("um caractere especial");

  if (passErrors.length > 0) {
    errors.value.senha = `Falta: ${passErrors.join(", ")}.`;
  }

  if (senha.value !== confirmarSenha.value) {
    errors.value.confirmarSenha = "As senhas não coincidem.";
  }

  return Object.keys(errors.value).length === 0;
}

async function handleSubmit() {
  serverError.value = null;
  if (!validate()) return;

  isLoading.value = true;

  try {
    const response = await authApi.register({
      nome_usuario: nome.value,
      email: email.value.trim(),
      senha: senha.value,
    });

    localStorage.setItem("accessToken", response.accessToken);
    localStorage.setItem("user", JSON.stringify(response.usuario));

    authStore.user = response.usuario;

    router.push("/onboarding/name");
  } catch (error) {
    console.error(error);
    serverError.value =
      error.message || "Ocorreu um erro ao criar sua conta. Tente novamente.";
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen bg-page font-inter flex flex-col">
    <LandingHeader />

    <div
      class="flex-1 relative flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
    >
      <div
        class="absolute top-0 left-0 w-full h-full z-0 pointer-events-none opacity-40"
        :style="{
          backgroundImage: `url(${imgOndas})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }"
      ></div>

      <div
        class="z-10 w-full max-w-xl bg-white border border-[#E0E0E0] p-8 sm:p-12 rounded shadow-2xl"
      >
        <div class="mb-10 text-center">
          <h2 class="text-3xl font-black text-[#212121] mb-2">
            Crie a sua conta
          </h2>
          <p class="text-[#757575]">Preencha os dados do gestor principal</p>
        </div>

        <transition
          enter-active-class="transition duration-300"
          enter-from-class="opacity-0 -translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
        >
          <div
            v-if="serverError"
            class="mb-6 p-4 bg-danger-light border border-danger rounded text-danger font-bold text-sm"
          >
            {{ serverError }}
          </div>
        </transition>

        <form @submit.prevent="handleSubmit" class="space-y-5">
          <BaseInput
            v-model="nome"
            label="Nome Completo"
            placeholder="Ex: João da Silva"
            dark
            :error="errors.nome"
          />

          <BaseInput
            v-model="email"
            label="E-mail de Acesso"
            type="email"
            placeholder="Ex: joao@restaurante.com"
            dark
            :error="errors.email"
          />

          <BaseInput
            v-model="senha"
            label="Senha Segura"
            :type="showPassword ? 'text' : 'password'"
            placeholder="••••••••"
            dark
            :error="errors.senha"
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

          <BaseInput
            v-model="confirmarSenha"
            label="Confirme a Senha"
            :type="showConfirmPassword ? 'text' : 'password'"
            placeholder="••••••••"
            dark
            :error="errors.confirmarSenha"
          >
            <template #suffix>
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="absolute right-4 top-1/2 -translate-y-1/2 text-[#757575] hover:text-accent"
              >
                <component
                  :is="showConfirmPassword ? EyeOff : Eye"
                  class="w-5 h-5"
                />
              </button>
            </template>
          </BaseInput>

          <div class="pt-6">
            <BaseButton
              type="submit"
              variant="brand"
              size="lg"
              class="w-full"
              :isLoading="isLoading"
              :icon="UserPlus"
            >
              Continuar
            </BaseButton>
          </div>
        </form>

        <p class="text-center text-[#757575] font-medium text-sm mt-8">
          Já tem uma conta?
          <a
            href="#"
            @click.prevent="router.push('/login')"
            class="text-accent hover:text-[#212121] transition-colors cursor-pointer font-bold"
            >Faça login aqui</a
          >
        </p>
      </div>
    </div>
  </div>
</template>
