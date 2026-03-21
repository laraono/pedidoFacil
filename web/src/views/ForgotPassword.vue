<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { User, ArrowLeft, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-vue-next';
import { BaseButton } from '@/components/ui';
import imgOndas from '@/assets/ondas.png';

const router = useRouter();

const identifier = ref('');
const isLoading = ref(false);
const sent = ref(false);
const error = ref(null);

const handleSubmit = () => {
  error.value = null;
  if (!identifier.value.trim()) {
    error.value = 'Informe seu usuário ou e-mail.';
    return;
  }
  isLoading.value = true;

  setTimeout(() => {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const found = users.find(u =>
      u.email === identifier.value.trim() || u.username === identifier.value.trim()
    );
    if (found) {
      localStorage.setItem('pendingReset', found.username || found.email);
    }
    isLoading.value = false;
    sent.value = true;
  }, 1200);
};
</script>

<template>
  <div class="min-h-screen bg-page font-inter relative flex flex-col items-center justify-center p-4">
    <div class="absolute top-0 left-0 w-full h-full z-0 pointer-events-none opacity-40"
         :style="{ backgroundImage: `url(${imgOndas})`, backgroundSize: 'cover', backgroundPosition: 'center' }">
    </div>

    <div class="z-10 w-full max-w-md bg-white/90  border border-[#E0E0E0] p-8 sm:p-12 rounded shadow-2xl">

      <!-- Success state -->
      <div v-if="sent" class="text-center">
        <div class="w-16 h-16 bg-accent-light border border-accent/30 rounded flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 :size="32" class="text-accent" />
        </div>
        <h2 class="text-2xl font-black text-[#212121] mb-3">Instruções enviadas!</h2>
        <p class="text-[#757575] text-sm mb-8">
          Se o usuário existir, um link de redefinição será enviado. Verifique sua caixa de entrada.
        </p>
        <div class="p-4 bg-amber-500/5 border border-amber-500/15 rounded mb-6">
          <p class="text-amber-700 text-xs font-bold mb-3">Ambiente de demonstração</p>
          <button
            @click="router.push('/reset-password')"
            class="w-full flex items-center justify-center gap-2 py-3 rounded bg-accent-light border border-accent/30 text-accent text-sm font-black hover:bg-primary-dark/20 transition-all"
          >
            Simular clique no link recebido <ArrowRight :size="14" />
          </button>
        </div>
        <button @click="router.push('/login')"
          class="w-full py-3.5 rounded bg-gray-50 border border-[#E0E0E0] text-[#757575] font-bold hover:bg-gray-100 hover:text-[#212121] transition-all">
          Voltar ao login
        </button>
      </div>

      <!-- Form state -->
      <div v-else>
        <div class="mb-10">
          <button @click="router.push('/login')" class="flex items-center gap-2 text-[#757575] hover:text-[#212121] transition-colors mb-6 text-sm font-bold">
            <ArrowLeft :size="16" /> Voltar ao login
          </button>
          <h2 class="text-3xl font-black text-[#212121] mb-2">Esqueci minha senha</h2>
          <p class="text-[#757575] text-sm">Informe seu nome de usuário ou e-mail cadastrado.</p>
        </div>

        <div v-if="error" class="mb-6 p-4 bg-danger-light border border-danger rounded flex items-center gap-3 text-danger text-sm">
          <AlertCircle :size="18" class="shrink-0" />
          <p>{{ error }}</p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-5">
          <div>
            <label class="text-xs font-black uppercase tracking-widest text-[#757575] ml-2 mb-2 block">Usuário ou E-mail</label>
            <div class="relative">
              <User :size="16" class="absolute left-4 top-1/2 -translate-y-1/2 text-[#757575]" />
              <input
                v-model="identifier"
                type="text"
                placeholder="seu_usuario ou seu@email.com"
                class="w-full bg-gray-50 border border-[#E0E0E0] rounded pl-10 pr-4 py-3.5 text-sm text-[#212121] outline-none placeholder:text-[#757575] focus:border-primary/40 transition-colors"
                required
              />
            </div>
          </div>

          <div class="pt-2">
            <BaseButton type="submit" variant="brand" size="lg" class="w-full" :isLoading="isLoading" :icon="User">
              Enviar instruções
            </BaseButton>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
