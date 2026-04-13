<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import PageHeader from '@/components/ui/PageHeader.vue';
import ToastMessage from '@/components/ui/ToastMessage.vue';
import { useToast } from '@/composables/useToast';
import { receiptApi } from '@/services/receiptApi';
import { establishmentApi } from '@/services/establishmentApi';
import {
  FileText, Download, Search, CheckCircle2, XCircle,
  AlertTriangle, Clock, RefreshCw, Eye, FileDown, Building2
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
    console.error("Erro ao validar CNPJ do estabelecimento", error);
    showToast("Erro ao validar configuração fiscal.", "error");
  } finally {
    isLoading.value = false;
  }
});

const fetchReceipts = async () => {
  isLoading.value = true;
  try {
    const filters = {
      status: activeTab.value,
      startDate: dateFrom.value,
      endDate: dateTo.value
    };
    
    const data = await receiptApi.list(filters);
    
    // Mapeamento do formato do Backend para o template do Vue
    receipts.value = data.map(nf => ({
      id: nf.id,
      numero: nf.receiptNumber,
      status: nf.status,
      emissao: nf.createdAt,
      valor: Number(nf.totalValue),
      cpf: nf.cpfcnpj,
      caixa: nf.payment?.user?.name || 'Sistema',
      erro: nf.status === 'erro' ? 'Erro na comunicação ou validação fiscal.' : null
    }));
  } catch (error) {
    showToast("Erro ao carregar notas fiscais.", "error");
  } finally {
    isLoading.value = false;
  }
};

const fetchMetrics = async () => {
  try {
    metricsData.value = await receiptApi.getMetrics(dateFrom.value, dateTo.value);
  } catch (error) {
    console.error("Erro ao carregar métricas fiscais.");
  }
};

// Se a aba de status mudar, recarrega a lista
watch(activeTab, () => {
  currentPage.value = 1;
  fetchReceipts();
});

// Se a data mudar, recarrega a lista e as métricas
watch([dateFrom, dateTo], () => {
  if (dateFrom.value && dateTo.value) {
    currentPage.value = 1;
    fetchReceipts();
    fetchMetrics();
  }
});

const tabs = [
  { key: 'todas', label: 'Todas' },
  { key: 'autorizada', label: 'Autorizadas' },
  { key: 'erro', label: 'Com erro' },
  { key: 'cancelada', label: 'Canceladas' },
];

// O filtro de status e data agora acontece no back. Aqui só filtramos a busca por texto.
const filteredNFs = computed(() => {
  let list = receipts.value;
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(n => n.numero.toLowerCase().includes(q) || (n.cpf && n.cpf.includes(q)));
  }
  return list;
});

const statusConfig = {
  autorizada: { label: 'Autorizada', cls: 'bg-accent-light text-accent border-accent/30' },
  erro: { label: 'Erro', cls: 'bg-danger-light text-danger border-danger' },
  cancelada: { label: 'Cancelada', cls: 'bg-gray-100 text-[#757575] border-[#E0E0E0]' },
  pendente: { label: 'Pendente', cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
};

const formatDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) + ' ' +
    d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

// Integração das Ações Reais
const cancel = async (nf) => {
  try {
    await receiptApi.cancel(nf.id);
    showToast(`Nota ${nf.numero} cancelada com sucesso.`, 'success');
    await fetchReceipts(); // Atualiza a lista
    await fetchMetrics();  // Atualiza os cards
  } catch (error) {
    showToast(error.message || "Erro ao cancelar nota.", 'error');
  }
};

const viewError = (nf) => showToast(nf.erro || "Detalhe de erro não disponível.", 'error');
const reissue = (nf) => showToast(`Reemissão de ${nf.numero} solicitada (simulação).`, 'success');
const downloadDANFE = (nf) => showToast(`DANFE de ${nf.numero} gerada (simulação).`, 'success');
const downloadXML = (nf) => showToast(`XML de ${nf.numero} exportado (simulação).`, 'success');
const exportAll = () => showToast('Exportação em lote solicitada (simulação).', 'success');

const currentPage = ref(1);
const perPage = 5;
const totalPages = computed(() => Math.ceil(filteredNFs.value.length / perPage));
const pagedNFs = computed(() => filteredNFs.value.slice((currentPage.value - 1) * perPage, currentPage.value * perPage));
</script>

<template>
  <main class="max-w-7xl mx-auto py-12 px-6 font-inter">
    <ToastMessage />

    <div v-if="!hasCnpj" class="flex items-center justify-center min-h-[60vh]">
      <div class="bg-white border border-[#E0E0E0] rounded p-10 max-w-md w-full text-center shadow-2xl">
        <div class="w-16 h-16 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-5">
          <AlertTriangle :size="28" class="text-amber-400" />
        </div>
        <h2 class="text-xl font-black text-[#212121] mb-3">Dados fiscais não configurados</h2>
        <p class="text-sm text-[#757575] mb-2 leading-relaxed">
          A emissão de Notas Fiscais requer o <span class="text-[#212121] font-bold">CNPJ</span> do estabelecimento cadastrado.
        </p>
        <p class="text-xs text-[#757575] mb-8 leading-relaxed">
          Adicione o CNPJ nas configurações do estabelecimento para habilitar este módulo.
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
    <PageHeader title="Notas Fiscais" subtitle="Emissão e gestão de NF-e">
      <template #actions>
        <button
          @click="exportAll"
          class="flex items-center gap-2 px-5 py-3 bg-gray-50 border border-[#E0E0E0] text-[#757575] text-sm font-black uppercase tracking-widest rounded hover:bg-gray-100 hover:text-[#212121] transition-all"
        >
          <Download :size="16" /> Exportar XML
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
      <input
        v-model="dateFrom"
        type="date"
        class="py-3 px-4 bg-gray-50 border border-[#E0E0E0] rounded text-sm text-[#757575] outline-none focus:border-primary/40 transition-all"
      />
      <input
        v-model="dateTo"
        type="date"
        class="py-3 px-4 bg-gray-50 border border-[#E0E0E0] rounded text-sm text-[#757575] outline-none focus:border-primary/40 transition-all"
      />
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
                <span class="px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest border" :class="statusConfig[nf.status]?.cls || statusConfig.autorizada.cls">
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
                    <button @click="downloadDANFE(nf)" title="DANFE" class="px-3 py-1.5 bg-gray-50 border border-[#E0E0E0] text-[#757575] text-xs font-black rounded hover:bg-gray-100 transition-all flex items-center gap-1">
                      <Eye :size="12" /> DANFE
                    </button>
                    <button @click="downloadXML(nf)" title="XML" class="px-3 py-1.5 bg-gray-50 border border-[#E0E0E0] text-[#757575] text-xs font-black rounded hover:bg-gray-100 transition-all flex items-center gap-1">
                      <FileDown :size="12" /> XML
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
                  <template v-else-if="nf.status === 'cancelada'">
                    <button @click="downloadXML(nf)" class="px-3 py-1.5 bg-gray-50 border border-[#E0E0E0] text-[#757575] text-xs font-black rounded hover:bg-gray-100 transition-all flex items-center gap-1">
                      <FileDown :size="12" /> XML
                    </button>
                  </template>
                  <template v-else-if="nf.status === 'pendente'">
                    <button @click="reissue(nf)" class="px-3 py-1.5 bg-gray-50 border border-[#E0E0E0] text-[#757575] text-xs font-black rounded hover:bg-gray-100 transition-all flex items-center gap-1">
                      <RefreshCw :size="12" /> Reemitir
                    </button>
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
        <button
          @click="currentPage = Math.max(1, currentPage - 1)"
          :disabled="currentPage === 1"
          class="px-4 py-2 bg-gray-50 border border-[#E0E0E0] text-[#757575] text-xs font-black rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          ← Anterior
        </button>
        <button
          v-for="p in totalPages"
          :key="p"
          @click="currentPage = p"
          class="px-4 py-2 text-xs font-black rounded transition-all border"
          :class="currentPage === p
            ? 'bg-primary text-[#212121] border-accent'
            : 'bg-gray-50 text-[#757575] border-[#E0E0E0] hover:bg-gray-100'"
        >
          {{ p }}
        </button>
        <button
          @click="currentPage = Math.min(totalPages, currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="px-4 py-2 bg-gray-50 border border-[#E0E0E0] text-[#757575] text-xs font-black rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          Próxima →
        </button>
      </div>
    </div>
    </template>
  </main>
</template>