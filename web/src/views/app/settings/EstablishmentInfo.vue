<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import localStorageService from '@/services/localStorageService';
import { useToast } from '@/composables/useToast';
import {
  Store, Save, FileText, MapPin, Phone,
  Clock, ArrowLeft, UploadCloud, AlertCircle, AlignLeft
} from 'lucide-vue-next';

const router = useRouter();
const { showToast } = useToast();

const isLoading = ref(false);
const logoPreview = ref(null);
const errors = ref({});

const form = ref({
  name: '',
  cnpj: '',
  phone: '',
  description: '',
});

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
  logoPreview.value = localStorageService.getImage();
});

const validateForm = () => {
  errors.value = {};
  if (!form.value.name) errors.value.name = "O nome fantasia é obrigatório.";
  if (!form.value.cnpj) errors.value.cnpj = "O CNPJ é obrigatório.";
  if (!form.value.phone) errors.value.phone = "Informe um telefone de contato.";

  return Object.keys(errors.value).length === 0;
};

const handleLogoUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => logoPreview.value = e.target.result;
    reader.readAsDataURL(file);
  }
};

const saveSettings = async () => {
  // 1. Validação com erro aparecendo no topo
  if (!validateForm()) {
    showToast('Existem campos obrigatórios vazios.', 'error');
    window.scrollTo({ top: 0, behavior: 'smooth' }); // UX: Sobe a tela para mostrar os erros
    return;
  }

  isLoading.value = true;
  try {
    // Lógica de salvamento no LocalStorage
    localStorageService.saveOnboarding({
      nome_estabelecimento: form.value.name,
      cnpj: form.value.cnpj,
      telefone: form.value.phone,
      endereco: form.value.address,
      descricao: form.value.description,
      horario: form.value.openingHours
    });

    if (logoPreview.value) localStorageService.saveImage(logoPreview.value);

    // 2. Feedback de sucesso no topo
    showToast('Dados do estabelecimento atualizados!', 'success');

  } catch (e) {
    showToast('Erro crítico ao salvar dados.', 'error');
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
          class="p-3 bg-white/5 border border-white/10 rounded-2xl text-gray-400 hover:text-white transition-all">
          <ArrowLeft :size="20" />
        </button>
        <div>
          <h1 class="text-3xl font-black text-white tracking-tight">Meu Estabelecimento</h1>
          <p class="text-gray-400 mt-1">Dados fiscais e de contato</p>
        </div>
      </div>

      <button @click="saveSettings" :disabled="isLoading"
        class="hidden sm:flex items-center gap-2 bg-brand-green text-black font-black px-8 py-4 rounded-2xl hover:bg-brand-green-hover transition-all active:scale-95 shadow-lg shadow-brand-green/20">
        <Save :size="20" />
        {{ isLoading ? 'Gravando...' : 'Salvar Dados' }}
      </button>
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

      <section class="lg:col-span-1 space-y-6">
        <div class="bg-dark-card border border-white/5 rounded-[2.5rem] p-8 shadow-xl flex flex-col items-center">
          <h3 class="text-lg font-bold text-white mb-6 w-full text-left">Logo da Marca</h3>

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

      <section class="lg:col-span-2 space-y-6">
        <div class="bg-dark-card border border-white/5 rounded-[3rem] p-8 shadow-xl">
          <div class="space-y-6">

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="text-xs font-black uppercase tracking-widest text-gray-500 ml-2">Nome do Negócio</label>
                <input v-model="form.name" type="text" :class="{ 'border-red-500': errors.name }"
                  class="admin-input w-full" placeholder="Ex: Hamburgueria 2000" />
                <p v-if="errors.name" class="text-red-500 text-[10px] font-bold ml-2 flex items-center gap-1">
                  <AlertCircle :size="10" /> {{ errors.name }}
                </p>
              </div>
              <div class="space-y-2">
                <label class="text-xs font-black uppercase tracking-widest text-gray-500 ml-2">CNPJ</label>
                <input v-model="form.cnpj" type="text" :class="{ 'border-red-500': errors.cnpj }"
                  class="admin-input w-full" placeholder="00.000.000/0001-00" />
                <p v-if="errors.cnpj" class="text-red-500 text-[10px] font-bold ml-2 flex items-center gap-1">
                  <AlertCircle :size="10" /> {{ errors.cnpj }}
                </p>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="text-xs font-black uppercase tracking-widest text-gray-500 ml-2">WhatsApp /
                  Contato</label>
                <input v-model="form.phone" type="text" :class="{ 'border-red-500': errors.phone }"
                  class="admin-input w-full" placeholder="(00) 00000-0000" />
                <p v-if="errors.phone" class="text-red-500 text-[10px] font-bold ml-2 flex items-center gap-1">
                  <AlertCircle :size="10" /> {{ errors.phone }}
                </p>
              </div>
              <div class="space-y-2">
                <label class="text-xs font-black uppercase tracking-widest text-gray-500 ml-2">Sobre o
                  Estabelecimento</label>
                <div class="relative">
                  <AlignLeft class="absolute left-4 top-4 text-gray-500" :size="20" />
                  <textarea v-model="form.description" rows="4" class="admin-input w-full pl-12 resize-none"
                    placeholder="Conte um pouco sobre a história ou especialidades do seu negócio..."></textarea>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>
    </div>

    <div class="mt-8 sm:hidden">
      <button @click="saveSettings" :disabled="isLoading"
        class="w-full bg-brand-green text-black font-black py-5 rounded-3xl shadow-xl active:scale-95 transition-all">
        Salvar Alterações
      </button>
    </div>
  </main>
</template>