<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { User, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-vue-next";
import { BaseButton } from "@/components/ui";
import { useAuthStore } from "@/stores/auth";
import LandingHeader from "@/components/LandingHeader.vue";
import imgOndas from "@/assets/ondas.png";

const router = useRouter();
const authStore = useAuthStore();

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
    await authStore.forgotPassword(email.value.trim());
    sent.value = true;
  } catch (err) {
    error.value = err.message || "Erro ao processar solicitação.";
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
          <button
            @click="router.push('/login')"
            class="w-full py-3.5 rounded bg-gray-50 border border-[#E0E0E0] text-[#757575] font-bold hover:bg-gray-100 hover:text-[#212121] transition-all"
          >
            Voltar ao login
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
            <div>
              <label
                class="text-xs font-black uppercase tracking-widest text-[#757575] ml-2 mb-2 block"
                >Seu E-mail</label
              >
              <div class="relative">
                <User
                  :size="16"
                  class="absolute left-4 top-1/2 -translate-y-1/2 text-[#757575]"
                />
                <input
                  v-model="email"
                  type="email"
                  placeholder="seu@email.com"
                  class="w-full bg-gray-50 border border-[#E0E0E0] rounded pl-10 pr-4 py-3.5 text-sm text-[#212121] outline-none placeholder:text-[#757575] focus:border-primary/40 transition-colors"
                  required
                />
              </div>
            </div>

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
    </div>
  </div>
</template>
