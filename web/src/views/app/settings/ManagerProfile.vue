<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from '@/composables/useToast';
import { Save, ArrowLeft, User, Mail, Phone, MapPin, CreditCard, AlertCircle } from 'lucide-vue-next';
import { isValidCPF, maskCPF } from '@/utils/validator';

const router = useRouter();
const { showToast } = useToast();

const PROFILE_KEY = 'managerProfile';

const isLoading = ref(false);
const errors = ref({});

const form = ref({
  fullName: '',
  email: '',
  phone: '',
  cpf: '',
  address: '',
  city: '',
  state: '',
  zip: '',
});

const maskPhone = (v) => {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 10) return d.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2');
  return d.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
};

const maskZip = (v) => {
  const d = v.replace(/\D/g, '').slice(0, 8);
  return d.replace(/^(\d{5})(\d)/, '$1-$2');
};

onMounted(() => {
  const saved = localStorage.getItem(PROFILE_KEY);
  if (saved) {
    Object.assign(form.value, JSON.parse(saved));
  } else {
    // Pre-fill from onboarding data if available
    const onboarding = JSON.parse(localStorage.getItem('onboarding_personal') || '{}');
    if (onboarding.nome) form.value.fullName = onboarding.nome;
    if (onboarding.email) form.value.email = onboarding.email;
    if (onboarding.cpf) form.value.cpf = onboarding.cpf;
  }
});

const validate = () => {
  errors.value = {};
  if (!form.value.fullName.trim()) errors.value.fullName = 'Nome completo é obrigatório.';
  if (!form.value.email.trim() || !form.value.email.includes('@')) errors.value.email = 'E-mail inválido.';
  if (!form.value.phone.trim()) errors.value.phone = 'Telefone é obrigatório.';
  if (form.value.cpf && !isValidCPF(form.value.cpf)) errors.value.cpf = 'CPF inválido.';
  return Object.keys(errors.value).length === 0;
};

const saveProfile = () => {
  if (!validate()) {
    showToast('Corrija os erros antes de salvar.', 'error');
    return;
  }
  isLoading.value = true;
  setTimeout(() => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(form.value));
    showToast('Dados salvos com sucesso!', 'success');
    isLoading.value = false;
  }, 400);
};
</script>

<template>
  <main class="max-w-4xl mx-auto py-12 px-6 font-inter">

    <header class="flex items-center justify-between mb-10">
      <div class="flex items-center gap-4">
        <button @click="router.back()"
          class="p-3 bg-gray-50 border border-[#E0E0E0] rounded text-[#757575] hover:text-[#212121] hover:bg-gray-100 transition-all">
          <ArrowLeft :size="20" />
        </button>
        <div>
          <h1 class="text-3xl font-black text-[#212121] tracking-tight">Meu Perfil</h1>
          <p class="text-[#757575] mt-1 text-sm">Dados pessoais e de contato para cobranças</p>
        </div>
      </div>
      <button @click="saveProfile" :disabled="isLoading"
        class="hidden sm:flex items-center gap-2 bg-primary text-white font-black px-8 py-4 rounded hover:bg-primary-dark transition-all active:scale-95 shadow-lg shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed">
        <Save :size="18" />
        {{ isLoading ? 'Salvando...' : 'Salvar Dados' }}
      </button>
    </header>

    <div class="bg-white border border-[#E0E0E0] rounded p-8 shadow-xl">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

        <!-- Nome completo -->
        <div class="space-y-1.5">
          <label class="text-xs font-black uppercase tracking-widest text-[#757575] ml-1 flex items-center gap-1.5">
            <User :size="11" /> Nome Completo
          </label>
          <input v-model="form.fullName" type="text" placeholder="Ex: João da Silva"
            class="w-full py-3.5 px-4 rounded border bg-gray-50 text-[#212121] placeholder-gray-600 focus:border-primary/50 focus:bg-gray-100 focus:outline-none transition-all"
            :class="errors.fullName ? 'border-red-500 bg-red-500/5' : 'border-[#E0E0E0]'" />
          <p v-if="errors.fullName" class="text-danger text-[11px] font-bold ml-1 flex items-center gap-1">
            <AlertCircle :size="11" /> {{ errors.fullName }}
          </p>
        </div>

        <!-- Email -->
        <div class="space-y-1.5">
          <label class="text-xs font-black uppercase tracking-widest text-[#757575] ml-1 flex items-center gap-1.5">
            <Mail :size="11" /> E-mail de Contato
          </label>
          <input v-model="form.email" type="email" placeholder="seu@email.com"
            class="w-full py-3.5 px-4 rounded border bg-gray-50 text-[#212121] placeholder-gray-600 focus:border-primary/50 focus:bg-gray-100 focus:outline-none transition-all"
            :class="errors.email ? 'border-red-500 bg-red-500/5' : 'border-[#E0E0E0]'" />
          <p v-if="errors.email" class="text-danger text-[11px] font-bold ml-1 flex items-center gap-1">
            <AlertCircle :size="11" /> {{ errors.email }}
          </p>
        </div>

        <!-- Telefone -->
        <div class="space-y-1.5">
          <label class="text-xs font-black uppercase tracking-widest text-[#757575] ml-1 flex items-center gap-1.5">
            <Phone :size="11" /> Telefone / WhatsApp
          </label>
          <input
            :value="form.phone"
            @input="(e) => { form.phone = maskPhone(e.target.value); e.target.value = form.phone; }"
            type="tel" placeholder="(00) 00000-0000"
            class="w-full py-3.5 px-4 rounded border bg-gray-50 text-[#212121] placeholder-gray-600 focus:border-primary/50 focus:bg-gray-100 focus:outline-none transition-all"
            :class="errors.phone ? 'border-red-500 bg-red-500/5' : 'border-[#E0E0E0]'" />
          <p v-if="errors.phone" class="text-danger text-[11px] font-bold ml-1 flex items-center gap-1">
            <AlertCircle :size="11" /> {{ errors.phone }}
          </p>
        </div>

        <!-- CPF -->
        <div class="space-y-1.5">
          <label class="text-xs font-black uppercase tracking-widest text-[#757575] ml-1 flex items-center gap-1.5">
            <CreditCard :size="11" /> CPF
          </label>
          <input
            :value="form.cpf"
            @input="(e) => { form.cpf = maskCPF(e.target.value); e.target.value = form.cpf; }"
            type="text" placeholder="000.000.000-00" maxlength="14"
            class="w-full py-3.5 px-4 rounded border bg-gray-50 text-[#212121] placeholder-gray-600 focus:border-primary/50 focus:bg-gray-100 focus:outline-none transition-all"
            :class="errors.cpf ? 'border-red-500 bg-red-500/5' : 'border-[#E0E0E0]'" />
          <p v-if="errors.cpf" class="text-danger text-[11px] font-bold ml-1 flex items-center gap-1">
            <AlertCircle :size="11" /> {{ errors.cpf }}
          </p>
        </div>

        <!-- Endereço -->
        <div class="md:col-span-2 space-y-1.5">
          <label class="text-xs font-black uppercase tracking-widest text-[#757575] ml-1 flex items-center gap-1.5">
            <MapPin :size="11" /> Endereço
          </label>
          <input v-model="form.address" type="text" placeholder="Rua, número, complemento"
            class="w-full py-3.5 px-4 rounded border border-[#E0E0E0] bg-gray-50 text-[#212121] placeholder-gray-600 focus:border-primary/50 focus:bg-gray-100 focus:outline-none transition-all" />
        </div>

        <!-- Cidade / Estado / CEP -->
        <div class="space-y-1.5">
          <label class="text-xs font-black uppercase tracking-widest text-[#757575] ml-1">Cidade</label>
          <input v-model="form.city" type="text" placeholder="Ex: São Paulo"
            class="w-full py-3.5 px-4 rounded border border-[#E0E0E0] bg-gray-50 text-[#212121] placeholder-gray-600 focus:border-primary/50 focus:bg-gray-100 focus:outline-none transition-all" />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label class="text-xs font-black uppercase tracking-widest text-[#757575] ml-1">Estado</label>
            <input v-model="form.state" type="text" placeholder="SP" maxlength="2"
              class="w-full py-3.5 px-4 rounded border border-[#E0E0E0] bg-gray-50 text-[#212121] placeholder-gray-600 focus:border-primary/50 focus:bg-gray-100 focus:outline-none transition-all uppercase" />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-black uppercase tracking-widest text-[#757575] ml-1">CEP</label>
            <input
              :value="form.zip"
              @input="(e) => { form.zip = maskZip(e.target.value); e.target.value = form.zip; }"
              type="text" placeholder="00000-000" maxlength="9"
              class="w-full py-3.5 px-4 rounded border border-[#E0E0E0] bg-gray-50 text-[#212121] placeholder-gray-600 focus:border-primary/50 focus:bg-gray-100 focus:outline-none transition-all" />
          </div>
        </div>

      </div>

      <div class="mt-8 pt-8 border-t border-[#E0E0E0] bg-amber-500/5 border border-amber-500/10 rounded p-4 flex items-start gap-3">
        <AlertCircle :size="16" class="text-amber-400 mt-0.5 shrink-0" />
        <p class="text-xs text-amber-700 leading-relaxed">
          Estes dados são utilizados exclusivamente para fins de cobrança e comunicação. Mantenha-os atualizados para evitar interrupções no serviço.
        </p>
      </div>
    </div>

    <div class="mt-6 sm:hidden">
      <button @click="saveProfile" :disabled="isLoading"
        class="w-full bg-primary text-white font-black py-5 rounded shadow-xl active:scale-95 transition-all disabled:opacity-40">
        {{ isLoading ? 'Salvando...' : 'Salvar Dados' }}
      </button>
    </div>

  </main>
</template>
