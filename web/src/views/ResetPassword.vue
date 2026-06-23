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
import { BaseButton, BaseInput } from "@/components/ui";
import { authApi } from "@/services/authApi";
import { validatePasswordStrength } from "@/utils/password";
import AuthLayout from "@/components/AuthLayout.vue";

const router = useRouter();
const route = useRoute();

const token = ref("");
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

  if (!token.value) {
    router.push("/login");
  }
});

const validate = () => {
  errors.value = {};
  const err = validatePasswordStrength(newPassword.value);
  if (err) errors.value.newPassword = err;
  if (newPassword.value && newPassword.value !== confirmPassword.value)
    errors.value.confirmPassword = "As senhas não coincidem.";
  return Object.keys(errors.value).length === 0;
};

const handleReset = async () => {
  if (!validate()) return;

  isLoading.value = true;
  apiError.value = null;

  try {
    await authApi.resetPassword({
      token: token.value,
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
  <AuthLayout>
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
          <BaseButton
            variant="brand"
            size="lg"
            class="w-full"
            @click="router.push('/login')"
          >
            Ir para o login
          </BaseButton>
        </div>

        <div v-else>
          <div class="mb-10">
            <BaseButton
              variant="ghost"
              class="mb-6 text-sm"
              @click="router.push('/login')"
            >
              <ArrowLeft :size="16" /> Voltar ao login
            </BaseButton>
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
            <BaseInput
              v-model="newPassword"
              label="Nova Senha"
              :type="showNew ? 'text' : 'password'"
              :icon="Lock"
              placeholder="Mínimo 8 caracteres"
              :error="errors.newPassword"
              :dark="false"
            >
              <template #suffix>
                <button
                  type="button"
                  @click="showNew = !showNew"
                  class="absolute right-4 top-1/2 -translate-y-1/2 text-[#757575]"
                >
                  <Eye v-if="!showNew" :size="16" />
                  <EyeOff v-else :size="16" />
                </button>
              </template>
            </BaseInput>

            <BaseInput
              v-model="confirmPassword"
              label="Confirmar Senha"
              :type="showConfirm ? 'text' : 'password'"
              :icon="Lock"
              placeholder="Repita a nova senha"
              :error="errors.confirmPassword"
              :dark="false"
            >
              <template #suffix>
                <button
                  type="button"
                  @click="showConfirm = !showConfirm"
                  class="absolute right-4 top-1/2 -translate-y-1/2 text-[#757575]"
                >
                  <Eye v-if="!showConfirm" :size="16" />
                  <EyeOff v-else :size="16" />
                </button>
              </template>
            </BaseInput>

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
  </AuthLayout>
</template>
