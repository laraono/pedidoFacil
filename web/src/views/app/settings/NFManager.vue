<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import PageHeader from '@/components/ui/PageHeader.vue';
import ToastMessage from '@/components/ui/ToastMessage.vue';
import MetricCard from '@/components/ui/MetricCard.vue';
import DataTable from '@/components/ui/DataTable.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import { useToast } from '@/composables/useToast';
import { useUtils } from '@/composables/useUtils';
import { useAsyncAction } from '@/composables/useAsyncAction';
import { receiptApi } from '@/services/receiptApi';
import { establishmentApi } from '@/services/establishmentApi';
import {
  FileText, Download, Search, CheckCircle2, XCircle,
  AlertTriangle, RefreshCw, Eye, FileDown, Building2
} from 'lucide-vue-next';

const { showToast } = useToast();
const { formatCurrency } = useUtils();
const { loading: isLoading, run } = useAsyncAction();
const router = useRouter();

const hasCnpj = ref(true);
const receipts = ref([]);
const activeTab = ref('todas');
const searchQuery = ref('');

const today = new Date().toISOString().split('T')[0];
const dateFrom = ref(today);
const dateTo = ref(today);
const metricsData = ref({ emitidas: 0, comCpf: 0, comErro: 0 });

const tabs = [
  { key: 'todas',      label: 'Todas' },
  { key: 'autorizada', label: 'Autorizadas' },
  { key: 'erro',       label: 'Com erro' },
  { key: 'cancelada',  label: 'Canceladas' },
];

const tableColumns = [
  { key: 'numero',  label: 'Número' },
  { key: 'status',  label: 'Status' },
  { key: 'emissao', label: 'Emissão' },
  { key: 'valor',   label: 'Valor' },
  { key: 'cpf',     label: 'CPF/CNPJ' },
  { key: 'caixa',   label: 'Operador' },
];

const statusConfig = {
  autorizada: { label: 'Autorizada', cls: 'bg-accent-light text-green-800 border-accent/30' },
  erro:       { label: 'Erro',        cls: 'bg-danger-light text-danger border-danger' },
  cancelada:  { label: 'Cancelada',   cls: 'bg-gray-100 text-muted border-[#E0E0E0]' },
  pendente:   { label: 'Pendente',    cls: 'bg-amber-100 text-amber-600 border-amber-600/40' },
};

const formatDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) + ' ' +
    d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

const fetchMetrics = async () => {
  try {
    metricsData.value = await receiptApi.getMetrics(dateFrom.value, dateTo.value);
  } catch {
    console.error("Erro ao carregar métricas fiscais.");
  }
};

const fetchReceipts = () => run(async () => {
  const data = await receiptApi.list({
    status: activeTab.value,
    startDate: dateFrom.value,
    endDate: dateTo.value,
  });
  receipts.value = data.map(nf => {
    const statusNome = typeof nf.status === 'object' && nf.status !== null ? nf.status.nome : nf.status;
    const statusKey = (statusNome || '').toLowerCase();
    return {
      id: nf.id,
      numero: nf.receiptNumber,
      status: statusKey,
      emissao: nf.createdAt,
      valor: Number(nf.totalValue),
      cpf: nf.cpfcnpj,
      caixa: nf.payment?.user?.name || 'Sistema',
      erro: statusKey === 'erro' ? 'Erro na comunicação ou validação fiscal.' : null,
    };
  });
}, "Erro ao carregar notas fiscais.");

onMounted(async () => {
  try {
    const estData = await establishmentApi.getProfile();
    hasCnpj.value = !!estData?.cnpj?.trim();
    if (hasCnpj.value) {
      await fetchReceipts();
      await fetchMetrics();
    }
  } catch {
    showToast("Erro ao validar configuração fiscal.", "error");
  }
});

watch(activeTab, () => { currentPage.value = 1; fetchReceipts(); });
watch([dateFrom, dateTo], () => {
  if (dateFrom.value && dateTo.value) {
    currentPage.value = 1;
    fetchReceipts();
    fetchMetrics();
  }
});

const filteredNFs = computed(() => {
  if (!searchQuery.value.trim()) return receipts.value;
  const q = searchQuery.value.toLowerCase();
  return receipts.value.filter(n => n.numero.toLowerCase().includes(q) || (n.cpf && n.cpf.includes(q)));
});

const currentPage = ref(1);
const perPage = 5;
const totalPages = computed(() => Math.ceil(filteredNFs.value.length / perPage));
const pagedNFs = computed(() => filteredNFs.value.slice((currentPage.value - 1) * perPage, currentPage.value * perPage));

const downloadDANFE = (nf) => showToast(`DANFE de ${nf.numero} gerada (simulação).`, 'success');
const downloadXML   = (nf) => showToast(`XML de ${nf.numero} exportado (simulação).`, 'success');
const reissue       = (nf) => showToast(`Reemissão de ${nf.numero} solicitada (simulação).`, 'success');
const viewError     = (nf) => showToast(nf.erro || "Detalhe de erro não disponível.", 'error');
const exportAll     = ()   => showToast('Exportação em lote solicitada (simulação).', 'success');

const cancel = (nf) => run(async () => {
  await receiptApi.cancel(nf.id);
  showToast(`Nota ${nf.numero} cancelada com sucesso.`, 'success');
  await fetchReceipts();
  await fetchMetrics();
}, "Erro ao cancelar nota.");

const nfActions = (nf) => ({
  autorizada: [
    { label: 'DANFE',    icon: Eye,           cls: 'btn-action',         fn: () => downloadDANFE(nf) },
    { label: 'XML',      icon: FileDown,      cls: 'btn-action',         fn: () => downloadXML(nf) },
    { label: 'Cancelar', icon: null,          cls: 'btn-action-danger',  fn: () => cancel(nf) },
  ],
  erro: [
    { label: 'Ver erro', icon: AlertTriangle, cls: 'btn-action-warning', fn: () => viewError(nf) },
    { label: 'Reemitir', icon: RefreshCw,     cls: 'btn-action',         fn: () => reissue(nf) },
  ],
  cancelada: [
    { label: 'XML',      icon: FileDown,      cls: 'btn-action',         fn: () => downloadXML(nf) },
  ],
  pendente: [
    { label: 'Reemitir', icon: RefreshCw,     cls: 'btn-action',         fn: () => reissue(nf) },
  ],
})[nf.status] ?? [];
</script>

<template>
  <main class="max-w-7xl mx-auto py-12 px-6 font-inter">
    <ToastMessage />

    <div v-if="!hasCnpj" class="flex items-center justify-center min-h-[60vh]">
      <div class="bg-white border border-[#E0E0E0] rounded p-10 max-w-md w-full text-center shadow-2xl">
        <div class="w-16 h-16 rounded bg-amber-100 border border-amber-600/40 flex items-center justify-center mx-auto mb-5">
          <AlertTriangle :size="28" class="text-amber-600" />
        </div>
        <h2 class="text-xl font-black text-[#212121] mb-3">Dados fiscais não configurados</h2>
        <p class="text-sm text-muted mb-2 leading-relaxed">
          A emissão de Notas Fiscais requer o <span class="text-[#212121] font-bold">CNPJ</span> do estabelecimento cadastrado.
        </p>
        <p class="text-xs text-muted mb-8 leading-relaxed">
          Adicione o CNPJ nas configurações do estabelecimento para habilitar este módulo.
        </p>
        <BaseButton variant="primary" class="w-full uppercase tracking-widest text-sm" :icon="Building2" @click="router.push('/app/settings/establishment')">
          Ir para Meu Estabelecimento
        </BaseButton>
      </div>
    </div>

    <template v-if="hasCnpj">
      <PageHeader title="Notas Fiscais" subtitle="Emissão e gestão de NF-e" back-to="back">
        <template #actions>
          <BaseButton variant="secondary" :icon="Download" @click="exportAll">
            Exportar XML
          </BaseButton>
        </template>
      </PageHeader>

      <div class="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <MetricCard label="Emitidas" :value="metricsData.emitidas" :icon="CheckCircle2" variant="accent" />
        <MetricCard label="Com CPF"  :value="metricsData.comCpf"   :icon="Search" />
        <MetricCard label="Com erro" :value="metricsData.comErro"  :icon="XCircle" :variant="metricsData.comErro > 0 ? 'red' : 'default'" />
      </div>

      <div class="flex gap-1 bg-gray-50 border border-[#E0E0E0] rounded p-1 mb-6 overflow-x-auto">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="activeTab = tab.key"
          class="px-4 py-2 rounded text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap"
          :class="activeTab === tab.key ? 'bg-primary text-white' : 'text-muted hover:text-[#212121]'"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="flex gap-3 mb-6 flex-wrap">
        <div class="relative flex-1 min-w-[200px]">
          <Search :size="15" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <input
            v-model="searchQuery"
            placeholder="Buscar por número ou CPF..."
            class="w-full py-3 pl-9 pr-4 bg-gray-50 border border-[#E0E0E0] rounded text-sm text-[#212121] placeholder:text-muted outline-none focus:border-primary/40 transition-all"
          />
        </div>
        <input v-model="dateFrom" type="date" class="py-3 px-4 bg-gray-50 border border-[#E0E0E0] rounded text-sm text-muted outline-none focus:border-primary/40 transition-all" />
        <input v-model="dateTo"   type="date" class="py-3 px-4 bg-gray-50 border border-[#E0E0E0] rounded text-sm text-muted outline-none focus:border-primary/40 transition-all" />
      </div>

      <DataTable
        :columns="tableColumns"
        :data="pagedNFs"
        :is-loading="isLoading"
        breakpoint="lg"
        empty-message="Nenhuma nota encontrada neste período"
        :empty-icon="FileText"
        class="mb-6"
      >
        <template #cell-status="{ value }">
          <span class="px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest border" :class="statusConfig[value]?.cls ?? statusConfig.autorizada.cls">
            {{ statusConfig[value]?.label ?? value }}
          </span>
        </template>
        <template #cell-emissao="{ value }">{{ formatDate(value) }}</template>
        <template #cell-valor="{ value }">{{ formatCurrency(value) }}</template>
        <template #cell-cpf="{ value }">{{ value || '—' }}</template>

        <template #row-actions="{ item }">
          <div class="flex items-center justify-end gap-1">
            <button v-for="act in nfActions(item)" :key="act.label" :class="act.cls" @click="act.fn()">
              <component v-if="act.icon" :is="act.icon" :size="12" />
              {{ act.label }}
            </button>
          </div>
        </template>

        <template #mobile-item="{ item }">
          <div class="p-4 space-y-3">
            <div class="flex items-center justify-between">
              <span class="font-black text-[#212121] text-sm">{{ item.numero }}</span>
              <span class="px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest border" :class="statusConfig[item.status]?.cls ?? statusConfig.autorizada.cls">
                {{ statusConfig[item.status]?.label ?? item.status }}
              </span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-muted">{{ formatDate(item.emissao) }}</span>
              <span class="font-black text-[#212121]">{{ formatCurrency(item.valor) }}</span>
            </div>
            <div class="flex gap-2 flex-wrap pt-1">
              <button v-for="act in nfActions(item)" :key="act.label" :class="act.cls" @click="act.fn()">
                <component v-if="act.icon" :is="act.icon" :size="12" />
                {{ act.label }}
              </button>
            </div>
          </div>
        </template>
      </DataTable>

      <div class="flex items-center justify-between">
        <p class="text-xs text-muted font-bold">{{ filteredNFs.length }} nota(s) encontrada(s)</p>
        <div v-if="totalPages > 1" class="flex gap-2">
          <button
            @click="currentPage = Math.max(1, currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-4 py-2 bg-gray-50 border border-[#E0E0E0] text-muted text-xs font-black rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >← Anterior</button>
          <button
            v-for="p in totalPages"
            :key="p"
            @click="currentPage = p"
            class="px-4 py-2 text-xs font-black rounded transition-all border"
            :class="currentPage === p ? 'bg-primary text-[#212121] border-accent' : 'bg-gray-50 text-muted border-[#E0E0E0] hover:bg-gray-100'"
          >{{ p }}</button>
          <button
            @click="currentPage = Math.min(totalPages, currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="px-4 py-2 bg-gray-50 border border-[#E0E0E0] text-muted text-xs font-black rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >Próxima →</button>
        </div>
      </div>
    </template>
  </main>
</template>