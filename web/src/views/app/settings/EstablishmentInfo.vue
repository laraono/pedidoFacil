<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useOnboardingStore } from '@/stores/onboarding';
import { ArrowLeft, CheckCircle, Upload } from 'lucide-vue-next';
import { maskCNPJ, isValidCNPJ } from '@/utils/validator';
import { getEstablishmentMock, updateEstablishmentMock } from '@/mock/stablishmentmock';
import localStorageService from '@/services/localStorageService';

const router = useRouter();
const authStore = useAuthStore();
const onboardingStore = useOnboardingStore();

const nomeEstabelecimento = ref('');
const cnpj = ref('');
const endereco = ref('');
const metodosPagamento = ref([]);
const formasAtendimento = ref([]);
const isLoading = ref(false);
const localError = ref(null);
const fileInput = ref(null);

const paymentOptions = ['Crédito', 'Débito', 'Dinheiro', 'Pix'];

const serviceOptions = [
  'Autoatendimento (totens)',
  'Atendimento por garçons (tablets)',
  'Atendimento no caixa'
];

watch(cnpj, (value) => {
  if (!value) return;
  const masked = maskCNPJ(value);
  if (masked !== value) {
    cnpj.value = masked;
  }
});

onMounted(async () => {
  const data = await getEstablishmentMock();

  if (data?.info) {
    nomeEstabelecimento.value = data.info.name || '';
    cnpj.value = data.info.cnpj || '';
    endereco.value = data.info.address || '';
    metodosPagamento.value = data.info.paymentMethods || [];
    formasAtendimento.value = data.info.serviceMethods || [];
  }

  const nomeOnboarding = onboardingStore.estabelecimentoData.nome_estabelecimento;
  if (nomeOnboarding) {
    nomeEstabelecimento.value = nomeOnboarding;
  }

  const tiposAtendimentoOnboarding = onboardingStore.estabelecimentoData.tipo_atendimento;
  if (tiposAtendimentoOnboarding?.length) {
    formasAtendimento.value = tiposAtendimentoOnboarding
      .map(tipo => {
        if (tipo === 'Autoatendimento') return 'Autoatendimento (totens)';
        if (tipo === 'Garçom') return 'Atendimento por garçons (tablets)';
        return '';
      })
      .filter(Boolean);
  }
});

const saveInfo = async () => {
  localError.value = null;
  isLoading.value = true;

  if (!isValidCNPJ(cnpj.value)) {
    localError.value = 'CNPJ inválido.';
    isLoading.value = false;
    return;
  }

  await updateEstablishmentMock({
    name: nomeEstabelecimento.value,
    cnpj: cnpj.value,
    address: endereco.value,
    paymentMethods: metodosPagamento.value,
    serviceMethods: formasAtendimento.value
  });

  authStore.setConfigStepComplete('info');

  isLoading.value = false;
  router.push('/app/dashboard');
};

const triggerFileInput = () => {
  fileInput.value.click()
}

const uploadImage = (event) => {  
  const file = event.target.files[0];
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader();

    reader.onload = (e) => {
      const base64String = e.target.result;
      localStorageService.saveImage(base64String);
      fileInput.value = base64String;
    };

    reader.readAsDataURL(file);
  }
}
</script>

<template>
  <main class="max-w-4xl mx-auto py-12 px-4 font-inter">
    
    <div class="flex items-center mb-8">
        <button @click="router.back()" class="p-2 text-gray-500 hover:text-gray-800 transition-colors mr-4">
            <ArrowLeft :size="30" />
        </button>
        <h1 class="text-3xl font-bold text-gray-800 flex items-center tracking-tight">
          Informações do Estabelecimento
          <CheckCircle v-if="authStore.configStatus.info" :size="24" class="text-green-500 ml-4" />
        </h1>
    </div>

    <form @submit.prevent="saveInfo" class="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div>
          <h2 class="text-2xl font-bold text-gray-800 mb-4">Informações gerais</h2>
          
          <div class="mb-6">
            <label for="nome" class="block text-gray-600 font-semibold mb-2">Nome do Estabelecimento:</label>
            <input type="text" id="nome" v-model="nomeEstabelecimento" placeholder="Digite o nome" required
                   minlength="3" maxlength="100"
                   class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green text-gray-900 placeholder-gray-400 transition-all outline-none" />
          </div>

          <div class="mb-6">
            <label for="cnpj" class="block text-gray-600 font-semibold mb-2">CNPJ:</label>
            <input type="text" id="cnpj" v-model="cnpj" placeholder="00.000.000/0000-00" required
                   maxlength="18"
                   class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green text-gray-900 placeholder-gray-400 transition-all outline-none" />
            <p v-if="localError" class="text-red-500 text-sm mt-2 font-medium flex items-center gap-1">
              <CheckCircle :size="14" class="rotate-180" /> {{ localError }}
            </p>
          </div>

          <div class="mb-6">
            <label for="endereco" class="block text-gray-600 font-semibold mb-2">Endereço:</label>
            <input type="text" id="endereco" v-model="endereco" placeholder="Rua, Número, Bairro, Cidade - UF"
                   maxlength="255"
                   class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green text-gray-900 placeholder-gray-400 transition-all outline-none" />
          </div>

          <div class="mb-6">
            <label class="block text-gray-600 font-semibold mb-2">Logo da Marca:</label>
            <div class="p-3 border border-gray-300 rounded-lg bg-gray-50 flex justify-between items-center text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors border-dashed border-2">
              <span class="text-gray-500 text-sm">Fazer upload (PNG ou JPG)</span>
              <Upload :size="20" class="text-gray-400" />
            </div>
          </div>
        </div>

        <div>
          <h2 class="text-2xl font-bold text-gray-800 mb-4">Configurações de Operação</h2>

          <div class="mb-8">
            <p class="block text-gray-600 font-semibold mb-3">Métodos de pagamento:</p>
            <div v-for="option in paymentOptions" :key="option" class="flex items-center mb-2 group">
              <input type="checkbox" :id="option" :value="option" v-model="metodosPagamento"
                     class="h-5 w-5 text-brand-green border-gray-300 rounded focus:ring-brand-green transition-colors cursor-pointer" />
              <label :for="option" class="ml-3 text-gray-700 cursor-pointer group-hover:text-gray-900 transition-colors font-medium">{{ option }}</label>
            </div>
          </div>

          <div class="mb-6">
            <p class="block text-gray-600 font-semibold mb-3">Formas de Atendimento:</p>
            <div v-for="option in serviceOptions" :key="option" class="flex items-center mb-2 group">
              <input type="checkbox" :id="option" :value="option" v-model="formasAtendimento"
                     class="h-5 w-5 text-brand-green border-gray-300 rounded focus:ring-brand-green transition-colors cursor-pointer" />
              <label :for="option" class="ml-3 text-gray-700 cursor-pointer group-hover:text-gray-900 transition-colors font-medium">{{ option }}</label>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-8 pt-6 border-t border-gray-200 flex justify-end">
        <button type="submit" :disabled="isLoading"
                class="py-3 px-10 bg-brand-green text-black font-bold rounded-xl hover:bg-brand-green-hover transition-all active:scale-95 disabled:bg-gray-300 shadow-lg shadow-brand-green/20">
          {{ isLoading ? 'Salvando...' : 'Salvar Informações' }}
        </button>
      </div>
    </form>
  </main>
</template>