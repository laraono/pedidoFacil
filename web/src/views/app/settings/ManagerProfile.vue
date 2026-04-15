<script setup>
import { ref, onMounted, nextTick, watch } from "vue";
import { useRouter } from "vue-router";
import { profileApi } from "@/services/profileApi";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "@/composables/useToast";
import {
  Save,
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  AlertCircle,
  Lock,
  Key,
} from "lucide-vue-next";
import { isValidCPF, maskCPF } from "@/utils/validator";

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

const maskPhone = (v) => {
  if (!v) return "";
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10)
    return d.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2");
  return d.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
};

const maskZip = (v) => {
  if (!v) return "";
  const d = v.replace(/\D/g, "").slice(0, 8);
  return d.replace(/^(\d{5})(\d)/, "$1-$2");
};

onMounted(async () => {
  try {
    const data = await profileApi.get();
    console.log("DADOS QUE CHEGARAM DO BACKEND:", data);
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
  if (!form.value.email.trim() || !form.value.email.includes("@"))
    errors.value.email = "E-mail inválido.";
  if (form.value.cpf && !isValidCPF(form.value.cpf))
    errors.value.cpf = "CPF inválido.";
  return Object.keys(errors.value).length === 0;
};

const validatePassword = () => {
  errors.value = {};
  if (!passwordForm.value.oldPassword)
    errors.value.oldPassword = "A senha atual é obrigatória.";
  if (
    !passwordForm.value.newPassword ||
    passwordForm.value.newPassword.length < 6
  )
    errors.value.newPassword = "A nova senha deve ter no mínimo 6 caracteres.";
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword)
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
      cpf: form.value.cpf ? form.value.cpf.replace(/\D/g, "") : "",
      phone: form.value.phone ? form.value.phone.replace(/\D/g, "") : "",
      address: form.value.address,
      city: form.value.city,
      state: form.value.state,
      zip: form.value.zip ? form.value.zip.replace(/\D/g, "") : "",
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
    showToast("Senha alterada com sucesso!", "success");
    passwordForm.value = { oldPassword: "", newPassword: "", confirmPassword: "" };
  } catch (error) {
    // 🔥 Captura Robusta de Erros Zod
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
          class="p-3 bg-gray-50 border border-[#E0E0E0] rounded text-[#757575] hover:text-[#212121] hover:bg-gray-100 transition-all"
        >
          <ArrowLeft :size="20" />
        </button>
        <div>
          <h1 class="text-3xl font-black text-[#212121] tracking-tight">
            Meu Perfil
          </h1>
          <p class="text-[#757575] mt-1 text-sm">
            Dados pessoais e de contato para cobranças
          </p>
        </div>
      </div>
      <button
        @click="saveProfile"
        :disabled="isLoadingProfile"
        class="hidden sm:flex items-center gap-2 bg-primary text-white font-black px-8 py-4 rounded hover:bg-primary-dark transition-all active:scale-95 shadow-lg shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Save :size="18" />
        {{ isLoadingProfile ? "Salvando..." : "Salvar Dados" }}
      </button>
    </header>

    <div class="space-y-8">
      <div class="bg-white border border-[#E0E0E0] rounded p-8 shadow-xl">
        <h2
          class="text-lg font-black text-[#212121] mb-6 flex items-center gap-2"
        >
          <User :size="20" class="text-primary" /> Informações Pessoais
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-1.5">
            <label
              class="text-xs font-black uppercase tracking-widest text-[#757575] ml-1 flex items-center gap-1.5"
            >
              <User :size="11" /> Nome Completo
            </label>
            <input
              v-model="form.fullName"
              type="text"
              placeholder="Ex: João da Silva"
              class="w-full py-3.5 px-4 rounded border bg-gray-50 text-[#212121] placeholder-gray-600 focus:border-primary/50 focus:bg-gray-100 focus:outline-none transition-all"
              :class="
                errors.fullName
                  ? 'border-red-500 bg-red-500/5'
                  : 'border-[#E0E0E0]'
              "
            />
            <p
              v-if="errors.fullName"
              class="text-danger text-[11px] font-bold ml-1 flex items-center gap-1"
            >
              <AlertCircle :size="11" /> {{ errors.fullName }}
            </p>
          </div>

          <div class="space-y-1.5">
            <label
              class="text-xs font-black uppercase tracking-widest text-[#757575] ml-1 flex items-center gap-1.5"
            >
              <Mail :size="11" /> E-mail de Login
            </label>
            <input
              v-model="form.email"
              type="email"
              placeholder="seu@email.com"
              class="w-full py-3.5 px-4 rounded border bg-gray-50 text-[#212121] placeholder-gray-600 focus:border-primary/50 focus:bg-gray-100 focus:outline-none transition-all"
              :class="
                errors.email
                  ? 'border-red-500 bg-red-500/5'
                  : 'border-[#E0E0E0]'
              "
            />
            <p
              v-if="errors.email"
              class="text-danger text-[11px] font-bold ml-1 flex items-center gap-1"
            >
              <AlertCircle :size="11" /> {{ errors.email }}
            </p>
          </div>

          <div class="space-y-1.5">
            <label
              class="text-xs font-black uppercase tracking-widest text-[#757575] ml-1 flex items-center gap-1.5"
            >
              <Phone :size="11" /> Telefone / WhatsApp
            </label>
            <input
              :value="form.phone"
              @input="
                (e) => {
                  form.phone = maskPhone(e.target.value);
                  e.target.value = form.phone;
                }
              "
              type="tel"
              placeholder="(00) 00000-0000"
              class="w-full py-3.5 px-4 rounded border bg-gray-50 text-[#212121] placeholder-gray-600 focus:border-primary/50 focus:bg-gray-100 focus:outline-none transition-all"
              :class="
                errors.phone
                  ? 'border-red-500 bg-red-500/5'
                  : 'border-[#E0E0E0]'
              "
            />
            <p
              v-if="errors.phone"
              class="text-danger text-[11px] font-bold ml-1 flex items-center gap-1"
            >
              <AlertCircle :size="11" /> {{ errors.phone }}
            </p>
          </div>

          <div class="space-y-1.5">
            <label
              class="text-xs font-black uppercase tracking-widest text-[#757575] ml-1 flex items-center gap-1.5"
            >
              <CreditCard :size="11" /> CPF
            </label>
            <input
              :value="form.cpf"
              @input="
                (e) => {
                  form.cpf = maskCPF(e.target.value);
                  e.target.value = form.cpf;
                }
              "
              type="text"
              placeholder="000.000.000-00"
              maxlength="14"
              class="w-full py-3.5 px-4 rounded border bg-gray-50 text-[#212121] placeholder-gray-600 focus:border-primary/50 focus:bg-gray-100 focus:outline-none transition-all"
              :class="
                errors.cpf ? 'border-red-500 bg-red-500/5' : 'border-[#E0E0E0]'
              "
            />
            <p
              v-if="errors.cpf"
              class="text-danger text-[11px] font-bold ml-1 flex items-center gap-1"
            >
              <AlertCircle :size="11" /> {{ errors.cpf }}
            </p>
          </div>

          <div class="md:col-span-2 space-y-1.5">
            <label
              class="text-xs font-black uppercase tracking-widest text-[#757575] ml-1 flex items-center gap-1.5"
            >
              <MapPin :size="11" /> Endereço
            </label>
            <input
              v-model="form.address"
              type="text"
              placeholder="Rua, número, complemento"
              class="w-full py-3.5 px-4 rounded border border-[#E0E0E0] bg-gray-50 text-[#212121] placeholder-gray-600 focus:border-primary/50 focus:bg-gray-100 focus:outline-none transition-all"
            />
          </div>

          <div class="space-y-1.5">
            <label
              class="text-xs font-black uppercase tracking-widest text-[#757575] ml-1"
              >Cidade</label
            >
            <input
              v-model="form.city"
              type="text"
              placeholder="Ex: São Paulo"
              class="w-full py-3.5 px-4 rounded border border-[#E0E0E0] bg-gray-50 text-[#212121] placeholder-gray-600 focus:border-primary/50 focus:bg-gray-100 focus:outline-none transition-all"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label
                class="text-xs font-black uppercase tracking-widest text-[#757575] ml-1"
                >Estado</label
              >
              <input
                v-model="form.state"
                type="text"
                placeholder="SP"
                maxlength="2"
                class="w-full py-3.5 px-4 rounded border border-[#E0E0E0] bg-gray-50 text-[#212121] placeholder-gray-600 focus:border-primary/50 focus:bg-gray-100 focus:outline-none transition-all uppercase"
              />
            </div>
            <div class="space-y-1.5">
              <label
                class="text-xs font-black uppercase tracking-widest text-[#757575] ml-1"
                >CEP</label
              >
              <input
                :value="form.zip"
                @input="
                  (e) => {
                    form.zip = maskZip(e.target.value);
                    e.target.value = form.zip;
                  }
                "
                type="text"
                placeholder="00000-000"
                maxlength="9"
                class="w-full py-3.5 px-4 rounded border border-[#E0E0E0] bg-gray-50 text-[#212121] placeholder-gray-600 focus:border-primary/50 focus:bg-gray-100 focus:outline-none transition-all"
              />
            </div>
          </div>
        </div>

        <div
          class="mt-8 pt-8 border-t border-[#E0E0E0] bg-amber-500/5 border border-amber-500/10 rounded p-4 flex items-start gap-3"
        >
          <AlertCircle :size="16" class="text-amber-400 mt-0.5 shrink-0" />
          <p class="text-xs text-amber-700 leading-relaxed">
            Mantenha seu E-mail e CPF sempre atualizados. Eles são as chaves
            principais para a recuperação da sua conta e emissão de notas.
          </p>
        </div>

        <div class="mt-6 sm:hidden">
          <button
            @click="saveProfile"
            :disabled="isLoadingProfile"
            class="w-full bg-primary text-white font-black py-5 rounded shadow-xl active:scale-95 transition-all disabled:opacity-40"
          >
            {{ isLoadingProfile ? "Salvando..." : "Salvar Dados" }}
          </button>
        </div>
      </div>

      <div class="bg-white border border-[#E0E0E0] rounded p-8 shadow-xl">
        <h2
          class="text-lg font-black text-[#212121] mb-6 flex items-center gap-2"
        >
          <Lock :size="20" class="text-[#757575]" /> Segurança da Conta
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-1.5 md:col-span-2">
            <label
              class="text-xs font-black uppercase tracking-widest text-[#757575] ml-1 flex items-center gap-1.5"
            >
              <Key :size="11" /> Senha Atual
            </label>
            <input
              v-model="passwordForm.oldPassword"
              type="password"
              placeholder="••••••••"
              class="w-full py-3.5 px-4 rounded border bg-gray-50 text-[#212121] placeholder-gray-600 focus:border-primary/50 focus:bg-gray-100 focus:outline-none transition-all"
              :class="
                errors.oldPassword
                  ? 'border-red-500 bg-red-500/5'
                  : 'border-[#E0E0E0]'
              "
            />
            <p
              v-if="errors.oldPassword"
              class="text-danger text-[11px] font-bold ml-1 flex items-center gap-1"
            >
              <AlertCircle :size="11" /> {{ errors.oldPassword }}
            </p>
          </div>

          <div class="space-y-1.5">
            <label
              class="text-xs font-black uppercase tracking-widest text-[#757575] ml-1"
              >Nova Senha</label
            >
            <input
              v-model="passwordForm.newPassword"
              type="password"
              placeholder="••••••••"
              class="w-full py-3.5 px-4 rounded border bg-gray-50 text-[#212121] placeholder-gray-600 focus:border-primary/50 focus:bg-gray-100 focus:outline-none transition-all"
              :class="
                errors.newPassword
                  ? 'border-red-500 bg-red-500/5'
                  : 'border-[#E0E0E0]'
              "
            />
            <p
              v-if="errors.newPassword"
              class="text-danger text-[11px] font-bold ml-1 flex items-center gap-1"
            >
              <AlertCircle :size="11" /> {{ errors.newPassword }}
            </p>
          </div>

          <div class="space-y-1.5">
            <label
              class="text-xs font-black uppercase tracking-widest text-[#757575] ml-1"
              >Confirmar Nova Senha</label
            >
            <input
              v-model="passwordForm.confirmPassword"
              type="password"
              placeholder="••••••••"
              class="w-full py-3.5 px-4 rounded border bg-gray-50 text-[#212121] placeholder-gray-600 focus:border-primary/50 focus:bg-gray-100 focus:outline-none transition-all"
              :class="
                errors.confirmPassword
                  ? 'border-red-500 bg-red-500/5'
                  : 'border-[#E0E0E0]'
              "
            />
            <p
              v-if="errors.confirmPassword"
              class="text-danger text-[11px] font-bold ml-1 flex items-center gap-1"
            >
              <AlertCircle :size="11" /> {{ errors.confirmPassword }}
            </p>
          </div>
        </div>

        <div class="mt-8 flex justify-end">
          <button
            @click="savePassword"
            :disabled="isLoadingPassword"
            class="flex items-center gap-2 bg-gray-100 text-[#212121] font-black px-8 py-4 rounded border border-[#E0E0E0] hover:bg-gray-200 transition-all active:scale-95 disabled:opacity-40 w-full sm:w-auto justify-center"
          >
            <Lock :size="18" />
            {{ isLoadingPassword ? "Validando..." : "Atualizar Senha" }}
          </button>
        </div>
      </div>
    </div>
  </main>
</template>
