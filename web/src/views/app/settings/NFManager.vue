<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import PageHeader from '@/components/ui/PageHeader.vue';
import ToastMessage from '@/components/ui/ToastMessage.vue';
import { useToast } from '@/composables/useToast';
import localStorageService from '@/services/localStorageService';
import {
  FileText, Download, Search, CheckCircle2, XCircle,
  AlertTriangle, Clock, RefreshCw, Eye, FileDown, Building2
} from 'lucide-vue-next';

const { showToast } = useToast();
const router = useRouter();

const hasCnpj = ref(true);
onMounted(() => {
  const data = localStorageService.getOnboarding();
  hasCnpj.value = !!data?.cnpj?.trim();
});

const activeTab = ref('todas');
const searchQuery = ref('');
const dateFrom = ref('');
const dateTo = ref('');

const MOCK_NFS = [
  { id: 1, numero: '001.248', status: 'autorizada', emissao: '2026-03-18T22:15:00', valor: 93.50, cpf: '321.xxx.xxx-09', caixa: 'Maria' },
  { id: 2, numero: '001.247', status: 'autorizada', emissao: '2026-03-18T21:42:00', valor: 47.00, cpf: null, caixa: 'Maria' },
  { id: 3, numero: '001.246', status: 'erro', emissao: '2026-03-18T20:58:00', valor: 62.00, cpf: null, caixa: 'Maria', erro: 'Rejeição 539 — CPF inválido na chave de acesso.' },
  { id: 4, numero: '001.245', status: 'cancelada', emissao: '2026-03-18T19:30:00', valor: 28.00, cpf: null, caixa: 'João' },
  { id: 5, numero: '001.244', status: 'pendente', emissao: '2026-03-18T19:10:00', valor: 115.00, cpf: null, caixa: 'João' },
  { id: 6, numero: '001.243', status: 'autorizada', emissao: '2026-03-18T18:55:00', valor: 38.90, cpf: '456.xxx.xxx-12', caixa: 'João' },
  { id: 7, numero: '001.242', status: 'autorizada', emissao: '2026-03-18T18:30:00', valor: 77.00, cpf: null, caixa: 'Maria' },
  { id: 8, numero: '001.241', status: 'erro', emissao: '2026-03-18T17:55:00', valor: 55.50, cpf: null, caixa: 'Maria', erro: 'Timeout na comunicação com SEFAZ.' },
];

const tabs = [
  { key: 'todas', label: 'Todas' },
  { key: 'autorizada', label: 'Autorizadas' },
  { key: 'erro', label: 'Com erro' },
  { key: 'cancelada', label: 'Canceladas' },
];

const filteredNFs = computed(() => {
  let list = MOCK_NFS;
  if (activeTab.value !== 'todas') list = list.filter(n => n.status === activeTab.value);
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(n => n.numero.includes(q) || (n.cpf && n.cpf.includes(q)));
  }
  return list;
});

const metrics = computed(() => ({
  emitidas: MOCK_NFS.filter(n => n.status === 'autorizada').length,
  faturado: MOCK_NFS.filter(n => n.status === 'autorizada').reduce((s, n) => s + n.valor, 0),
  comCpf: MOCK_NFS.filter(n => n.cpf).length,
  comErro: MOCK_NFS.filter(n => n.status === 'erro').length,
}));

const statusConfig = {
  autorizada: { label: 'Autorizada', cls: 'bg-brand-green/10 text-brand-green border-brand-green/20' },
  erro: { label: 'Erro', cls: 'bg-red-500/10 text-red-400 border-red-500/20' },
  cancelada: { label: 'Cancelada', cls: 'bg-white/10 text-gray-400 border-white/10' },
  pendente: { label: 'Pendente', cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
};

const formatDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) + ' ' +
    d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

const viewError = (nf) => showToast(nf.erro, 'error');
const reissue = (nf) => showToast(`Reemissão de ${nf.numero} solicitada (simulação).`, 'success');
const cancel = (nf) => showToast(`Cancelamento de ${nf.numero} solicitado (simulação).`, 'success');
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

    <!-- CNPJ guard -->
    <div v-if="!hasCnpj" class="flex items-center justify-center min-h-[60vh]">
      <div class="bg-dark-card border border-white/10 rounded-[2rem] p-10 max-w-md w-full text-center shadow-2xl">
        <div class="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-5">
          <AlertTriangle :size="28" class="text-amber-400" />
        </div>
        <h2 class="text-xl font-black text-white mb-3">Dados fiscais não configurados</h2>
        <p class="text-sm text-gray-400 mb-2 leading-relaxed">
          A emissão de Notas Fiscais requer o <span class="text-white font-bold">CNPJ</span> do estabelecimento cadastrado.
        </p>
        <p class="text-xs text-gray-500 mb-8 leading-relaxed">
          Adicione o CNPJ nas configurações do estabelecimento para habilitar este módulo.
        </p>
        <button
          @click="router.push('/app/settings/establishment')"
          class="w-full py-3.5 rounded-2xl bg-brand-green text-black font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-brand-green-hover transition-colors active:scale-95"
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
          class="flex items-center gap-2 px-5 py-3 bg-white/5 border border-white/10 text-gray-300 text-sm font-black uppercase tracking-widest rounded-2xl hover:bg-white/10 hover:text-white transition-all"
        >
          <Download :size="16" /> Exportar XML
        </button>
      </template>
    </PageHeader>

    <!-- Métricas -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div class="bg-dark-card border border-white/10 rounded-[2rem] p-6 flex flex-col gap-2">
        <div class="flex items-center gap-3">
          <div class="p-2.5 bg-brand-green/10 border border-brand-green/20 rounded-2xl">
            <CheckCircle2 :size="18" class="text-brand-green" />
          </div>
          <p class="text-[10px] font-black text-gray-500 uppercase tracking-widest">Emitidas hoje</p>
        </div>
        <p class="text-3xl font-black text-white">{{ metrics.emitidas }}</p>
      </div>
      <div class="bg-dark-card border border-white/10 rounded-[2rem] p-6 flex flex-col gap-2">
        <div class="flex items-center gap-3">
          <div class="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
            <FileText :size="18" class="text-blue-400" />
          </div>
          <p class="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total faturado</p>
        </div>
        <p class="text-3xl font-black text-brand-green">R$ {{ metrics.faturado.toFixed(2) }}</p>
      </div>
      <div class="bg-dark-card border border-white/10 rounded-[2rem] p-6 flex flex-col gap-2">
        <div class="flex items-center gap-3">
          <div class="p-2.5 bg-purple-500/10 border border-purple-500/20 rounded-2xl">
            <Search :size="18" class="text-purple-400" />
          </div>
          <p class="text-[10px] font-black text-gray-500 uppercase tracking-widest">Com CPF</p>
        </div>
        <p class="text-3xl font-black text-white">{{ metrics.comCpf }}</p>
      </div>
      <div class="bg-dark-card border border-white/10 rounded-[2rem] p-6 flex flex-col gap-2">
        <div class="flex items-center gap-3">
          <div class="p-2.5 bg-red-500/10 border border-red-500/20 rounded-2xl">
            <XCircle :size="18" class="text-red-400" />
          </div>
          <p class="text-[10px] font-black text-gray-500 uppercase tracking-widest">Com erro</p>
        </div>
        <p class="text-3xl font-black text-white" :class="metrics.comErro > 0 ? 'text-red-400' : ''">{{ metrics.comErro }}</p>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex gap-1 bg-white/5 border border-white/10 rounded-2xl p-1 w-fit mb-6">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        @click="activeTab = tab.key; currentPage = 1"
        class="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap"
        :class="activeTab === tab.key ? 'bg-brand-green text-black' : 'text-gray-400 hover:text-white'"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Filtros -->
    <div class="flex gap-3 mb-6 flex-wrap">
      <div class="relative flex-1 min-w-[200px]">
        <Search :size="15" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        <input
          v-model="searchQuery"
          placeholder="Buscar por número ou CPF..."
          class="w-full py-3 pl-9 pr-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder:text-gray-600 outline-none focus:border-brand-green/40 transition-all"
        />
      </div>
      <input
        v-model="dateFrom"
        type="date"
        class="py-3 px-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-gray-300 outline-none focus:border-brand-green/40 transition-all"
      />
      <input
        v-model="dateTo"
        type="date"
        class="py-3 px-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-gray-300 outline-none focus:border-brand-green/40 transition-all"
      />
    </div>

    <!-- Tabela -->
    <div class="bg-dark-card border border-white/10 rounded-[2rem] overflow-hidden mb-6">
      <div v-if="pagedNFs.length === 0" class="flex flex-col items-center justify-center py-20 text-gray-600">
        <FileText :size="48" class="mb-4 opacity-20" />
        <p class="font-black uppercase tracking-widest text-sm opacity-40">Nenhuma nota encontrada</p>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse min-w-[800px]">
          <thead class="bg-black/20 text-gray-500 uppercase text-[10px] font-black tracking-widest border-b border-white/5">
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
              class="border-b border-white/5 last:border-0 hover:bg-white/[0.03] transition-colors"
            >
              <td class="p-5 font-black text-white">{{ nf.numero }}</td>
              <td class="p-5">
                <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border" :class="statusConfig[nf.status].cls">
                  {{ statusConfig[nf.status].label }}
                </span>
              </td>
              <td class="p-5 text-gray-400 text-sm">{{ formatDate(nf.emissao) }}</td>
              <td class="p-5 font-black text-white">R$ {{ nf.valor.toFixed(2) }}</td>
              <td class="p-5 text-gray-400 text-sm">{{ nf.cpf || '—' }}</td>
              <td class="p-5 text-gray-400 text-sm">{{ nf.caixa }}</td>
              <td class="p-5">
                <div class="flex items-center justify-end gap-1">
                  <!-- Autorizada -->
                  <template v-if="nf.status === 'autorizada'">
                    <button @click="downloadDANFE(nf)" title="DANFE" class="px-3 py-1.5 bg-white/5 border border-white/10 text-gray-300 text-xs font-black rounded-xl hover:bg-white/10 transition-all flex items-center gap-1">
                      <Eye :size="12" /> DANFE
                    </button>
                    <button @click="downloadXML(nf)" title="XML" class="px-3 py-1.5 bg-white/5 border border-white/10 text-gray-300 text-xs font-black rounded-xl hover:bg-white/10 transition-all flex items-center gap-1">
                      <FileDown :size="12" /> XML
                    </button>
                    <button @click="cancel(nf)" title="Cancelar" class="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-black rounded-xl hover:bg-red-500/20 transition-all">
                      Cancelar
                    </button>
                  </template>
                  <!-- Com erro -->
                  <template v-else-if="nf.status === 'erro'">
                    <button @click="viewError(nf)" class="px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-black rounded-xl hover:bg-amber-500/20 transition-all flex items-center gap-1">
                      <AlertTriangle :size="12" /> Ver erro
                    </button>
                    <button @click="reissue(nf)" class="px-3 py-1.5 bg-white/5 border border-white/10 text-gray-300 text-xs font-black rounded-xl hover:bg-white/10 transition-all flex items-center gap-1">
                      <RefreshCw :size="12" /> Reemitir
                    </button>
                  </template>
                  <!-- Cancelada -->
                  <template v-else-if="nf.status === 'cancelada'">
                    <button @click="downloadXML(nf)" class="px-3 py-1.5 bg-white/5 border border-white/10 text-gray-300 text-xs font-black rounded-xl hover:bg-white/10 transition-all flex items-center gap-1">
                      <FileDown :size="12" /> XML
                    </button>
                  </template>
                  <!-- Pendente -->
                  <template v-else-if="nf.status === 'pendente'">
                    <button @click="reissue(nf)" class="px-3 py-1.5 bg-white/5 border border-white/10 text-gray-300 text-xs font-black rounded-xl hover:bg-white/10 transition-all flex items-center gap-1">
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

    <!-- Paginação -->
    <div class="flex items-center justify-between">
      <p class="text-xs text-gray-500 font-bold">{{ filteredNFs.length }} nota(s) encontrada(s)</p>
      <div v-if="totalPages > 1" class="flex gap-2">
        <button
          @click="currentPage = Math.max(1, currentPage - 1)"
          :disabled="currentPage === 1"
          class="px-4 py-2 bg-white/5 border border-white/10 text-gray-400 text-xs font-black rounded-xl hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          ← Anterior
        </button>
        <button
          v-for="p in totalPages"
          :key="p"
          @click="currentPage = p"
          class="px-4 py-2 text-xs font-black rounded-xl transition-all border"
          :class="currentPage === p
            ? 'bg-brand-green text-black border-brand-green'
            : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'"
        >
          {{ p }}
        </button>
        <button
          @click="currentPage = Math.min(totalPages, currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="px-4 py-2 bg-white/5 border border-white/10 text-gray-400 text-xs font-black rounded-xl hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          Próxima →
        </button>
      </div>
    </div>
    </template>
  </main>
</template>
