<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { establishmentApi } from "@/services/establishmentApi";
import { useToast } from "@/composables/useToast";
import {
  Save,
  ArrowLeft,
  UploadCloud,
  AlertCircle,
  Smartphone,
  Copy,
  CheckCheck,
  RefreshCw,
  Banknote,
} from "lucide-vue-next";

const router = useRouter();
const { showToast } = useToast();

const isLoading = ref(false);
const isFetching = ref(true);
const logoPreview = ref(null);
const errors = ref({});

const ALL_PAYMENT_METHODS = [
  "Dinheiro",
  "Cartão Débito",
  "Cartão Crédito",
  "PIX",
];
const paymentMethods = ref([]);

const selfService = ref(false);
const selfServiceCode = ref("");
const codeCopied = ref(false);

const form = ref({ name: "", cnpj: "", phone: "", description: "" });
const originalForm = ref(null);

const isDirty = computed(() => {
  if (!originalForm.value) return false;
  return JSON.stringify(form.value) !== JSON.stringify(originalForm.value);
});

const maskCNPJ = (v) => {
  const d = v.replace(/\D/g, "").slice(0, 14);
  return d
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
};

const maskPhone = (v) => {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10)
    return d.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2");
  return d.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
};

onMounted(async () => {
  try {
    const profile = await establishmentApi.getProfile();

    form.value = {
      name: profile.name || "",
      cnpj: profile.cnpj || "",
      phone: "",
      description: "",
    };

    originalForm.value = { ...form.value };

    const serviceTypes = profile.serviceTypes
      ? JSON.parse(profile.serviceTypes)
      : [];
    selfService.value = serviceTypes.includes("Autoatendimento");
    selfServiceCode.value =
      profile.selfServiceCode ||
      Math.floor(100000 + Math.random() * 900000).toString();
  } catch (error) {
    showToast("Erro ao carregar dados do estabelecimento.", "error");
  } finally {
    isFetching.value = false;
  }
});

const validateAll = () => {
  errors.value = {};
  if (!form.value.name.trim())
    errors.value.name = "O nome fantasia é obrigatório.";
  if (form.value.cnpj.trim() && form.value.cnpj.replace(/\D/g, "").length < 14)
    errors.value.cnpj = "CNPJ incompleto.";
  return Object.keys(errors.value).length === 0;
};

const saveSettings = async () => {
  if (!validateAll()) {
    showToast("Corrija os erros antes de salvar.", "error");
    return;
  }

  isLoading.value = true;
  try {
    await establishmentApi.updateProfile({
      name: form.value.name,
      selfServiceCode: selfServiceCode.value,
    });

    originalForm.value = { ...form.value };
    showToast("Dados atualizados com sucesso!", "success");
  } catch (error) {
    showToast(error.message || "Erro ao salvar os dados.", "error");
  } finally {
    isLoading.value = false;
  }
};

const generateCode = () => {
  selfServiceCode.value = Math.floor(
    100000 + Math.random() * 900000,
  ).toString();
  isDirty.value = true;
};

const copyCode = () => {
  navigator.clipboard.writeText(selfServiceCode.value);
  codeCopied.value = true;
  setTimeout(() => {
    codeCopied.value = false;
  }, 2000);
};
</script>

<template>
  <main class="max-w-6xl mx-auto py-12 px-6 font-inter animate-fadeIn">
    <header class="flex items-center justify-between mb-10">
      <div class="flex items-center gap-4">
        <button
          @click="router.push('/app/dashboard')"
          class="p-3 bg-gray-50 border border-[#E0E0E0] rounded text-[#757575] hover:text-[#212121] hover:bg-gray-100 transition-all"
        >
          <ArrowLeft :size="20" />
        </button>
        <div>
          <h1 class="text-3xl font-black text-[#212121] tracking-tight">
            Meu Estabelecimento
          </h1>
          <p class="text-[#757575] mt-1 text-sm">Dados fiscais e de contato</p>
        </div>
      </div>
      <button
        @click="saveSettings"
        :disabled="!isDirty || isLoading"
        class="hidden sm:flex items-center gap-2 bg-primary text-white font-black px-8 py-4 rounded hover:bg-primary-dark transition-all active:scale-95 shadow-lg shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Save :size="20" />
        {{ isLoading ? "Gravando..." : "Salvar Dados" }}
      </button>
    </header>

    <div v-if="isFetching" class="text-center py-20 text-gray-500 font-bold">
      Carregando dados...
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <section class="lg:col-span-2">
        <div class="bg-white border border-[#E0E0E0] rounded p-8 shadow-xl">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-1.5">
              <label
                class="text-xs font-black uppercase tracking-widest text-[#757575] ml-1"
                >Nome do Negócio</label
              >
              <input
                v-model="form.name"
                maxlength="80"
                type="text"
                class="w-full py-3.5 px-4 rounded border bg-gray-50 border-[#E0E0E0] text-[#212121] focus:border-primary/50 focus:outline-none transition-all"
              />
            </div>
            <div class="space-y-1.5">
              <label
                class="text-xs font-black uppercase tracking-widest text-[#757575] ml-1"
                >CNPJ (Somente Leitura)</label
              >
              <input
                :value="form.cnpj"
                disabled
                type="text"
                class="w-full py-3.5 px-4 rounded border bg-gray-100 border-[#E0E0E0] text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>
