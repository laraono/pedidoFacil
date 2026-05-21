<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
} from "lucide-vue-next";
import { BaseButton } from "@/components/ui";
import { useAuthStore } from "@/stores/auth";
import LandingHeader from "@/components/LandingHeader.vue";
import imgOndas from "@/assets/ondas.png";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const token = ref("");
const email = ref("");
const newPassword = ref("");
const confirmPassword = ref("");
const showNew = ref(false);
const showConfirm = ref(false);
const isLoading = ref(false);
const done = ref(false);
const apiError = ref(null);
const errors = ref({});

onMounted(() => {
  window.scrollTo(0, 0);
  token.value = route.query.token;
  email.value = route.query.email;

  if (!token.value || !email.value) {
    router.push("/login");
  }
});

const validate = () => {
  errors.value = {};
  if (!newPassword.value || newPassword.value.length < 8) {
    errors.value.newPassword = "A senha deve ter ao menos 8 caracteres.";
  }
  if (newPassword.value !== confirmPassword.value) {
    errors.value.confirmPassword = "As senhas não coincidem.";
  }
  return Object.keys(errors.value).length === 0;
};

const handleReset = async () => {
  if (!validate()) return;

  isLoading.value = true;
  apiError.value = null;

  try {
    await authStore.resetPassword({
      token: token.value,
      email: email.value,
      novaSenha: newPassword.value,
    });
    done.value = true;
  } catch (err) {
    apiError.value =
      err.message || "Erro ao redefinir senha. O link pode ter expirado.";
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-page font-inter flex flex-col">
    <LandingHeader />

    <div class="flex-1 relative flex flex-col items-center justify-center p-4">
      <div
        class="absolute top-0 left-0 w-full h-full z-0 pointer-events-none opacity-40"
        :style="{
          backgroundImage: `url(${imgOndas})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }"
      ></div>

      <div
        class="z-10 w-full max-w-md bg-white border border-[#E0E0E0] p-8 sm:p-12 rounded shadow-2xl"
      >
        <div v-if="done" class="text-center">
          <div
            class="w-16 h-16 bg-accent-light border border-accent/30 rounded flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle2 :size="32" class="text-accent" />
          </div>
          <h2 class="text-2xl font-black text-[#212121] mb-3">
            Senha alterada!
          </h2>
          <p class="text-[#757575] text-sm mb-8 leading-relaxed">
            Sua nova senha foi salva com sucesso. Você já pode acessar sua
            conta.
          </p>
          <button
            @click="router.push('/login')"
            class="w-full py-3.5 rounded bg-primary text-white font-black hover:bg-primary-dark transition-all"
          >
            Ir para o login
          </button>
        </div>

        <div v-else>
          <div class="mb-10">
            <button
              @click="router.push('/login')"
              class="flex items-center gap-2 text-[#757575] hover:text-[#212121] transition-colors mb-6 text-sm font-bold"
            >
              <ArrowLeft :size="16" /> Voltar ao login
            </button>
            <h2 class="text-3xl font-black text-[#212121] mb-2">Nova senha</h2>
            <p class="text-[#757575] text-sm">
              Crie uma nova senha de acesso para <b>{{ email }}</b
              >.
            </p>
          </div>

          <div
            v-if="apiError"
            class="mb-6 p-4 bg-danger-light border border-danger rounded flex items-center gap-3 text-danger text-sm font-bold"
          >
            <AlertCircle :size="18" class="shrink-0" />
            <p>{{ apiError }}</p>
          </div>

          <form @submit.prevent="handleReset" class="space-y-5">
            <div>
              <label
                class="text-xs font-black uppercase tracking-widest text-[#757575] ml-2 mb-2 block"
                >Nova Senha</label
              >
              <div class="relative">
                <Lock
                  :size="16"
                  class="absolute left-4 top-1/2 -translate-y-1/2 text-[#757575]"
                />
                <input
                  v-model="newPassword"
                  :type="showNew ? 'text' : 'password'"
                  placeholder="Mínimo 8 caracteres"
                  class="w-full bg-gray-50 border rounded pl-10 pr-12 py-3.5 text-sm text-[#212121] outline-none transition-colors"
                  :class="
                    errors.newPassword
                      ? 'border-danger'
                      : 'border-[#E0E0E0] focus:border-primary/40'
                  "
                />
                <button
                  type="button"
                  @click="showNew = !showNew"
                  class="absolute right-4 top-1/2 -translate-y-1/2 text-[#757575]"
                >
                  <Eye v-if="!showNew" :size="16" />
                  <EyeOff v-else :size="16" />
                </button>
              </div>
              <p
                v-if="errors.newPassword"
                class="text-danger text-[10px] font-bold mt-1 ml-2 flex items-center gap-1"
              >
                <AlertCircle :size="11" /> {{ errors.newPassword }}
              </p>
            </div>

            <div>
              <label
                class="text-xs font-black uppercase tracking-widest text-[#757575] ml-2 mb-2 block"
                >Confirmar Senha</label
              >
              <div class="relative">
                <Lock
                  :size="16"
                  class="absolute left-4 top-1/2 -translate-y-1/2 text-[#757575]"
                />
                <input
                  v-model="confirmPassword"
                  :type="showConfirm ? 'text' : 'password'"
                  placeholder="Repita a nova senha"
                  class="w-full bg-gray-50 border rounded pl-10 pr-12 py-3.5 text-sm text-[#212121] outline-none transition-colors"
                  :class="
                    errors.confirmPassword
                      ? 'border-danger'
                      : 'border-[#E0E0E0] focus:border-primary/40'
                  "
                />
                <button
                  type="button"
                  @click="showConfirm = !showConfirm"
                  class="absolute right-4 top-1/2 -translate-y-1/2 text-[#757575]"
                >
                  <Eye v-if="!showConfirm" :size="16" />
                  <EyeOff v-else :size="16" />
                </button>
              </div>
              <p
                v-if="errors.confirmPassword"
                class="text-danger text-[10px] font-bold mt-1 ml-2 flex items-center gap-1"
              >
                <AlertCircle :size="11" /> {{ errors.confirmPassword }}
              </p>
            </div>

            <div class="pt-2">
              <BaseButton
                type="submit"
                variant="brand"
                size="lg"
                class="w-full"
                :isLoading="isLoading"
                :icon="Lock"
              >
                Salvar nova senha
              </BaseButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
