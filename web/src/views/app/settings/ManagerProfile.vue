<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { profileApi } from "@/services/profileApi";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "@/composables/useToast";
import { Save, ArrowLeft, AlertCircle, Lock } from "lucide-vue-next";
import { isValidCPF, maskCPF, maskPhone, maskZip } from "@/utils/validator";
import { validatePasswordStrength } from "@/utils/password";
import { BaseInput, BaseButton } from "@/components/ui";

const router = useRouter();
const authStore = useAuthStore();
const { showToast } = useToast();

const isLoadingProfile = ref(false);
const isLoadingPassword = ref(false);
const errors = ref({});

const form = ref({
  fullName: "",
  email: "",
  phone: "",
  cpf: "",
  address: "",
  city: "",
  state: "",
  zip: "",
});

const passwordForm = ref({
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
});


onMounted(async () => {
  try {
    const data = await profileApi.get();
    form.value.fullName = data.name || "";
    form.value.email = data.email || "";
    form.value.cpf = data.cpf ? maskCPF(data.cpf) : "";
    form.value.phone = data.phone ? maskPhone(data.phone) : "";
    form.value.address = data.address || "";
    form.value.city = data.city || "";
    form.value.state = data.state || "";
    form.value.zip = data.zip ? maskZip(data.zip) : "";
  } catch (error) {
    showToast("Erro ao carregar os dados do perfil.", "error");
  }
});

const validateProfile = () => {
  errors.value = {};
  if (!form.value.fullName.trim())
    errors.value.fullName = "Nome completo é obrigatório.";
  if (!form.value.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email.trim()))
    errors.value.email = "E-mail inválido.";
  if (form.value.cpf && !isValidCPF(form.value.cpf))
    errors.value.cpf = "CPF inválido.";
  return Object.keys(errors.value).length === 0;
};

const validatePassword = () => {
  errors.value = {};
  if (!passwordForm.value.oldPassword)
    errors.value.oldPassword = "A senha atual é obrigatória.";
  const p = passwordForm.value.newPassword;
  const pwErr = validatePasswordStrength(p || "");
  if (pwErr) errors.value.newPassword = pwErr;
  if (p && p !== passwordForm.value.confirmPassword)
    errors.value.confirmPassword = "As senhas não coincidem.";
  return Object.keys(errors.value).length === 0;
};

const saveProfile = async () => {
  if (!validateProfile()) {
    showToast("Corrija os erros antes de salvar.", "error");
    return;
  }

  isLoadingProfile.value = true;

  try {
    const payload = {
      name: form.value.fullName,
      email: form.value.email,
      cpf: form.value.cpf ? form.value.cpf.replace(/\D/g, "") : null,
      phone: form.value.phone ? form.value.phone.replace(/\D/g, "") : null,
      address: form.value.address || null,
      city: form.value.city || null,
      state: form.value.state || null,
      zip: form.value.zip ? form.value.zip.replace(/\D/g, "") : null,
    };

    const updatedUser = await profileApi.update(payload);
    authStore.user.name = updatedUser.name;
    authStore.user.email = updatedUser.email;
    showToast("Dados salvos com sucesso!", "success");
  } catch (error) {
    const data = error.response?.data || error.data || error;
    if (data?.errors && Array.isArray(data.errors)) {
      data.errors.forEach((err) => {
        let field = err.campo.replace("body.", "");
        if (field === "name") field = "fullName";
        errors.value[field] = err.mensagem;
      });
      showToast("Verifique os campos destacados em vermelho.", "error");
    } else {
      showToast(data?.message || "Erro ao salvar perfil.", "error");
    }
  } finally {
    isLoadingProfile.value = false;
  }
};

const savePassword = async () => {
  if (!validatePassword()) {
    showToast("Corrija os erros no formulário de senha.", "error");
    return;
  }

  isLoadingPassword.value = true;

  try {
    await profileApi.changePassword({
      oldPassword: passwordForm.value.oldPassword,
      newPassword: passwordForm.value.newPassword,
    });
    showToast("Senha alterada com sucesso! Redirecionando para o login...", "success");
    passwordForm.value = { oldPassword: "", newPassword: "", confirmPassword: "" };
    setTimeout(async () => {
      await authStore.logout();
      router.push("/login");
    }, 2500);
  } catch (error) {
    const data = error.response?.data || error.data || error;
    if (data?.errors && Array.isArray(data.errors)) {
      data.errors.forEach((err) => {
        let field = err.campo.replace("body.", "");
        errors.value[field] = err.mensagem;
      });
      showToast("Verifique os erros no formulário de senha.", "error");
    } else {
      showToast(data?.message || "Erro ao alterar senha.", "error");
    }
  } finally {
    isLoadingPassword.value = false;
  }
};
</script>

<template>
  <main class="max-w-4xl mx-auto py-12 px-6 font-inter">
    <header class="flex items-center justify-between mb-10">
      <div class="flex items-center gap-4">
        <button
          @click="router.back()"
          class="p-3 bg-gray-50 border border-[#E0E0E0] rounded text-muted hover:text-[#212121] hover:bg-gray-100 transition-all"
        >
          <ArrowLeft :size="20" />
        </button>
        <div>
          <h1 class="text-3xl font-black text-[#212121] tracking-tight">Meu Perfil</h1>
          <p class="text-muted mt-1 text-sm">Dados pessoais e de contato para cobranças</p>
        </div>
      </div>
      <BaseButton variant="primary" :icon="Save" :isLoading="isLoadingProfile" class="hidden sm:flex" @click="saveProfile">
        Salvar Dados
      </BaseButton>
    </header>

    <div class="space-y-8">
      <div class="bg-white border border-[#E0E0E0] rounded p-8 shadow-xl">
        <h2 class="text-lg font-black text-[#212121] mb-6 flex items-center gap-2">
          Informações Pessoais
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BaseInput v-model="form.fullName" label="Nome Completo" placeholder="Ex: João da Silva" maxlength="100" :error="errors.fullName" />

          <BaseInput v-model="form.email" type="email" label="E-mail de Login" placeholder="seu@email.com" maxlength="254" :error="errors.email" />

          <BaseInput
            :modelValue="form.phone"
            type="tel"
            label="Telefone / WhatsApp"
            placeholder="(00) 00000-0000"
            :error="errors.phone"
            @input="(e) => { form.phone = maskPhone(e.target.value); e.target.value = form.phone; }"
          />

          <BaseInput
            :modelValue="form.cpf"
            label="CPF"
            placeholder="000.000.000-00"
            maxlength="14"
            :error="errors.cpf"
            @input="(e) => { form.cpf = maskCPF(e.target.value); e.target.value = form.cpf; }"
          />

          <div class="md:col-span-2">
            <BaseInput v-model="form.address" label="Endereço" placeholder="Rua, número, complemento" maxlength="255" :error="errors.address" />
          </div>

          <BaseInput v-model="form.city" label="Cidade" placeholder="Ex: São Paulo" maxlength="100" :error="errors.city" />

          <div class="grid grid-cols-2 gap-4">
            <BaseInput v-model="form.state" label="Estado" placeholder="SP" maxlength="2" :error="errors.state" />
            <BaseInput
              :modelValue="form.zip"
              label="CEP"
              placeholder="00000-000"
              maxlength="9"
              :error="errors.zip"
              @input="(e) => { form.zip = maskZip(e.target.value); e.target.value = form.zip; }"
            />
          </div>
        </div>

        <div class="mt-8 pt-8 border-t border-[#E0E0E0] bg-amber-500/5 border border-amber-500/10 rounded p-4 flex items-start gap-3">
          <AlertCircle :size="16" class="text-amber-400 mt-0.5 shrink-0" />
          <p class="text-xs text-amber-700 leading-relaxed">
            Mantenha seu E-mail e CPF sempre atualizados. Eles são as chaves
            principais para a recuperação da sua conta e emissão de notas.
          </p>
        </div>

        <div class="mt-6 sm:hidden">
          <BaseButton variant="primary" :isLoading="isLoadingProfile" class="w-full" @click="saveProfile">
            Salvar Dados
          </BaseButton>
        </div>
      </div>

      <div class="bg-white border border-[#E0E0E0] rounded p-8 shadow-xl">
        <h2 class="text-lg font-black text-[#212121] mb-6 flex items-center gap-2">
          <Lock :size="20" class="text-muted" /> Segurança da Conta
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="md:col-span-2">
            <BaseInput v-model="passwordForm.oldPassword" type="password" label="Senha Atual" placeholder="••••••••" :error="errors.oldPassword" />
          </div>

          <BaseInput v-model="passwordForm.newPassword" type="password" label="Nova Senha" placeholder="••••••••" :error="errors.newPassword" />

          <BaseInput v-model="passwordForm.confirmPassword" type="password" label="Confirmar Nova Senha" placeholder="••••••••" :error="errors.confirmPassword" />
        </div>

        <div class="mt-8 flex justify-end">
          <BaseButton variant="secondary" :icon="Lock" :isLoading="isLoadingPassword" class="w-full sm:w-auto" @click="savePassword">
            Atualizar Senha
          </BaseButton>
        </div>
      </div>
    </div>
  </main>
</template>