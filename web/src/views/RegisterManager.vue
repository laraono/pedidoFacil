<script setup>
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { UserPlus, Info, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-vue-next'; 
import { useAuthStore } from '@/stores/auth'; 
import { BaseInput, BaseButton } from '@/components/ui';
import { isValidCPF, maskCPF } from '@/utils/validator';
import imgOndas from '@/assets/ondas.png';

const router = useRouter();
const authStore = useAuthStore();

const nome = ref('');
const email = ref('');
const cpf = ref('');
const senha = ref('');
const confirmarSenha = ref('');

const showPassword = ref(false);
const showConfirmPassword = ref(false);

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

    // Validações
    if (!nome.value.trim().includes(' ')) {
        localError.value = 'Por favor, insira seu nome e sobrenome.';
        isLoading.value = false;
        return;
    };
    if (senha.value !== confirmarSenha.value) {
        localError.value = 'As senhas não coincidem.';
        isLoading.value = false;
        return;
    };
    if (senha.value.length < 6) {
        localError.value = 'A senha deve ter pelo menos 6 caracteres.';
        isLoading.value = false;
        return;
    };
    if (!isValidCPF(cpf.value)) {
        localError.value = 'O CPF inserido é inválido.';
        isLoading.value = false;
        return;
    };

    // Simulando processamento
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
</script>

<template>
  <div class="min-h-screen bg-dark-bg font-inter relative flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="absolute top-0 left-0 w-full h-full z-0 pointer-events-none opacity-40"
         :style="{ backgroundImage: `url(${imgOndas})`, backgroundSize: 'cover', backgroundPosition: 'center' }">
    </div>

    <div class="z-10 w-full max-w-xl bg-dark-card border border-white/10 p-8 sm:p-12 rounded-[2.5rem] shadow-2xl">
      <div class="mb-10 text-center">
        <h2 class="text-3xl font-black text-white mb-2">Crie a sua conta</h2>
        <p class="text-gray-400">Preencha os dados do gestor principal</p>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-5">
        <BaseInput v-model="nome" placeholder="Nome completo" :icon="User" dark required />
        <BaseInput v-model="email" type="email" placeholder="O seu melhor email" :icon="Mail" dark required />
        <BaseInput v-model="cpf" placeholder="000.000.000-00" :icon="CreditCard" dark required maxlength="14" />
        
        <BaseInput v-model="senha" :type="showPassword ? 'text' : 'password'" placeholder="Palavra-passe (mín. 6 caracteres)" :icon="Lock" dark required minlength="6">
          <template #suffix>
            <button type="button" @click="showPassword = !showPassword" class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-brand-green">
              <component :is="showPassword ? EyeOff : Eye" class="w-5 h-5" />
            </button>
          </template>
        </BaseInput>

        <BaseInput v-model="confirmarSenha" :type="showConfirmPassword ? 'text' : 'password'" placeholder="Confirme a palavra-passe" :icon="Lock" dark required minlength="6">
          <template #suffix>
            <button type="button" @click="showConfirmPassword = !showConfirmPassword" class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-brand-green">
              <component :is="showConfirmPassword ? EyeOff : Eye" class="w-5 h-5" />
            </button>
          </template>
        </BaseInput>

        <div class="pt-6">
            <BaseButton type="submit" variant="brand" size="lg" class="w-full" :isLoading="isLoading" :icon="UserPlus">
              Finalizar registo
            </BaseButton>
        </div>
      </form>
      
      <p class="text-center text-gray-400 font-medium text-sm mt-8">
          Já tem uma conta? <a href="#" @click.prevent="router.push('/login')" class="text-brand-green hover:text-white transition-colors cursor-pointer">Faça login aqui</a>
      </p>
    </div>
  </div>
</template>