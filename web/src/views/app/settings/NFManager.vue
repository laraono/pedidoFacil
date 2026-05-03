<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import PageHeader from '@/components/ui/PageHeader.vue';
import ToastMessage from '@/components/ui/ToastMessage.vue';
import FormModal from '@/components/ui/FormModal.vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import { useToast } from '@/composables/useToast';
import { receiptApi, paymentApi } from '@/services/receiptApi';
import { establishmentApi } from '@/services/establishmentApi';
import {
  FileText, Download, Search, CheckCircle2, XCircle,
  AlertTriangle, RefreshCw, Eye, Building2, Plus
} from 'lucide-vue-next';

const { showToast } = useToast();
const router = useRouter();

const hasCnpj = ref(true);
const receipts = ref([]);
const isLoading = ref(false);

const activeTab = ref('todas');
const searchQuery = ref('');

const today = new Date().toISOString().split('T')[0];
const dateFrom = ref(today);
const dateTo = ref(today);

const metricsData = ref({ emitidas: 0, faturado: 0, comCpf: 0, comErro: 0 });

onMounted(async () => {
  try {
    isLoading.value = true;
    const estData = await establishmentApi.getProfile();
    hasCnpj.value = !!estData?.cnpj?.trim();
    if (hasCnpj.value) {
      await fetchReceipts();
      await fetchMetrics();
    }
  } catch (error) {
    showToast('Erro ao validar configuração fiscal.', 'error');
  } finally {
    isLoading.value = false;
  }
});

const fetchReceipts = async () => {
  isLoading.value = true;
  try {
    const data = await receiptApi.list({
      status: activeTab.value,
      startDate: dateFrom.value,
      endDate: dateTo.value,
    });

    receipts.value = data.map(nf => ({
      id:               nf.id,
      numero:           nf.receiptNumber ?? '—',
      status:           nf.status,
      emissao:          nf.createdAt,
      valor:            Number(nf.totalValue),
      cpf:              nf.cpfcnpj,
      caixa:            nf.payment?.user?.name || 'Sistema',
      urlDanfe:         nf.urlDanfe ?? null,
      codigoRetorno:    nf.codigoRetorno ?? null,
      mensagemRetorno:  nf.mensagemRetorno ?? null,
    }));
  } catch (error) {
    showToast('Erro ao carregar notas fiscais.', 'error');
  } finally {
    isLoading.value = false;
  }
};

const fetchMetrics = async () => {
  try {
    metricsData.value = await receiptApi.getMetrics(dateFrom.value, dateTo.value);
  } catch (error) {
    console.error('Erro ao carregar métricas fiscais.');
  }
};

watch(activeTab, () => { currentPage.value = 1; fetchReceipts(); });
watch([dateFrom, dateTo], () => {
  if (dateFrom.value && dateTo.value) {
    currentPage.value = 1;
    fetchReceipts();
    fetchMetrics();
  }
});

const tabs = [
  { key: 'todas',      label: 'Todas' },
  { key: 'autorizada', label: 'Autorizadas' },
  { key: 'pendente',   label: 'Pendentes' },
  { key: 'erro',       label: 'Com erro' },
  { key: 'cancelada',  label: 'Canceladas' },
];

const filteredNFs = computed(() => {
  let list = receipts.value;
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(n =>
      n.numero.toLowerCase().includes(q) || (n.cpf && n.cpf.includes(q))
    );
  }
  return list;
});

const statusConfig = {
  autorizada: { label: 'Autorizada', cls: 'bg-accent-light text-accent border-accent/30' },
  erro:       { label: 'Erro',       cls: 'bg-danger-light text-danger border-danger' },
  cancelada:  { label: 'Cancelada',  cls: 'bg-gray-100 text-[#757575] border-[#E0E0E0]' },
  pendente:   { label: 'Pendente',   cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
};

const formatDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) + ' ' +
    d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

const cancel = async (nf) => {
  try {
    await receiptApi.cancel(nf.id);
    showToast(`Nota ${nf.numero} cancelada com sucesso.`, 'success');
    await fetchReceipts();
    await fetchMetrics();
  } catch (error) {
    showToast(error.message || 'Erro ao cancelar nota.', 'error');
  }
};

const reissue = async (nf) => {
  try {
    isLoading.value = true;
    await receiptApi.reissue(nf.id);
    showToast(`Reemissão da nota ${nf.numero || ''} concluída.`, 'success');
    await fetchReceipts();
    await fetchMetrics();
  } catch (error) {
    showToast(error.message || 'Erro ao reemitir nota.', 'error');
  } finally {
    isLoading.value = false;
  }
};

const viewDanfe = (nf) => {
  try {
    receiptApi.openDanfe(nf.urlDanfe);
  } catch (error) {
    showToast(error.message || 'DANFE não disponível.', 'error');
  }
};

const viewError = (nf) => {
  const msg = nf.mensagemRetorno
    ? `[${nf.codigoRetorno}] ${nf.mensagemRetorno}`
    : 'Detalhe de erro não disponível.';
  showToast(msg, 'error');
};

const exportAll = () => showToast('Exportação em lote solicitada (em breve).', 'info');

// --- Emitir NF modal ---
const showEmitModal = ref(false);
const emitForm = ref({ paymentId: '', cpfcnpj: '', totalValue: '' });
const emitErrors = ref({});
const isEmitting = ref(false);
const availablePayments = ref([]);
const isLoadingPayments = ref(false);
const simulateMode = ref(false);

const openEmitModal = async () => {
  emitForm.value = { paymentId: '', cpfcnpj: '', totalValue: '' };
  emitErrors.value = {};
  simulateMode.value = false;
  showEmitModal.value = true;
  isLoadingPayments.value = true;
  try {
    const data = await paymentApi.list();
    availablePayments.value = data.map(p => ({
      id: p.id,
      label: `#${p.id} · R$ ${Number(p.totalValue).toFixed(2)} · ${p.paymentType}`,
    }));
  } catch {
    availablePayments.value = [];
  } finally {
    isLoadingPayments.value = false;
  }
};

const formatCpfCnpj = (val) => {
  const digits = val.replace(/\D/g, '');
  if (digits.length <= 11) {
    return digits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }
  return digits
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
};

const onCpfCnpjInput = (e) => {
  emitForm.value.cpfcnpj = formatCpfCnpj(e.target.value);
};

const validateEmitForm = () => {
  const errors = {};
  if (simulateMode.value) {
    const v = Number(emitForm.value.totalValue);
    if (!emitForm.value.totalValue || isNaN(v) || v <= 0) {
      errors.totalValue = 'Informe um valor maior que zero.';
    }
  } else {
    const id = Number(emitForm.value.paymentId);
    if (!emitForm.value.paymentId || isNaN(id) || id <= 0) {
      errors.paymentId = 'Selecione um pagamento.';
    }
  }
  const digits = emitForm.value.cpfcnpj.replace(/\D/g, '');
  if (digits && digits.length !== 11 && digits.length !== 14) {
    errors.cpfcnpj = 'CPF (11 dígitos) ou CNPJ (14 dígitos).';
  }
  emitErrors.value = errors;
  return Object.keys(errors).length === 0;
};

const submitEmit = async () => {
  if (!validateEmitForm()) return;
  isEmitting.value = true;
  try {
    const payload = simulateMode.value
      ? { simulate: true, totalValue: Number(emitForm.value.totalValue) }
      : { paymentId: Number(emitForm.value.paymentId) };
    const digits = emitForm.value.cpfcnpj.replace(/\D/g, '');
    if (digits) payload.cpfcnpj = digits;
    await receiptApi.create(payload);
    showToast('Nota Fiscal emitida com sucesso!', 'success');
    showEmitModal.value = false;
    await fetchReceipts();
    await fetchMetrics();
  } catch (err) {
    showToast(err.message || 'Erro ao emitir nota fiscal.', 'error');
  } finally {
    isEmitting.value = false;
  }
};

const currentPage = ref(1);
const perPage = 5;
const totalPages = computed(() => Math.ceil(filteredNFs.value.length / perPage));
const pagedNFs = computed(() =>
  filteredNFs.value.slice((currentPage.value - 1) * perPage, currentPage.value * perPage)
);
</script>

<template>
  <main class="max-w-7xl mx-auto py-12 px-6 font-inter">
    <ToastMessage />

    <!-- Modal: Emitir NF -->
    <FormModal
      :show="showEmitModal"
      title="Emitir Nota Fiscal"
      saveLabel="Emitir NF"
      size="sm"
      :isLoading="isEmitting"
      @close="showEmitModal = false"
      @save="submitEmit"
    >
      <div class="flex flex-col gap-6">
        <div class="p-4 bg-amber-500/10 border border-amber-500/20 rounded flex items-start gap-3">
          <AlertTriangle :size="16" class="text-amber-400 mt-0.5 shrink-0" />
          <p class="text-sm text-[#757575] leading-relaxed">
            A NF-e será emitida no <strong class="text-[#212121]">ambiente sandbox</strong> da Nuvem Fiscal.
          </p>
        </div>

        <!-- Toggle simulação -->
        <label class="flex items-center gap-3 cursor-pointer select-none">
          <div
            class="relative w-10 h-5 rounded-full transition-colors"
            :class="simulateMode ? 'bg-primary' : 'bg-gray-300'"
            @click="simulateMode = !simulateMode"
          >
            <div
              class="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform"
              :class="simulateMode ? 'translate-x-5' : 'translate-x-0.5'"
            />
          </div>
          <span class="text-sm font-bold text-[#212121]">Modo simulação</span>
          <span class="text-xs text-[#757575]">(preencher dados manualmente)</span>
        </label>

        <!-- Pagamento real -->
        <div v-if="!simulateMode" class="flex flex-col gap-1">
          <label class="text-xs font-black uppercase tracking-widest text-[#757575] ml-1">Pagamento *</label>
          <div v-if="isLoadingPayments" class="flex items-center gap-2 py-3 px-4 bg-gray-50 border border-[#E0E0E0] rounded text-sm text-[#757575]">
            <RefreshCw :size="14" class="animate-spin" /> Buscando pagamentos...
          </div>
          <select
            v-else
            v-model="emitForm.paymentId"
            class="w-full py-3.5 px-4 rounded border bg-gray-50 text-[#212121] focus:border-primary/50 focus:outline-none transition-all"
            :class="emitErrors.paymentId ? '!border-red-500 !bg-red-500/5' : 'border-[#E0E0E0]'"
          >
            <option value="" disabled>Selecione um pagamento...</option>
            <option v-if="availablePayments.length === 0" value="" disabled>Nenhum pagamento encontrado</option>
            <option v-for="p in availablePayments" :key="p.id" :value="p.id">{{ p.label }}</option>
          </select>
          <p v-if="emitErrors.paymentId" class="text-danger text-[11px] font-bold ml-1 mt-0.5">{{ emitErrors.paymentId }}</p>
        </div>

        <!-- Simulação: valor manual -->
        <BaseInput
          v-if="simulateMode"
          v-model="emitForm.totalValue"
          label="Valor Total (R$) *"
          type="number"
          placeholder="Ex: 59.90"
          :error="emitErrors.totalValue"
        />

        <div class="flex flex-col gap-1">
          <label class="text-xs font-black uppercase tracking-widest text-[#757575] ml-1">
            CPF / CNPJ do Consumidor <span class="font-normal normal-case tracking-normal">(opcional)</span>
          </label>
          <input
            :value="emitForm.cpfcnpj"
            @input="onCpfCnpjInput"
            placeholder="000.000.000-00 ou 00.000.000/0001-00"
            maxlength="18"
            class="w-full py-3.5 px-4 rounded border bg-gray-50 border-[#E0E0E0] text-[#212121] placeholder-gray-400 focus:border-primary/50 focus:outline-none transition-all"
            :class="emitErrors.cpfcnpj ? '!border-red-500 !bg-red-500/5' : ''"
          />
          <p v-if="emitErrors.cpfcnpj" class="text-danger text-[11px] font-bold ml-1 mt-0.5">{{ emitErrors.cpfcnpj }}</p>
        </div>
      </div>
    </FormModal>

    <div v-if="!hasCnpj" class="flex items-center justify-center min-h-[60vh]">
      <div class="bg-white border border-[#E0E0E0] rounded p-10 max-w-md w-full text-center shadow-2xl">
        <div class="w-16 h-16 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-5">
          <AlertTriangle :size="28" class="text-amber-400" />
        </div>
        <h2 class="text-xl font-black text-[#212121] mb-3">Dados fiscais não configurados</h2>
        <p class="text-sm text-[#757575] mb-2 leading-relaxed">
          A emissão de Notas Fiscais requer o <span class="text-[#212121] font-bold">CNPJ</span> do estabelecimento cadastrado.
        </p>
        <button
          @click="router.push('/app/settings/establishment')"
          class="w-full py-3.5 rounded bg-primary text-white font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors active:scale-95"
        >
          <Building2 :size="16" />
          Ir para Meu Estabelecimento
        </button>
      </div>
    </div>

    <template v-if="hasCnpj">
      <PageHeader title="Notas Fiscais" subtitle="Emissão e gestão de NF-e · Nuvem Fiscal Sandbox">
        <template #actions>
          <button
            @click="exportAll"
            class="flex items-center gap-2 px-5 py-3 bg-gray-50 border border-[#E0E0E0] text-[#757575] text-sm font-black uppercase tracking-widest rounded hover:bg-gray-100 hover:text-[#212121] transition-all"
          >
            <Download :size="16" /> Exportar XML
          </button>
          <button
            @click="openEmitModal"
            class="flex items-center gap-2 px-5 py-3 bg-primary text-white text-sm font-black uppercase tracking-widest rounded hover:bg-primary-dark transition-all active:scale-95"
          >
            <Plus :size="16" /> Emitir NF
          </button>
        </template>
      </PageHeader>

      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div class="bg-white border border-[#E0E0E0] rounded p-6 flex flex-col gap-2">
          <div class="flex items-center gap-3">
            <div class="p-2.5 bg-accent-light border border-accent/30 rounded">
              <CheckCircle2 :size="18" class="text-accent" />
            </div>
            <p class="text-[10px] font-black text-[#757575] uppercase tracking-widest">Emitidas</p>
          </div>
          <p class="text-3xl font-black text-[#212121]">{{ metricsData.emitidas }}</p>
        </div>
        <div class="bg-white border border-[#E0E0E0] rounded p-6 flex flex-col gap-2">
          <div class="flex items-center gap-3">
            <div class="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded">
              <FileText :size="18" class="text-blue-400" />
            </div>
            <p class="text-[10px] font-black text-[#757575] uppercase tracking-widest">Faturado no Período</p>
          </div>
          <p class="text-3xl font-black text-accent">R$ {{ Number(metricsData.faturado || 0).toFixed(2) }}</p>
        </div>
        <div class="bg-white border border-[#E0E0E0] rounded p-6 flex flex-col gap-2">
          <div class="flex items-center gap-3">
            <div class="p-2.5 bg-primary/10 border border-primary/20 rounded">
              <Search :size="18" class="text-purple-400" />
            </div>
            <p class="text-[10px] font-black text-[#757575] uppercase tracking-widest">Com CPF</p>
          </div>
          <p class="text-3xl font-black text-[#212121]">{{ metricsData.comCpf }}</p>
        </div>
        <div class="bg-white border border-[#E0E0E0] rounded p-6 flex flex-col gap-2">
          <div class="flex items-center gap-3">
            <div class="p-2.5 bg-danger-light border border-danger rounded">
              <XCircle :size="18" class="text-danger" />
            </div>
            <p class="text-[10px] font-black text-[#757575] uppercase tracking-widest">Com erro</p>
          </div>
          <p class="text-3xl font-black text-[#212121]" :class="metricsData.comErro > 0 ? 'text-danger' : ''">{{ metricsData.comErro }}</p>
        </div>
      </div>

      <div class="flex gap-1 bg-gray-50 border border-[#E0E0E0] rounded p-1 w-fit mb-6">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="activeTab = tab.key"
          class="px-4 py-2 rounded text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap"
          :class="activeTab === tab.key ? 'bg-primary text-white' : 'text-[#757575] hover:text-[#212121]'"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="flex gap-3 mb-6 flex-wrap">
        <div class="relative flex-1 min-w-[200px]">
          <Search :size="15" class="absolute left-3 top-1/2 -translate-y-1/2 text-[#757575] pointer-events-none" />
          <input
            v-model="searchQuery"
            placeholder="Buscar por número ou CPF..."
            class="w-full py-3 pl-9 pr-4 bg-gray-50 border border-[#E0E0E0] rounded text-sm text-[#212121] placeholder:text-[#757575] outline-none focus:border-primary/40 transition-all"
          />
        </div>
        <input v-model="dateFrom" type="date" class="py-3 px-4 bg-gray-50 border border-[#E0E0E0] rounded text-sm text-[#757575] outline-none focus:border-primary/40 transition-all" />
        <input v-model="dateTo"   type="date" class="py-3 px-4 bg-gray-50 border border-[#E0E0E0] rounded text-sm text-[#757575] outline-none focus:border-primary/40 transition-all" />
      </div>

      <div class="bg-white border border-[#E0E0E0] rounded overflow-hidden mb-6 relative">
        <div v-if="isLoading" class="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center">
          <RefreshCw class="animate-spin text-primary" :size="32" />
        </div>

        <div v-if="pagedNFs.length === 0 && !isLoading" class="flex flex-col items-center justify-center py-20 text-[#757575]">
          <FileText :size="48" class="mb-4 opacity-20" />
          <p class="font-black uppercase tracking-widest text-sm opacity-40">Nenhuma nota encontrada neste período</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-left border-collapse min-w-[800px]">
            <thead class="bg-gray-100 text-[#757575] uppercase text-[10px] font-black tracking-widest border-b border-[#E0E0E0]">
              <tr>
                <th class="p-5">Número</th>
                <th class="p-5">Status</th>
                <th class="p-5">Emissão</th>
                <th class="p-5">Valor</th>
                <th class="p-5">CPF/CNPJ</th>
                <th class="p-5">Operador</th>
                <th class="p-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="nf in pagedNFs"
                :key="nf.id"
                class="border-b border-[#E0E0E0] last:border-0 hover:bg-gray-50 transition-colors"
              >
                <td class="p-5 font-black text-[#212121]">{{ nf.numero }}</td>
                <td class="p-5">
                  <span class="px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest border" :class="statusConfig[nf.status]?.cls || statusConfig.pendente.cls">
                    {{ statusConfig[nf.status]?.label || nf.status }}
                  </span>
                </td>
                <td class="p-5 text-[#757575] text-sm">{{ formatDate(nf.emissao) }}</td>
                <td class="p-5 font-black text-[#212121]">R$ {{ nf.valor.toFixed(2) }}</td>
                <td class="p-5 text-[#757575] text-sm">{{ nf.cpf || '—' }}</td>
                <td class="p-5 text-[#757575] text-sm">{{ nf.caixa }}</td>
                <td class="p-5">
                  <div class="flex items-center justify-end gap-1">
                    <template v-if="nf.status === 'autorizada'">
                      <button @click="viewDanfe(nf)" title="DANFE" class="px-3 py-1.5 bg-gray-50 border border-[#E0E0E0] text-[#757575] text-xs font-black rounded hover:bg-gray-100 transition-all flex items-center gap-1">
                        <Eye :size="12" /> DANFE
                      </button>
                      <button @click="cancel(nf)" title="Cancelar" class="px-3 py-1.5 bg-danger-light border border-danger text-danger text-xs font-black rounded hover:bg-red-500/20 transition-all">
                        Cancelar
                      </button>
                    </template>
                    <template v-else-if="nf.status === 'erro'">
                      <button @click="viewError(nf)" class="px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-black rounded hover:bg-amber-500/20 transition-all flex items-center gap-1">
                        <AlertTriangle :size="12" /> Ver erro
                      </button>
                      <button @click="reissue(nf)" class="px-3 py-1.5 bg-gray-50 border border-[#E0E0E0] text-[#757575] text-xs font-black rounded hover:bg-gray-100 transition-all flex items-center gap-1">
                        <RefreshCw :size="12" /> Reemitir
                      </button>
                    </template>
                    <template v-else-if="nf.status === 'pendente'">
                      <button @click="reissue(nf)" class="px-3 py-1.5 bg-gray-50 border border-[#E0E0E0] text-[#757575] text-xs font-black rounded hover:bg-gray-100 transition-all flex items-center gap-1">
                        <RefreshCw :size="12" /> Reemitir
                      </button>
                    </template>
                    <template v-else-if="nf.status === 'cancelada'">
                      <span class="text-xs text-[#757575]">—</span>
                    </template>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="flex items-center justify-between">
        <p class="text-xs text-[#757575] font-bold">{{ filteredNFs.length }} nota(s) encontrada(s)</p>
        <div v-if="totalPages > 1" class="flex gap-2">
          <button @click="currentPage = Math.max(1, currentPage - 1)" :disabled="currentPage === 1"
            class="px-4 py-2 bg-gray-50 border border-[#E0E0E0] text-[#757575] text-xs font-black rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
            ← Anterior
          </button>
          <button v-for="p in totalPages" :key="p" @click="currentPage = p"
            class="px-4 py-2 text-xs font-black rounded transition-all border"
            :class="currentPage === p ? 'bg-primary text-[#212121] border-accent' : 'bg-gray-50 text-[#757575] border-[#E0E0E0] hover:bg-gray-100'">
            {{ p }}
          </button>
          <button @click="currentPage = Math.min(totalPages, currentPage + 1)" :disabled="currentPage === totalPages"
            class="px-4 py-2 bg-gray-50 border border-[#E0E0E0] text-[#757575] text-xs font-black rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
            Próxima →
          </button>
        </div>
      </div>
    </template>
  </main>
</template>