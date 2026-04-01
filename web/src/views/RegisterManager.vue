<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { UserPlus, Eye, EyeOff } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';
import { BaseInput, BaseButton } from '@/components/ui';
import { isValidCPF, maskCPF } from '@/utils/validator';
// watch não é mais necessário — filtro é feito no handler @input
import LandingHeader from '@/components/LandingHeader.vue';
import imgOndas from '@/assets/ondas.png';

const router = useRouter();
const authStore = useAuthStore();

const nome = ref('');
const username = ref('');
const email = ref('');
const cpf = ref('');
const senha = ref('');
const confirmarSenha = ref('');

const showPassword = ref(false);
const showConfirmPassword = ref(false);

const isLoading = ref(false);
const errors = ref({});
const serverError = ref(null);

if (authStore.isAuthenticated) router.push('/app/dashboard');

onMounted(() => window.scrollTo(0, 0));

function onCpfInput(event) {
  const filtered = maskCPF(event.target.value);
  cpf.value = filtered;
  event.target.value = filtered; // evita flicker no DOM
  if (errors.value.cpf && isValidCPF(filtered)) errors.value.cpf = null;
}

function validate() {
  errors.value = {};

  if (!nome.value.trim().includes(' '))
    errors.value.nome = 'Por favor, insira seu nome e sobrenome.';

  if (!username.value.trim() || username.value.trim().length < 3)
    errors.value.username = 'Nome de usuário deve ter pelo menos 3 caracteres.';
  else if (!/^[a-z0-9_]+$/.test(username.value.trim()))
    errors.value.username = 'Use apenas letras minúsculas, números e _.';

  if (!email.value.trim())
    errors.value.email = 'O e-mail é obrigatório.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()))
    errors.value.email = 'Insira um e-mail válido.';

  if (!cpf.value.trim())
    errors.value.cpf = 'O CPF é obrigatório.';
  else if (!isValidCPF(cpf.value))
    errors.value.cpf = 'O CPF inserido é inválido.';

  if (senha.value.length < 8)
    errors.value.senha = 'A senha deve ter pelo menos 8 caracteres.';
  else if (!/[A-Z]/.test(senha.value))
    errors.value.senha = 'A senha deve conter pelo menos uma letra maiúscula.';
  else if (!/[0-9]/.test(senha.value))
    errors.value.senha = 'A senha deve conter pelo menos um número.';
  else if (!/[^A-Za-z0-9]/.test(senha.value))
    errors.value.senha = 'A senha deve conter pelo menos um caractere especial.';

  if (senha.value !== confirmarSenha.value)
    errors.value.confirmarSenha = 'As senhas não coincidem.';

  return Object.keys(errors.value).length === 0;
}

async function handleSubmit() {
  serverError.value = null;
  if (!validate()) return;

  isLoading.value = true;

  localStorage.setItem('onboarding_personal', JSON.stringify({
    nome: nome.value,
    username: username.value.trim(),
    email: email.value.trim(),
    cpf: cpf.value,
    senha: senha.value
  }));

  setTimeout(() => {
    router.push('/onboarding/name');
    isLoading.value = false;
  }, 1000);
}
</script>

<template>
  <div class="min-h-screen bg-page font-inter flex flex-col">
    <LandingHeader />

    <div class="flex-1 relative flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="absolute top-0 left-0 w-full h-full z-0 pointer-events-none opacity-40"
           :style="{ backgroundImage: `url(${imgOndas})`, backgroundSize: 'cover', backgroundPosition: 'center' }">
      </div>

      <div class="z-10 w-full max-w-xl bg-white border border-[#E0E0E0] p-8 sm:p-12 rounded shadow-2xl">
        <div class="mb-10 text-center">
          <h2 class="text-3xl font-black text-[#212121] mb-2">Crie a sua conta</h2>
          <p class="text-[#757575]">Preencha os dados do gestor principal</p>
        </div>

        <div v-if="serverError" class="mb-6 p-4 bg-danger-light border border-danger rounded text-danger text-sm">
          {{ serverError }}
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-5">
          <BaseInput v-model="nome" placeholder="Nome completo" dark :error="errors.nome" />
          <BaseInput v-model="username" placeholder="Nome de usuário (ex: joao_silva)" dark :error="errors.username" />
          <BaseInput v-model="email" type="email" placeholder="E-mail de contato" dark :error="errors.email" />
          <BaseInput v-model="cpf" placeholder="000.000.000-00" dark maxlength="14" :error="errors.cpf" @input="onCpfInput" />

          <BaseInput v-model="senha" :type="showPassword ? 'text' : 'password'" placeholder="Senha (mín. 8 car., maiúscula, número, especial)" dark :error="errors.senha">
            <template #suffix>
              <button type="button" @click="showPassword = !showPassword" class="absolute right-4 top-1/2 -translate-y-1/2 text-[#757575] hover:text-accent">
                <component :is="showPassword ? EyeOff : Eye" class="w-5 h-5" />
              </button>
            </template>
          </BaseInput>

          <BaseInput v-model="confirmarSenha" :type="showConfirmPassword ? 'text' : 'password'" placeholder="Confirme a senha" dark :error="errors.confirmarSenha">
            <template #suffix>
              <button type="button" @click="showConfirmPassword = !showConfirmPassword" class="absolute right-4 top-1/2 -translate-y-1/2 text-[#757575] hover:text-accent">
                <component :is="showConfirmPassword ? EyeOff : Eye" class="w-5 h-5" />
              </button>
            </template>
          </BaseInput>

          <div class="pt-6">
            <BaseButton type="submit" variant="brand" size="lg" class="w-full" :isLoading="isLoading" :icon="UserPlus">
              Continuar
            </BaseButton>
          </div>
        </form>

        <p class="text-center text-[#757575] font-medium text-sm mt-8">
          Já tem uma conta? <a href="#" @click.prevent="router.push('/login')" class="text-accent hover:text-[#212121] transition-colors cursor-pointer">Faça login aqui</a>
        </p>
      </div>
    </div>
  </div>
</template>
