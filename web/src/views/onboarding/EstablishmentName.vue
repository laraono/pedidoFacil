<script setup>
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { Store, ArrowRight, Building2, Loader2 } from "lucide-vue-next";
import { isValidCNPJ, maskCNPJ } from "@/utils/validator";
import { establishmentApi } from "@/services/establishmentApi";
import LandingHeader from "@/components/LandingHeader.vue";
import imgOndas from "@/assets/ondas.png";

const router = useRouter();

const nomeEstabelecimento = ref("");
const cnpj = ref("");
const cnpjError = ref("");
const errors = ref({}); 

const isLoading = ref(false);
const serverError = ref(null);

onMounted(() => {
  window.scrollTo(0, 0);
});

watch(cnpj, (value) => {
  if (!value) return;
  const masked = maskCNPJ(value);
  if (masked !== value) cnpj.value = masked;
  if (cnpjError.value && isValidCNPJ(masked)) cnpjError.value = "";
});

watch(nomeEstabelecimento, () => {
  if (errors.value.name) delete errors.value.name;
});

const handleSubmit = async () => {
  cnpjError.value = "";
  errors.value = {};
  serverError.value = null;

  if (!nomeEstabelecimento.value.trim()) return;

  if (!cnpj.value.trim()) {
    cnpjError.value = "O CNPJ é obrigatório.";
    return;
  }
  if (!isValidCNPJ(cnpj.value)) {
    cnpjError.value = "O CNPJ inserido é inválido.";
    return;
  }

  isLoading.value = true;

  try {
    await establishmentApi.saveOnboardingStep({
      name: nomeEstabelecimento.value.trim(),
      cnpj: cnpj.value,
    });

    router.push("/onboarding/type");
  } catch (error) {
    const data = error.response?.data || error.data || error;
    
    if (data?.errors && Array.isArray(data.errors)) {
      data.errors.forEach((err) => {
        let field = err.campo.replace("body.", "");
        
        if (field === "name") errors.value.name = err.mensagem;
        if (field === "cnpj") cnpjError.value = err.mensagem;
      });
      
      serverError.value = "Verifique os campos destacados em vermelho.";
    } else {
      serverError.value = data?.message || "Erro ao registrar o estabelecimento. Tente novamente.";
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-page font-inter flex flex-col">
    <LandingHeader />

    <div
      class="flex-1 relative flex flex-col items-center justify-center p-6 md:p-12 overflow-hidden"
    >
      <div
        class="absolute top-1/2 left-0 w-full -translate-y-1/2 z-0 pointer-events-none opacity-40"
        :style="{ backgroundImage: `url(${imgOndas})` }"
        style="
          height: 70vh;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        "
      ></div>

      <div
        class="z-10 w-full max-w-2xl bg-white/90 border border-[#E0E0E0] p-8 md:p-16 rounded shadow-2xl relative backdrop-blur-xl text-center"
      >
        <div
          class="inline-flex items-center justify-center px-4 py-1.5 rounded bg-gray-50 border border-[#E0E0E0] mb-8"
        >
          <span class="text-accent text-xs font-bold uppercase tracking-widest"
            >Etapa 2 de 3</span
          >
        </div>

        <h1
          class="text-3xl md:text-5xl font-bold text-[#212121] mb-6 tracking-tight leading-tight"
        >
          Seu <span class="text-primary">estabelecimento</span>
        </h1>

        <p
          class="text-[#757575] text-lg mb-10 max-w-lg mx-auto leading-relaxed"
        >
          Informe o nome e CNPJ do seu estabelecimento.
        </p>

        <transition
          enter-active-class="transition duration-300"
          enter-from-class="opacity-0 -translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
        >
          <div
            v-if="serverError"
            class="mb-6 p-4 bg-danger-light border border-danger rounded text-danger font-bold text-sm text-left"
          >
            {{ serverError }}
          </div>
        </transition>

        <form
          @submit.prevent="handleSubmit"
          class="flex flex-col items-center w-full gap-4"
        >
          <div class="relative w-full max-w-lg group flex flex-col items-start">
            <div
              class="absolute left-5 top-[24px] text-[#757575] group-focus-within:text-accent transition-colors duration-300"
            >
              <Store class="w-6 h-6" />
            </div>
            <input
              type="text"
              v-model="nomeEstabelecimento"
              placeholder="Ex: Pizzaria Sabor de Casa"
              required
              autofocus
              minlength="3"
              maxlength="100"
              :disabled="isLoading"
              class="w-full p-6 pl-16 bg-gray-50 text-[#212121] rounded border text-xl placeholder-gray-600 focus:outline-none focus:bg-gray-100 transition-all duration-300 disabled:opacity-50"
              :class="
                errors.name
                  ? 'border-red-500 bg-red-500/5'
                  : 'border-[#E0E0E0] focus:border-primary/50'
              "
            />
            <p
              v-if="errors.name"
              class="text-red-500 text-xs font-bold text-left mt-1 ml-1"
            >
              {{ errors.name }}
            </p>
          </div>

          <div class="relative w-full max-w-lg group flex flex-col items-start">
            <div
              class="absolute left-5 top-[24px] text-[#757575] group-focus-within:text-accent transition-colors duration-300"
            >
              <Building2 class="w-6 h-6" />
            </div>
            <input
              type="text"
              v-model="cnpj"
              placeholder="CNPJ: 00.000.000/0000-00"
              maxlength="18"
              :disabled="isLoading"
              class="w-full p-6 pl-16 bg-gray-50 text-[#212121] rounded border text-xl placeholder-gray-600 focus:outline-none focus:bg-gray-100 transition-all duration-300 disabled:opacity-50"
              :class="
                cnpjError
                  ? 'border-red-500 bg-red-500/5'
                  : 'border-[#E0E0E0] focus:border-primary/50'
              "
            />
            <p
              v-if="cnpjError"
              class="text-red-500 text-xs font-bold text-left mt-1 ml-1"
            >
              {{ cnpjError }}
            </p>
          </div>

          <button
            type="submit"
            :disabled="
              !nomeEstabelecimento.trim() ||
              nomeEstabelecimento.length < 3 ||
              isLoading
            "
            class="mt-8 py-4 px-10 bg-primary text-white font-bold rounded text-xl hover:bg-primary-dark shadow-lg shadow-primary/40 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-3 group active:scale-[0.98] w-full max-w-lg"
          >
            <Loader2 v-if="isLoading" class="w-6 h-6 animate-spin" />
            <span v-else>Continuar</span>
            <ArrowRight
              v-if="!isLoading"
              class="w-6 h-6 transition-transform group-hover:translate-x-1"
            />
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
input::placeholder {
  opacity: 1;
}
</style>