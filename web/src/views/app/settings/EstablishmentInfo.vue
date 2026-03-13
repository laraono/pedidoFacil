<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import localStorageService from '@/services/localStorageService';
import { useToast } from '@/composables/useToast';
import { Save, ArrowLeft, UploadCloud, AlertCircle } from 'lucide-vue-next';

const router = useRouter();
const { showToast } = useToast();

const isLoading = ref(false);
const logoPreview = ref(null);
const errors = ref({});
const touched = ref({});

const form = ref({ name: '', cnpj: '', phone: '', description: '' });
const originalForm = ref(null);

const isDirty = computed(() =>
  originalForm.value !== null &&
  JSON.stringify(form.value) !== JSON.stringify(originalForm.value)
);

const maskCNPJ = (v) => {
  const d = v.replace(/\D/g, '').slice(0, 14);
  return d
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
};

const maskPhone = (v) => {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 10) return d.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2');
  return d.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
};

onMounted(() => {
  const data = localStorageService.getOnboarding();
  if (data) {
    form.value = {
      name: data.nome_estabelecimento || '',
      cnpj: data.cnpj || '',
      phone: data.telefone || '',
      description: data.descricao || '',
    };
  }
  originalForm.value = { ...form.value };
  logoPreview.value = localStorageService.getImage();
});

const validateAll = () => {
  errors.value = {};
  touched.value = { name: true, cnpj: true, phone: true, description: true };

  if (!form.value.name.trim()) errors.value.name = 'O nome fantasia é obrigatório.';
  if (!form.value.cnpj.trim()) errors.value.cnpj = 'O CNPJ é obrigatório.';
  else if (form.value.cnpj.replace(/\D/g, '').length < 14) errors.value.cnpj = 'CNPJ incompleto.';
  if (!form.value.phone.trim()) errors.value.phone = 'Informe um telefone de contato.';
  else if (form.value.phone.replace(/\D/g, '').length < 10) errors.value.phone = 'Telefone incompleto.';

  return Object.keys(errors.value).length === 0;
};

const handleLogoUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => { logoPreview.value = e.target.result; };
  reader.readAsDataURL(file);
};

const saveSettings = async () => {
  if (!validateAll()) {
    showToast('Corrija os erros antes de salvar.', 'error');
    return;
  }
  isLoading.value = true;
  try {
    localStorageService.saveOnboarding({
      nome_estabelecimento: form.value.name,
      cnpj: form.value.cnpj,
      telefone: form.value.phone,
      descricao: form.value.description,
    });
    if (logoPreview.value) localStorageService.saveImage(logoPreview.value);
    originalForm.value = { ...form.value };
    showToast('Dados atualizados com sucesso!', 'success');
  } catch {
    showToast('Erro ao salvar os dados.', 'error');
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <main class="max-w-6xl mx-auto py-12 px-6 font-inter animate-fadeIn">

    <header class="flex items-center justify-between mb-10">
      <div class="flex items-center gap-4">
        <button @click="router.push('/app/dashboard')"
          class="p-3 bg-white/5 border border-white/10 rounded-2xl text-gray-400 hover:text-white hover:bg-white/10 transition-all">
          <ArrowLeft :size="20" />
        </button>
        <div>
          <h1 class="text-3xl font-black text-white tracking-tight">Meu Estabelecimento</h1>
          <p class="text-gray-400 mt-1 text-sm">Dados fiscais e de contato</p>
        </div>
      </div>

      <button @click="saveSettings" :disabled="!isDirty || isLoading"
        class="hidden sm:flex items-center gap-2 bg-brand-green text-black font-black px-8 py-4 rounded-2xl hover:bg-brand-green-hover transition-all active:scale-95 shadow-lg shadow-brand-green/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100">
        <Save :size="20" />
        {{ isLoading ? 'Gravando...' : 'Salvar Dados' }}
      </button>
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

      <section class="lg:col-span-1">
        <div class="bg-dark-card border border-white/5 rounded-[2.5rem] p-8 shadow-xl flex flex-col items-center">
          <h3 class="text-base font-black text-white mb-6 w-full text-left uppercase tracking-widest text-[11px]">Logo
            da Marca</h3>
          <div class="relative group cursor-pointer w-48 h-48 mb-6">
            <div
              class="relative w-full h-full bg-white/5 border-2 border-dashed border-white/10 rounded-[2.5rem] overflow-hidden flex flex-col items-center justify-center group-hover:border-brand-green/50 transition-all">
              <img v-if="logoPreview" :src="logoPreview" class="w-full h-full object-contain p-4" />
              <div v-else class="flex flex-col items-center text-gray-500">
                <UploadCloud :size="40" class="mb-2" />
                <span class="text-xs font-bold uppercase tracking-widest">Subir Logo</span>
              </div>
              <input type="file" @change="handleLogoUpload" accept="image/*"
                class="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
          </div>
          <p class="text-[10px] text-gray-500 uppercase font-black tracking-widest">Clique para alterar</p>
        </div>
      </section>

      <section class="lg:col-span-2">
        <div class="bg-dark-card border border-white/5 rounded-[2.5rem] p-8 shadow-xl">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div class="space-y-1.5">
              <label class="text-xs font-black uppercase tracking-widest text-gray-300 ml-1">Nome do Negócio</label>
              <input v-model="form.name" maxlength="80" type="text" placeholder="Ex: Hamburgueria 2000"
                class="w-full py-3.5 px-4 rounded-2xl border bg-white/5 border-white/10 text-white placeholder-gray-600 focus:border-brand-green/50 focus:bg-white/10 focus:outline-none transition-all"
                :class="errors.name ? '!border-red-500 !bg-red-500/5' : ''" />
              <p v-if="errors.name" class="text-red-400 text-[11px] font-bold ml-1 flex items-center gap-1">
                <AlertCircle :size="11" /> {{ errors.name }}
              </p>
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-black uppercase tracking-widest text-gray-300 ml-1">CNPJ</label>
              <input :value="form.cnpj"
                @input="(e) => { form.cnpj = maskCNPJ(e.target.value); e.target.value = form.cnpj; }" maxlength="18"
                type="text" placeholder="00.000.000/0001-00"
                class="w-full py-3.5 px-4 rounded-2xl border bg-white/5 border-white/10 text-white placeholder-gray-600 focus:border-brand-green/50 focus:bg-white/10 focus:outline-none transition-all"
                :class="errors.cnpj ? '!border-red-500 !bg-red-500/5' : ''" />
              <p v-if="errors.cnpj" class="text-red-400 text-[11px] font-bold ml-1 flex items-center gap-1">
                <AlertCircle :size="11" /> {{ errors.cnpj }}
              </p>
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-black uppercase tracking-widest text-gray-300 ml-1">
                WhatsApp / Contato
              </label>
              <input :value="form.phone" @input="(e) => {
                const cleanValue = e.target.value.replace(/\D/g, '');
                form.phone = maskPhone(cleanValue);
                e.target.value = form.phone;
              }" maxlength="15" type="tel" inputmode="numeric" placeholder="(00) 00000-0000"
                class="w-full py-3.5 px-4 rounded-2xl border bg-white/5 border-white/10 text-white placeholder-gray-600 focus:border-brand-green/50 focus:bg-white/10 focus:outline-none transition-all"
                :class="errors.phone ? '!border-red-500 !bg-red-500/5' : ''" />
              <p v-if="errors.phone" class="text-red-400 text-[11px] font-bold ml-1 flex items-center gap-1">
                <AlertCircle :size="11" /> {{ errors.phone }}
              </p>
            </div>

            <div class="space-y-1.5">
              <div class="flex justify-between items-center ml-1 mr-1">
                <label class="text-xs font-black uppercase tracking-widest text-gray-300">Sobre o
                  Estabelecimento</label>
                <span class="text-[10px] text-gray-500 font-mono">{{ form.description.length }}/300</span>
              </div>
              <textarea v-model="form.description" maxlength="300" rows="4"
                placeholder="Conte um pouco sobre a história ou especialidades do seu negócio..."
                class="w-full py-3.5 px-4 rounded-2xl border bg-white/5 border-white/10 text-white placeholder-gray-600 focus:border-brand-green/50 focus:bg-white/10 focus:outline-none transition-all resize-none" />
            </div>

          </div>
        </div>
      </section>
    </div>

    <div class="mt-8 sm:hidden">
      <button @click="saveSettings" :disabled="!isDirty || isLoading"
        class="w-full bg-brand-green text-black font-black py-5 rounded-3xl shadow-xl active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
        {{ isLoading ? 'Gravando...' : 'Salvar Alterações' }}
      </button>
    </div>

  </main>
</template>
