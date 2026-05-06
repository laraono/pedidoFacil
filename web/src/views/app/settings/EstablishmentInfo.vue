<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { establishmentApi } from '@/services/establishmentApi'; 
import { useToast } from '@/composables/useToast';
import {
  Save, ArrowLeft, UploadCloud, AlertCircle, Smartphone, Copy,
  CheckCheck, RefreshCw, Banknote, AlertTriangle, FileText, CheckCircle2
} from 'lucide-vue-next';

const router = useRouter();
const { showToast } = useToast();

const isLoading = ref(false);
const isFetching = ref(true); 
const logoPreview = ref(null);
const errors = ref({});
const touched = ref({});

const inscricaoMunicipalFile = ref(null);
const inscricaoMunicipalName = ref('');
const inscricaoMunicipalPath = ref('');
const isUploadingFile = ref(false);

const ALL_PAYMENT_METHODS = ['Dinheiro', 'Cartão Débito', 'Cartão Crédito', 'PIX'];
const paymentMethods = ref([]);
const originalPaymentMethods = ref([]);

const togglePaymentMethod = (method) => {
  const idx = paymentMethods.value.indexOf(method);
  if (idx === -1) paymentMethods.value.push(method);
  else if (paymentMethods.value.length > 1) paymentMethods.value.splice(idx, 1);
};

const selfService = ref(false);
const originalSelfService = ref(false);
const selfServiceCode = ref('');
const originalSelfServiceCode = ref('');
const codeCopied = ref(false);

const generateCode = () => {
  selfServiceCode.value = Math.floor(100000 + Math.random() * 900000).toString();
};

const copyCode = () => {
  navigator.clipboard.writeText(selfServiceCode.value);
  codeCopied.value = true;
  setTimeout(() => { codeCopied.value = false; }, 2000);
};

const form = ref({ name: '', cnpj: '', razaoSocial: '', phone: '', address: '' });
const originalForm = ref(null);
const originalLogo = ref(null);
const originalInscricaoPath = ref('');

const dadosFiscaisCompletos = computed(() => {
  const cnpjValido = form.value.cnpj?.replace(/\D/g, '').length === 14;
  const razaoSocialValida = !!form.value.razaoSocial?.trim();
  const enderecoValido = !!form.value.address?.trim();
  const inscricaoValida = !!inscricaoMunicipalPath.value;
  return cnpjValido && razaoSocialValida && enderecoValido && inscricaoValida;
});

const isDirty = computed(() =>
  originalForm.value !== null && (
    JSON.stringify(form.value) !== JSON.stringify(originalForm.value) ||
    logoPreview.value !== originalLogo.value ||
    JSON.stringify([...paymentMethods.value].sort()) !== JSON.stringify([...originalPaymentMethods.value].sort()) ||
    selfService.value !== originalSelfService.value ||
    selfServiceCode.value !== originalSelfServiceCode.value ||
    inscricaoMunicipalPath.value !== originalInscricaoPath.value
  )
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

onMounted(async () => {
  isFetching.value = true;
  try {
    const data = await establishmentApi.getProfile();
    
    form.value = {
      name: data.name || '',
      cnpj: data.cnpj || '',
      razaoSocial: data.razaoSocial || '',
      phone: data.phone || '',
      address: data.address || '',
    };
    
    inscricaoMunicipalPath.value = data.inscricaoMunicipalPath || '';
    if (data.inscricaoMunicipalPath) {
      inscricaoMunicipalName.value = data.inscricaoMunicipalPath.split('/').pop() || 'Arquivo enviado';
    }

    logoPreview.value = data.configurations?.logo || null;
    
    if (data.paymentMethods && data.paymentMethods.length > 0) {
      paymentMethods.value = [...data.paymentMethods];
    } else {
      paymentMethods.value = [...ALL_PAYMENT_METHODS]; 
    }

    let isAuto = !!data.selfServiceEnabled;
    if (data.serviceTypes) {
      const typesStr = typeof data.serviceTypes === 'string' ? data.serviceTypes : JSON.stringify(data.serviceTypes);
      if (typesStr.includes('Autoatendimento')) isAuto = true;
    }

    selfService.value = isAuto;
    selfServiceCode.value = data.selfServiceCode || Math.floor(100000 + Math.random() * 900000).toString();

    originalForm.value = { ...form.value };
    originalLogo.value = logoPreview.value;
    originalPaymentMethods.value = [...paymentMethods.value];
    originalSelfService.value = selfService.value;
    originalSelfServiceCode.value = selfServiceCode.value;
    originalInscricaoPath.value = inscricaoMunicipalPath.value;

  } catch (error) {
    showToast('Erro ao carregar dados do estabelecimento.', 'error');
  } finally {
    isFetching.value = false;
  }
});

const validateAll = () => {
  errors.value = {};
  touched.value = { name: true, cnpj: true, phone: true };

  if (!form.value.name.trim()) errors.value.name = 'O nome fantasia é obrigatório.';
  if (form.value.cnpj.trim() && form.value.cnpj.replace(/\D/g, '').length < 14) errors.value.cnpj = 'CNPJ incompleto.';
  if (form.value.phone.trim() && form.value.phone.replace(/\D/g, '').length < 10) errors.value.phone = 'Telefone incompleto.';

  return Object.keys(errors.value).length === 0;
};

const handleLogoUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => { logoPreview.value = e.target.result; };
  reader.readAsDataURL(file);
};

const handleInscricaoMunicipalUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const tiposPermitidos = ['application/x-pkcs12'];

  if (!tiposPermitidos.includes(file.type)) {
    showToast('Formato inválido. Envie um Certificado Digital (PFX/P12).', 'error');
    return;
  }

  isUploadingFile.value = true;
  inscricaoMunicipalName.value = file.name;

  try {
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    inscricaoMunicipalPath.value = base64;
    showToast('Arquivo carregado. Clique em Salvar para confirmar.', 'success');
  } catch {
    showToast('Erro ao processar o arquivo.', 'error');
    inscricaoMunicipalName.value = inscricaoMunicipalPath.value ? 'Arquivo anterior' : '';
  } finally {
    isUploadingFile.value = false;
  }
};

const saveSettings = async () => {
  if (!validateAll()) {
    showToast('Corrija os erros antes de salvar.', 'error');
    return;
  }
  
  isLoading.value = true;
  
  try {
    await establishmentApi.updateProfile({
      name: form.value.name,
      cnpj: form.value.cnpj,
      razaoSocial: form.value.razaoSocial,
      phone: form.value.phone,
      address: form.value.address,
      inscricaoMunicipalPath: inscricaoMunicipalPath.value,
      paymentMethods: paymentMethods.value,
      selfServiceEnabled: selfService.value,
      selfServiceCode: selfServiceCode.value,
      logo: logoPreview.value
    });

    originalForm.value = { ...form.value };
    originalLogo.value = logoPreview.value;
    originalPaymentMethods.value = [...paymentMethods.value];
    originalSelfService.value = selfService.value;
    originalSelfServiceCode.value = selfServiceCode.value;
    originalInscricaoPath.value = inscricaoMunicipalPath.value;
    
    showToast('Dados atualizados com sucesso!', 'success');
  } catch (error) {
    const msg = error.response?.data?.message || 'Erro ao salvar os dados.';
    showToast(msg, 'error');
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
          class="p-3 bg-gray-50 border border-[#E0E0E0] rounded text-[#757575] hover:text-[#212121] hover:bg-gray-100 transition-all">
          <ArrowLeft :size="20" />
        </button>
        <div>
          <h1 class="text-3xl font-black text-[#212121] tracking-tight">Meu Estabelecimento</h1>
          <p class="text-[#757575] mt-1 text-sm">Dados fiscais e de contato</p>
        </div>
      </div>

      <button @click="saveSettings" :disabled="!isDirty || isLoading || isFetching"
        class="hidden sm:flex items-center gap-2 bg-primary text-white font-black px-8 py-4 rounded hover:bg-primary-dark transition-all active:scale-95 shadow-lg shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100">
        <Save :size="20" />
        {{ isLoading ? 'Gravando...' : 'Salvar Dados' }}
      </button>
    </header>

    <div v-if="!isFetching && !dadosFiscaisCompletos"
      class="mb-8 bg-amber-50 border border-amber-300 rounded-lg p-5 flex gap-4 items-start shadow-sm">
      <div class="flex-shrink-0 w-10 h-10 bg-amber-100 border border-amber-300 rounded-full flex items-center justify-center mt-0.5">
        <AlertTriangle :size="20" class="text-amber-600" />
      </div>
      <div class="flex-1">
        <p class="font-black text-amber-800 text-sm mb-1">Sistema com funcionalidade limitada</p>
        <p class="text-amber-700 text-sm leading-relaxed">
          A emissão de Notas Fiscais Eletrônicas (NF-e) <strong>só funcionará corretamente</strong> após o preenchimento
          completo de todos os dados da empresa: <strong>CNPJ</strong>, <strong>Razão Social</strong>,
          <strong>Endereço</strong> e upload da <strong>Inscrição Municipal</strong>.
          Preencha e salve para habilitar o módulo fiscal.
        </p>
        <ul class="mt-3 flex flex-wrap gap-x-5 gap-y-2">
          <li class="flex items-center gap-1.5 text-xs font-bold"
            :class="form.cnpj?.replace(/\D/g,'').length === 14 ? 'text-green-600' : 'text-amber-700'">
            <CheckCircle2 v-if="form.cnpj?.replace(/\D/g,'').length === 14" :size="14" />
            <AlertCircle v-else :size="14" />
            CNPJ
          </li>
          <li class="flex items-center gap-1.5 text-xs font-bold"
            :class="form.razaoSocial?.trim() ? 'text-green-600' : 'text-amber-700'">
            <CheckCircle2 v-if="form.razaoSocial?.trim()" :size="14" />
            <AlertCircle v-else :size="14" />
            Razão Social
          </li>
          <li class="flex items-center gap-1.5 text-xs font-bold"
            :class="form.address?.trim() ? 'text-green-600' : 'text-amber-700'">
            <CheckCircle2 v-if="form.address?.trim()" :size="14" />
            <AlertCircle v-else :size="14" />
            Endereço
          </li>
          <li class="flex items-center gap-1.5 text-xs font-bold"
            :class="inscricaoMunicipalPath ? 'text-green-600' : 'text-amber-700'">
            <CheckCircle2 v-if="inscricaoMunicipalPath" :size="14" />
            <AlertCircle v-else :size="14" />
            Inscrição Municipal
          </li>
        </ul>
      </div>
    </div>

    <div v-if="!isFetching && dadosFiscaisCompletos"
      class="mb-8 bg-green-50 border border-green-300 rounded-lg p-4 flex gap-3 items-center shadow-sm">
      <CheckCircle2 :size="20" class="text-green-600 flex-shrink-0" />
      <p class="text-green-800 text-sm font-bold">
        Dados fiscais completos. O módulo de Nota Fiscal está habilitado e sincronizado com a Nuvem Fiscal.
      </p>
    </div>

    <div v-if="isFetching" class="flex justify-center items-center py-20 text-[#757575] font-bold">
      Carregando informações do estabelecimento...
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <section class="lg:col-span-1">
        <div class="bg-white border border-[#E0E0E0] rounded p-8 shadow-xl flex flex-col items-center">
          <h3 class="text-base font-black text-[#212121] mb-6 w-full text-left uppercase tracking-widest text-[11px]">Logo da Marca</h3>
          <div class="relative group cursor-pointer w-48 h-48 mb-6">
            <div class="relative w-full h-full bg-gray-50 border-2 border-dashed border-[#E0E0E0] rounded overflow-hidden flex flex-col items-center justify-center group-hover:border-accent/50 transition-all">
              <img v-if="logoPreview" :src="logoPreview" class="w-full h-full object-contain p-4" />
              <div v-else class="flex flex-col items-center text-[#757575]">
                <UploadCloud :size="40" class="mb-2" />
                <span class="text-xs font-bold uppercase tracking-widest">Subir Logo</span>
              </div>
              <input type="file" @change="handleLogoUpload" accept="image/*" class="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
          </div>
          <p class="text-[10px] text-[#757575] uppercase font-black tracking-widest">Clique para alterar</p>
        </div>
      </section>

      <section class="lg:col-span-2">
        <div class="bg-white border border-[#E0E0E0] rounded p-8 shadow-xl">
          <h3 class="text-xs font-black uppercase tracking-widest text-[#757575] mb-6">Dados da Empresa</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div class="space-y-1.5 md:col-span-2">
              <label class="text-xs font-black uppercase tracking-widest text-[#757575] ml-1">Nome Fantasia</label>
              <input v-model="form.name" maxlength="80" type="text" placeholder="Ex: Hamburgueria 2000"
                class="w-full py-3.5 px-4 rounded border bg-gray-50 border-[#E0E0E0] text-[#212121] placeholder-gray-600 focus:border-primary/50 focus:bg-gray-100 focus:outline-none transition-all"
                :class="errors.name ? '!border-red-500 !bg-red-500/5' : ''" />
              <p v-if="errors.name" class="text-danger text-[11px] font-bold ml-1 flex items-center gap-1">
                <AlertCircle :size="11" /> {{ errors.name }}
              </p>
            </div>

            <div class="space-y-1.5 md:col-span-2">
              <label class="text-xs font-black uppercase tracking-widest text-[#757575] ml-1">
                Razão Social <span class="text-amber-500 font-black">*</span>
              </label>
              <input v-model="form.razaoSocial" maxlength="150" type="text"
                placeholder="Ex: Hamburgueria 2000 Ltda."
                class="w-full py-3.5 px-4 rounded border bg-gray-50 border-[#E0E0E0] text-[#212121] placeholder-gray-600 focus:border-primary/50 focus:bg-gray-100 focus:outline-none transition-all"
                :class="errors.razaoSocial ? '!border-red-500 !bg-red-500/5' : ''" />
              <p class="text-[10px] text-[#757575] ml-1">Obrigatório para emissão de NF-e.</p>
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-black uppercase tracking-widest text-[#757575] ml-1">
                CNPJ <span class="text-amber-500 font-black">*</span>
              </label>
              <input :value="form.cnpj"
                @input="(e) => { form.cnpj = maskCNPJ(e.target.value); e.target.value = form.cnpj; }"
                maxlength="18" type="text" placeholder="00.000.000/0001-00"
                class="w-full py-3.5 px-4 rounded border bg-gray-50 border-[#E0E0E0] text-[#212121] placeholder-gray-600 focus:border-primary/50 focus:bg-gray-100 focus:outline-none transition-all"
                :class="errors.cnpj ? '!border-red-500 !bg-red-500/5' : ''" />
              <p v-if="errors.cnpj" class="text-danger text-[11px] font-bold ml-1 flex items-center gap-1">
                <AlertCircle :size="11" /> {{ errors.cnpj }}
              </p>
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-black uppercase tracking-widest text-[#757575] ml-1">WhatsApp / Contato</label>
              <input :value="form.phone" @input="(e) => {
                form.phone = maskPhone(e.target.value.replace(/\D/g, ''));
                e.target.value = form.phone;
              }" maxlength="15" type="tel" inputmode="numeric" placeholder="(00) 00000-0000"
                class="w-full py-3.5 px-4 rounded border bg-gray-50 border-[#E0E0E0] text-[#212121] placeholder-gray-600 focus:border-primary/50 focus:bg-gray-100 focus:outline-none transition-all"
                :class="errors.phone ? '!border-red-500 !bg-red-500/5' : ''" />
              <p v-if="errors.phone" class="text-danger text-[11px] font-bold ml-1 flex items-center gap-1">
                <AlertCircle :size="11" /> {{ errors.phone }}
              </p>
            </div>

            <div class="space-y-1.5 md:col-span-2">
              <label class="text-xs font-black uppercase tracking-widest text-[#757575] ml-1">
                Endereço Completo <span class="text-amber-500 font-black">*</span>
              </label>
              <input v-model="form.address" maxlength="255" type="text"
                placeholder="Ex: Rua das Flores, 123 - Centro, São Paulo - SP, 01310-100"
                class="w-full py-3.5 px-4 rounded border bg-gray-50 border-[#E0E0E0] text-[#212121] placeholder-gray-600 focus:border-primary/50 focus:bg-gray-100 focus:outline-none transition-all" />
              <p class="text-[10px] text-[#757575] ml-1">Formato: Logradouro, Número - Bairro, Cidade - UF, CEP</p>
            </div>

            <div class="space-y-1.5 md:col-span-2">
              <label class="text-xs font-black uppercase tracking-widest text-[#757575] ml-1">
                Inscrição Municipal (Documento) <span class="text-amber-500 font-black">*</span>
              </label>
              <label class="flex items-center gap-3 py-3.5 px-4 rounded border bg-gray-50 border-[#E0E0E0] cursor-pointer hover:border-primary/50 hover:bg-gray-100 transition-all relative">
                <div class="w-9 h-9 bg-primary/10 border border-primary/20 rounded flex items-center justify-center flex-shrink-0">
                  <FileText :size="16" class="text-primary" />
                </div>
                <div class="flex-1 min-w-0">
                  <p v-if="inscricaoMunicipalName" class="text-sm font-bold text-[#212121] truncate">
                    {{ inscricaoMunicipalName }}
                  </p>
                  <p v-else class="text-sm text-[#757575]">Clique para enviar (PFX ou P12)</p>
                  <p class="text-[10px] text-[#757575] mt-0.5">Obrigatório para emissão de NF-e.</p>
                </div>
                <div class="flex-shrink-0 flex items-center gap-2">
                  <RefreshCw v-if="isUploadingFile" :size="16" class="text-primary animate-spin" />
                  <CheckCircle2 v-else-if="inscricaoMunicipalPath" :size="18" class="text-green-500" />
                </div>
                <input type="file" @change="handleInscricaoMunicipalUpload" accept=".pfx,.p12"
                  class="absolute inset-0 opacity-0 cursor-pointer" />
              </label>
            </div>

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
          <button v-for="method in ALL_PAYMENT_METHODS" :key="method" type="button" @click="togglePaymentMethod(method)"
            class="flex items-center gap-2 px-5 py-3 rounded border-2 font-bold text-sm transition-all"
            :class="paymentMethods.includes(method) ? 'bg-accent-light border-accent/40 text-accent' : 'bg-gray-50 border-[#E0E0E0] text-[#757575]'">
            <div class="w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors"
              :class="paymentMethods.includes(method) ? 'bg-accent border-accent' : 'border-[#E0E0E0]'">
              <svg v-if="paymentMethods.includes(method)" viewBox="0 0 10 10" class="w-2.5 h-2.5 text-white fill-none stroke-current stroke-2"><polyline points="1.5,5 4,7.5 8.5,2.5"/></svg>
            </div>
            {{ method }}
          </button>
        </div>
        <p v-if="paymentMethods.length === 0" class="text-danger text-xs font-bold mt-3">Selecione ao menos um método.</p>
      </div>
    </div>

    <!-- Autoatendimento -->
    <div v-if="!isFetching" class="mt-8">
      <div class="bg-white border border-[#E0E0E0] rounded p-8 shadow-xl">
        <div class="flex items-center justify-between mb-2">
          <div>
            <h3 class="text-base font-black text-[#212121]">Autoatendimento</h3>
            <p class="text-sm text-[#757575] mt-1">Permite que clientes façam pedidos pelo aplicativo móvel.</p>
          </div>
          <button @click="selfService = !selfService"
            class="relative w-14 h-7 rounded transition-colors duration-300 flex items-center"
            :class="selfService ? 'bg-accent' : 'bg-gray-100'">
            <span class="absolute w-5 h-5 bg-white rounded shadow transition-all duration-300"
              :class="selfService ? 'left-8' : 'left-1'" />
          </button>
        </div>

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
                <div class="flex gap-2">
                  <a href="#" class="flex-1 text-center py-2.5 px-4 bg-gray-50 border border-[#E0E0E0] rounded text-xs font-black text-[#212121] hover:bg-gray-100 transition-colors">App Store</a>
                  <a href="#" class="flex-1 text-center py-2.5 px-4 bg-gray-50 border border-[#E0E0E0] rounded text-xs font-black text-[#212121] hover:bg-gray-100 transition-colors">Google Play</a>
                </div>
              </div>

              <div class="bg-gray-50 border border-[#E0E0E0] rounded p-6 flex flex-col gap-4">
                <div>
                  <p class="font-black text-[#212121] text-sm mb-1">Código de Acesso</p>
                  <p class="text-xs text-[#757575]">Compartilhe este código com seus clientes</p>
                </div>
                <div class="flex-1 bg-gray-100 border border-accent/30 rounded px-6 py-4 text-center">
                  <span class="text-4xl font-black text-accent tracking-[0.3em]">{{ selfServiceCode }}</span>
                </div>
                <div class="flex gap-2">
                  <button @click="copyCode"
                    class="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-accent-light border border-accent/30 rounded text-xs font-black text-accent transition-all">
                    <component :is="codeCopied ? CheckCheck : Copy" :size="14" />
                    {{ codeCopied ? 'Copiado!' : 'Copiar código' }}
                  </button>
                  <button @click="generateCode"
                    class="p-2.5 bg-gray-50 border border-[#E0E0E0] rounded text-[#757575] hover:text-[#212121] hover:bg-gray-100 transition-all">
                    <RefreshCw :size="14" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <div class="mt-8 sm:hidden">
      <button @click="saveSettings" :disabled="!isDirty || isLoading || isFetching"
        class="w-full bg-primary text-white font-black py-5 rounded shadow-xl active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
        {{ isLoading ? 'Gravando...' : 'Salvar Alterações' }}
      </button>
    </div>

  </main>
</template>

<style scoped>
.slide-down-enter-active, .slide-down-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}
.slide-down-enter-from, .slide-down-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-8px);
}
.slide-down-enter-to, .slide-down-leave-from {
  opacity: 1;
  max-height: 600px;
}
</style>