<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { getImageUrl, validateImageFile } from "@/utils/imageUrl";
import { maskCNPJ, maskPhone } from "@/utils/validator";
import { establishmentApi } from "@/services/establishmentApi";
import { useToast } from "@/composables/useToast";
import { useFormValidation } from "@/composables/useFormValidation";
import { useAsyncAction } from "@/composables/useAsyncAction";
import { BaseInput, BaseButton, BaseToggle, PageHeader } from "@/components/ui";
import { Save, UploadCloud, AlertCircle, Smartphone, Copy, CheckCheck, Banknote } from "lucide-vue-next";

const { showToast } = useToast();
const { loading: isSaving, run: runSave } = useAsyncAction();

const isFetching = ref(true);
const logoPreview = ref(null);
const logoFile = ref(null);

const ALL_PAYMENT_METHODS = ["Dinheiro", "Cartão Débito", "Cartão Crédito", "PIX"];
const paymentMethods = ref([]);
const originalPaymentMethods = ref([]);

const togglePaymentMethod = (method) => {
  if (method === "Dinheiro") {
    showToast("A aceitação de dinheiro é obrigatória por lei.", "warning");
    return;
  }
  const idx = paymentMethods.value.indexOf(method);
  if (idx === -1) paymentMethods.value.push(method);
  else if (paymentMethods.value.length > 1) paymentMethods.value.splice(idx, 1);
};

const selfService = ref(false);
const originalSelfService = ref(false);
const selfServiceCode = ref("");
const codeCopied = ref(false);

const copyCode = () => {
  navigator.clipboard.writeText(selfServiceCode.value);
  codeCopied.value = true;
  setTimeout(() => { codeCopied.value = false; }, 2000);
};

const form = ref({ name: "", cnpj: "", phone: "" });
const originalForm = ref(null);
const originalLogo = ref(null);

const isDirty = computed(() =>
  originalForm.value !== null && (
    JSON.stringify(form.value) !== JSON.stringify(originalForm.value) ||
    logoPreview.value !== originalLogo.value ||
    JSON.stringify([...paymentMethods.value].sort()) !== JSON.stringify([...originalPaymentMethods.value].sort()) ||
    selfService.value !== originalSelfService.value
  )
);

const validationRules = {
  name: [
    { validator: (v) => !!v?.trim(), message: "O nome fantasia é obrigatório." },
    { validator: (v) => !v?.trim() || v.trim().length >= 3, message: "O nome deve ter pelo menos 3 caracteres." },
  ],
  cnpj: [{ validator: (v) => !v?.trim() || v.replace(/\D/g, "").length === 14, message: "CNPJ incompleto." }],
  phone: [{ validator: (v) => !v?.trim() || v.replace(/\D/g, "").length >= 10, message: "Telefone incompleto." }],
};
const { errors, validateAll } = useFormValidation(validationRules);

onMounted(async () => {
  isFetching.value = true;
  try {
    const data = await establishmentApi.getProfile();

    form.value = { name: data.name || "", cnpj: data.cnpj || "", phone: data.phone || "" };
    logoPreview.value = getImageUrl(data.configurations?.logo);

    if (data.paymentMethods?.length > 0) {
      paymentMethods.value = data.paymentMethods.map((pm) => typeof pm === "string" ? pm : pm.name);
      if (!paymentMethods.value.includes("Dinheiro")) paymentMethods.value.push("Dinheiro");
    } else {
      paymentMethods.value = [...ALL_PAYMENT_METHODS];
    }

    selfService.value = !!data.selfServiceEnabled;
    selfServiceCode.value = data.selfServiceCode || "";

    originalForm.value = { ...form.value };
    originalLogo.value = logoPreview.value;
    originalPaymentMethods.value = [...paymentMethods.value];
    originalSelfService.value = !!data.selfServiceEnabled;
  } catch {
    showToast("Erro ao carregar dados do estabelecimento.", "error");
  } finally {
    isFetching.value = false;
  }
});

const handleLogoUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const error = validateImageFile(file);
  if (error) { showToast(error, "error"); event.target.value = ""; return; }
  logoFile.value = file;
  logoPreview.value = URL.createObjectURL(file);
};

const saveSettings = async () => {
  if (!validateAll({ name: form.value.name, cnpj: form.value.cnpj, phone: form.value.phone })) {
    showToast("Corrija os erros antes de salvar.", "error");
    return;
  }

  await runSave(async () => {
    try {
      const formData = new FormData();
      formData.append("name", form.value.name);
      formData.append("cnpj", form.value.cnpj);
      formData.append("phone", form.value.phone);

      if (!paymentMethods.value.includes("Dinheiro")) paymentMethods.value.push("Dinheiro");
      formData.append("paymentMethods", JSON.stringify(paymentMethods.value));
      formData.append("selfServiceEnabled", selfService.value);
      if (logoFile.value) formData.append("logo", logoFile.value);

      const updated = await establishmentApi.updateProfile(formData);

      originalForm.value = { ...form.value };
      originalLogo.value = logoPreview.value;
      logoFile.value = null;
      originalPaymentMethods.value = [...paymentMethods.value];
      originalSelfService.value = selfService.value;
      if (updated?.selfServiceCode) selfServiceCode.value = updated.selfServiceCode;

      showToast("Dados atualizados com sucesso!", "success");
    } catch (error) {
      const data = error.response?.data || error.data;
      const zodErrors = data?.errors;
      if (zodErrors?.length > 0) {
        zodErrors.forEach((err) => {
          const field = err.campo?.replace("body.", "");
          if (field && field in errors.value) errors.value[field] = err.mensagem;
        });
        showToast(zodErrors[0].mensagem, "error");
      } else {
        showToast(data?.message || error.message || "Erro ao salvar os dados.", "error");
      }
    }
  });
};
</script>

<template>
  <main class="max-w-6xl mx-auto py-12 px-6 font-inter animate-fadeIn">
    <PageHeader
      title="Meu Estabelecimento"
      subtitle="Dados fiscais e de contato"
      backTo="/app/dashboard"
    >
      <template #actions>
        <BaseButton
          variant="primary"
          size="lg"
          :isLoading="isSaving"
          :disabled="!isDirty || isFetching"
          class="hidden sm:flex"
          @click="saveSettings"
        >
          <Save :size="20" /> Salvar Dados
        </BaseButton>
      </template>
    </PageHeader>

    <div v-if="isFetching" class="flex justify-center items-center py-20 text-[#757575] font-bold">
      Carregando informações do estabelecimento...
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <section class="lg:col-span-1">
        <div class="bg-white border border-[#E0E0E0] rounded p-8 shadow-xl flex flex-col items-center">
          <h3 class="text-base font-black text-[#212121] mb-6 w-full text-left uppercase tracking-widest text-[11px]">
            Logo da Marca
          </h3>
          <div class="relative group cursor-pointer w-48 h-48 mb-6">
            <div class="relative w-full h-full bg-gray-50 border-2 border-dashed border-[#E0E0E0] rounded overflow-hidden flex flex-col items-center justify-center group-hover:border-accent/50 transition-all">
              <img v-if="logoPreview" :src="logoPreview" class="w-full h-full object-contain p-4" />
              <div v-else class="flex flex-col items-center text-[#757575]">
                <UploadCloud :size="40" class="mb-2" />
                <span class="text-xs font-bold uppercase tracking-widest">Subir Logo</span>
              </div>
              <input type="file" @change="handleLogoUpload" accept=".jpg,.jpeg,.png,.webp,.gif" class="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
          </div>
          <p class="text-[10px] text-[#757575] uppercase font-black tracking-widest">Clique para alterar</p>
        </div>
      </section>

      <section class="lg:col-span-2">
        <div class="bg-white border border-[#E0E0E0] rounded p-8 shadow-xl">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="md:col-span-2">
              <BaseInput
                v-model="form.name"
                label="Nome do Negócio"
                placeholder="Ex: Hamburgueria 2000"
                :error="errors.name"
                maxlength="80"
              />
            </div>

            <BaseInput
              :model-value="form.cnpj"
              label="CNPJ"
              placeholder="00.000.000/0001-00"
              :error="errors.cnpj"
              maxlength="18"
              @input="(e) => { form.cnpj = maskCNPJ(e.target.value); e.target.value = form.cnpj; }"
            />

            <BaseInput
              :model-value="form.phone"
              label="WhatsApp / Contato"
              placeholder="(00) 00000-0000"
              :error="errors.phone"
              maxlength="15"
              @input="(e) => { const d = e.target.value.replace(/\D/g, ''); form.phone = maskPhone(d); e.target.value = form.phone; }"
            />
          </div>
        </div>
      </section>
    </div>

    <div v-if="!isFetching" class="mt-8">
      <div class="bg-white border border-[#E0E0E0] rounded p-8 shadow-xl">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 bg-accent-light border border-accent/30 rounded flex items-center justify-center">
            <Banknote :size="20" class="text-accent" />
          </div>
          <div>
            <h3 class="text-base font-black text-[#212121]">Métodos de Pagamento</h3>
            <p class="text-sm text-[#757575] mt-0.5">Selecione os métodos aceitos no seu estabelecimento.</p>
          </div>
        </div>
        <div class="flex flex-wrap gap-3">
          <button
            v-for="method in ALL_PAYMENT_METHODS"
            :key="method"
            type="button"
            @click="togglePaymentMethod(method)"
            class="flex items-center gap-2 px-5 py-3 rounded border-2 font-bold text-sm transition-all"
            :class="[
              paymentMethods.includes(method) ? 'bg-accent-light border-accent/40 text-accent' : 'bg-gray-50 border-[#E0E0E0] text-[#757575]',
              method === 'Dinheiro' ? 'opacity-90 cursor-not-allowed' : ''
            ]"
          >
            <div
              class="w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors"
              :class="paymentMethods.includes(method) ? 'bg-accent border-accent' : 'border-[#E0E0E0]'"
            >
              <CheckCheck v-if="paymentMethods.includes(method)" :size="10" class="text-white" />
            </div>
            {{ method }}
          </button>
        </div>

        <div class="mt-6 flex items-start gap-2 p-4 bg-blue-500/5 rounded border border-blue-500/10">
          <AlertCircle :size="16" class="text-blue-500 shrink-0 mt-0.5" />
          <p class="text-xs font-bold text-[#757575] leading-relaxed">
            Por lei (Art. 39, inciso IX do Código de Defesa do Consumidor), estabelecimentos comerciais no Brasil são obrigados a aceitar pagamentos em dinheiro em espécie. Por este motivo, esta opção encontra-se bloqueada para desativação.
          </p>
        </div>
      </div>
    </div>

    <div v-if="!isFetching" class="mt-8">
      <div class="bg-white border border-[#E0E0E0] rounded p-8 shadow-xl">
        <BaseToggle
          v-model="selfService"
          label="Autoatendimento"
          description="Permite que clientes façam pedidos pelo aplicativo móvel."
          class="mb-2"
        />

        <Transition name="slide-down">
          <div v-if="selfService" class="mt-6 border-t border-[#E0E0E0] pt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="bg-gray-50 border border-[#E0E0E0] rounded p-6 flex flex-col gap-4">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 bg-accent-light border border-accent/30 rounded flex items-center justify-center">
                    <Smartphone :size="22" class="text-accent" />
                  </div>
                  <div>
                    <p class="font-black text-[#212121] text-sm">Aplicativo Mobile</p>
                    <p class="text-xs text-[#757575]">Para iOS e Android</p>
                  </div>
                </div>
                <p class="text-xs text-[#757575] leading-relaxed">
                  Os clientes baixam o app PedidoFácil e inserem o código do seu estabelecimento para acessar o cardápio.
                </p>
              </div>

              <div class="bg-gray-50 border border-[#E0E0E0] rounded p-6 flex flex-col gap-4">
                <div>
                  <p class="font-black text-[#212121] text-sm mb-1">Código de Acesso</p>
                  <p class="text-xs text-[#757575]">Compartilhe este código com seus clientes</p>
                </div>
                <div class="flex-1 bg-gray-100 border border-accent/30 rounded px-6 py-4 text-center">
                  <span class="text-4xl font-black text-accent tracking-[0.3em]">{{ selfServiceCode }}</span>
                </div>
                <button
                  @click="copyCode"
                  class="flex items-center justify-center gap-2 py-2.5 px-4 bg-accent-light border border-accent/30 rounded text-xs font-black transition-all text-accent"
                >
                  <component :is="codeCopied ? CheckCheck : Copy" :size="14" />
                  {{ codeCopied ? "Copiado!" : "Copiar código" }}
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <div class="mt-8 sm:hidden">
      <BaseButton
        variant="primary"
        size="lg"
        :isLoading="isSaving"
        :disabled="!isDirty || isFetching"
        class="w-full !py-5"
        @click="saveSettings"
      >
        Salvar Alterações
      </BaseButton>
    </div>
  </main>
</template>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-8px);
}
.slide-down-enter-to,
.slide-down-leave-from {
  opacity: 1;
  max-height: 600px;
}
</style>
