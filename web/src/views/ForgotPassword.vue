<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { User, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-vue-next";
import { BaseButton, BaseInput } from "@/components/ui";
import { authApi } from "@/services/authApi";
import AuthLayout from "@/components/AuthLayout.vue";

const router = useRouter();

const email = ref("");
const isLoading = ref(false);
const sent = ref(false);
const error = ref(null);

onMounted(() => window.scrollTo(0, 0));

const handleSubmit = async () => {
  error.value = null;

  if (!email.value.trim()) {
    error.value = "Informe seu e-mail cadastrado.";
    return;
  }

  isLoading.value = true;

  try {
    await authApi.forgotPassword(email.value.trim());
    sent.value = true;
  } catch (err) {
    error.value = err.message || "Erro ao processar solicitação.";
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
        <div v-if="sent" class="text-center">
          <div
            class="w-16 h-16 bg-accent-light border border-accent/30 rounded flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle2 :size="32" class="text-accent" />
          </div>
          <h2 class="text-2xl font-black text-[#212121] mb-3">
            E-mail enviado!
          </h2>
          <p class="text-[#757575] text-sm mb-8 leading-relaxed">
            Se o endereço <b>{{ email }}</b> estiver em nossa base, você
            receberá um link para redefinir sua senha em instantes.
          </p>
          <BaseButton
            variant="secondary"
            size="lg"
            class="w-full"
            @click="router.push('/login')"
          >
            Voltar ao login
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
            <h2 class="text-3xl font-black text-[#212121] mb-2">
              Esqueci minha senha
            </h2>
            <p class="text-[#757575] text-sm">
              Enviaremos um link de redefinição para o seu e-mail.
            </p>
          </div>

          <div
            v-if="error"
            class="mb-6 p-4 bg-danger-light border border-danger rounded flex items-center gap-3 text-danger text-sm font-bold"
          >
            <AlertCircle :size="18" class="shrink-0" />
            <p>{{ error }}</p>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-5">
            <BaseInput
              v-model="email"
              label="Seu E-mail"
              type="email"
              :icon="User"
              placeholder="seu@email.com"
              :dark="false"
            />

            <div class="pt-2">
              <BaseButton
                type="submit"
                variant="brand"
                size="lg"
                class="w-full"
                :isLoading="isLoading"
                :icon="User"
              >
                Solicitar nova senha
              </BaseButton>
            </div>
          </form>
        </div>
      </div>
  </AuthLayout>
</template>
