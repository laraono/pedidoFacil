<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-vue-next';
import { BaseButton } from '@/components/ui';
import LandingHeader from '@/components/LandingHeader.vue';
import imgOndas from '@/assets/ondas.png';

const router = useRouter();

const pendingUsername = ref(null);
const newPassword = ref('');
const confirmPassword = ref('');
const showNew = ref(false);
const showConfirm = ref(false);
const isLoading = ref(false);
const done = ref(false);
const errors = ref({});

onMounted(() => {
  window.scrollTo(0, 0);
  const u = localStorage.getItem('pendingReset');
  if (!u) {
    router.push('/login');
    return;
  }
  const users = JSON.parse(localStorage.getItem('users')) || [];
  const found = users.find(user => user.username === u || user.email === u);
  if (!found) {
    localStorage.removeItem('pendingReset');
    router.push('/login');
    return;
  }
  pendingUsername.value = u;
});

const validate = () => {
  errors.value = {};
  if (!newPassword.value || newPassword.value.length < 6)
    errors.value.newPassword = 'A senha deve ter ao menos 6 caracteres.';
  if (newPassword.value !== confirmPassword.value)
    errors.value.confirmPassword = 'As senhas não coincidem.';
  return Object.keys(errors.value).length === 0;
};

const handleReset = () => {
  if (!validate()) return;
  isLoading.value = true;

  setTimeout(() => {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const idx = users.findIndex(u =>
      u.username === pendingUsername.value || u.email === pendingUsername.value
    );
    if (idx !== -1) {
      users[idx].password = newPassword.value;
      localStorage.setItem('users', JSON.stringify(users));
    }
    localStorage.removeItem('pendingReset');
    isLoading.value = false;
    done.value = true;
  }, 600);
};
</script>

<template>
  <div class="min-h-screen bg-page font-inter flex flex-col">
    <LandingHeader />

    <div class="flex-1 relative flex flex-col items-center justify-center p-4">
    <div class="absolute top-0 left-0 w-full h-full z-0 pointer-events-none opacity-40"
         :style="{ backgroundImage: `url(${imgOndas})`, backgroundSize: 'cover', backgroundPosition: 'center' }">
    </div>

    <div class="z-10 w-full max-w-md bg-white/90 border border-[#E0E0E0] p-8 sm:p-12 rounded shadow-2xl">

      <!-- Success state -->
      <div v-if="done" class="text-center">
        <div class="w-16 h-16 bg-accent-light border border-accent/30 rounded flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 :size="32" class="text-accent" />
        </div>
        <h2 class="text-2xl font-black text-[#212121] mb-3">Senha redefinida!</h2>
        <p class="text-[#757575] text-sm mb-8">Sua senha foi alterada com sucesso. Faça login com a nova senha.</p>
        <button @click="router.push('/login')"
          class="w-full py-3.5 rounded bg-primary text-white font-black hover:bg-primary-dark transition-all">
          Ir para o login
        </button>
      </div>

      <!-- Form state -->
      <div v-else>
        <div class="mb-10">
          <button @click="router.push('/login')" class="flex items-center gap-2 text-[#757575] hover:text-[#212121] transition-colors mb-6 text-sm font-bold">
            <ArrowLeft :size="16" /> Voltar ao login
          </button>
          <h2 class="text-3xl font-black text-[#212121] mb-2">Redefinir senha</h2>
          <p class="text-[#757575] text-sm">Digite e confirme sua nova senha.</p>
        </div>

        <form @submit.prevent="handleReset" class="space-y-5">
          <!-- Nova senha -->
          <div>
            <label class="text-xs font-black uppercase tracking-widest text-[#757575] ml-2 mb-2 block">Nova Senha</label>
            <div class="relative">
              <Lock :size="16" class="absolute left-4 top-1/2 -translate-y-1/2 text-[#757575]" />
              <input
                v-model="newPassword"
                :type="showNew ? 'text' : 'password'"
                placeholder="Mínimo 6 caracteres"
                class="w-full bg-gray-50 border rounded pl-10 pr-12 py-3.5 text-sm text-[#212121] outline-none placeholder:text-[#757575] transition-colors"
                :class="errors.newPassword ? 'border-danger' : 'border-[#E0E0E0] focus:border-primary/40'"
                @input="delete errors.newPassword"
              />
              <button type="button" @click="showNew = !showNew"
                class="absolute right-4 top-1/2 -translate-y-1/2 text-[#757575] hover:text-[#757575] transition-colors">
                <Eye v-if="!showNew" :size="16" />
                <EyeOff v-else :size="16" />
              </button>
            </div>
            <p v-if="errors.newPassword" class="text-danger text-xs font-bold mt-1 ml-2 flex items-center gap-1">
              <AlertCircle :size="11" /> {{ errors.newPassword }}
            </p>
          </div>

          <!-- Confirmar senha -->
          <div>
            <label class="text-xs font-black uppercase tracking-widest text-[#757575] ml-2 mb-2 block">Confirmar Nova Senha</label>
            <div class="relative">
              <Lock :size="16" class="absolute left-4 top-1/2 -translate-y-1/2 text-[#757575]" />
              <input
                v-model="confirmPassword"
                :type="showConfirm ? 'text' : 'password'"
                placeholder="Repita a senha"
                class="w-full bg-gray-50 border rounded pl-10 pr-12 py-3.5 text-sm text-[#212121] outline-none placeholder:text-[#757575] transition-colors"
                :class="errors.confirmPassword ? 'border-danger' : 'border-[#E0E0E0] focus:border-primary/40'"
                @input="delete errors.confirmPassword"
              />
              <button type="button" @click="showConfirm = !showConfirm"
                class="absolute right-4 top-1/2 -translate-y-1/2 text-[#757575] hover:text-[#757575] transition-colors">
                <Eye v-if="!showConfirm" :size="16" />
                <EyeOff v-else :size="16" />
              </button>
            </div>
            <p v-if="errors.confirmPassword" class="text-danger text-xs font-bold mt-1 ml-2 flex items-center gap-1">
              <AlertCircle :size="11" /> {{ errors.confirmPassword }}
            </p>
          </div>

          <div class="pt-2">
            <BaseButton type="submit" variant="brand" size="lg" class="w-full" :isLoading="isLoading" :icon="Lock">
              Salvar nova senha
            </BaseButton>
          </div>
        </form>
      </div>
    </div>
    </div>
  </div>
</template>
