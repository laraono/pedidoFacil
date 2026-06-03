<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from '@/composables/useToast';
import { useAsyncAction } from '@/composables/useAsyncAction';
import {
  ShieldAlert, Search, Calendar, CreditCard, UserCircle, X,
  Mail, DollarSign, Package, BarChart3, ClipboardList, Settings
} from 'lucide-vue-next';
import { adminSubscriptionApi } from '@/services/adminApi';
import { useUtils } from '@/composables/useUtils';
import { applyPriceMask } from '@/composables/usePriceMask';
import { PageHeader, StatusBadge, MetricCard } from '@/components/ui';

const router = useRouter();
const { showToast } = useToast();
const { loading, run: runLoad } = useAsyncAction();
const { loading: savingPrice, run } = useAsyncAction();

const subscriptions = ref([]);
const search = ref('');
const filterStatus = ref('todos');
const selectedSub = ref(null);
const editingPrice = ref(false);
const newPrice = ref('');

async function load() {
  subscriptions.value = await runLoad(() => adminSubscriptionApi.list(), 'Erro ao carregar assinaturas.') ?? subscriptions.value;
}

onMounted(load);

const filtered = computed(() => {
  return subscriptions.value.filter(s => {
    const matchSearch = !search.value ||
      s.establishment?.name?.toLowerCase().includes(search.value.toLowerCase()) ||
      s.establishment?.users?.some(u => u.name?.toLowerCase().includes(search.value.toLowerCase()));
    const matchStatus = filterStatus.value === 'todos' || s.status?.toLowerCase() === filterStatus.value;
    return matchSearch && matchStatus;
  });
});

const counts = computed(() => ({
  total: subscriptions.value.length,
  paga: subscriptions.value.filter(s => s.status === 'Paga').length,
  pendente: subscriptions.value.filter(s => s.status === 'Pendente').length,
  cancelada: subscriptions.value.filter(s => s.status === 'Cancelada').length,
  expirada: subscriptions.value.filter(s => s.status === 'Expirada').length,
}));

const getManager = (sub) => {
  const users = sub.establishment?.users || [];
  return users.find(u => u.role?.name?.toLowerCase().includes('gerente')) || users[0] || null;
};

const { formatCurrency } = useUtils();
const formatDate = (d) => d ? new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

function openDetail(sub) {
  selectedSub.value = sub;
  editingPrice.value = false;
  newPrice.value = '';
}

async function cancelSub(sub) {
  if (!confirm(`Cancelar assinatura do estabelecimento "${sub.establishment?.name}"?`)) return;
  await run(async () => {
    await adminSubscriptionApi.cancel(sub.id);
    showToast('Assinatura cancelada.', 'success');
    await load();
    if (selectedSub.value?.id === sub.id) selectedSub.value = null;
  }, 'Erro ao cancelar assinatura.');
}

async function deleteSub(sub) {
  if (!confirm(`Deletar assinatura? Esta ação é irreversível.`)) return;
  await run(async () => {
    await adminSubscriptionApi.delete(sub.id);
    showToast('Assinatura removida.', 'success');
    await load();
    if (selectedSub.value?.id === sub.id) selectedSub.value = null;
  }, 'Erro ao remover assinatura.');
}

function onNewPriceInput(e) {
  const v = applyPriceMask(e.target.value);
  e.target.value = v;
  newPrice.value = v;
}

async function savePrice() {
  const amount = parseFloat(String(newPrice.value).replace(',', '.'));
  if (!amount || amount <= 0) { showToast('Valor inválido.', 'error'); return; }
  await run(async () => {
    await adminSubscriptionApi.updatePrice(selectedSub.value.id, amount);
    showToast('Valor atualizado!', 'success');
    editingPrice.value = false;
    await load();
    selectedSub.value = subscriptions.value.find(s => s.id === selectedSub.value.id) || null;
  }, 'Erro ao atualizar valor.');
}
</script>

<template>
  <main class="max-w-7xl mx-auto py-12 px-6 font-inter">

    <PageHeader
      title="Assinaturas"
      subtitle="Controle de todos os gerentes e seus planos"
      back-to="/app/dashboard"
      :category-icon="ShieldAlert"
      category-label="Painel Admin"
    >
      <template #actions>
        <button @click="router.push('/app/admin/establishments')" class="flex items-center gap-2 px-4 py-2.5 border border-[#E0E0E0] bg-white text-[#757575] font-black rounded text-sm hover:text-[#212121] hover:border-primary/30 transition-all">
          <ClipboardList :size="15" /> Estabelecimentos
        </button>
        <button @click="router.push('/app/admin/plans')" class="flex items-center gap-2 px-4 py-2.5 border border-[#E0E0E0] bg-white text-[#757575] font-black rounded text-sm hover:text-[#212121] hover:border-primary/30 transition-all">
          <Package :size="15" /> Planos
        </button>
        <button @click="router.push('/app/admin/users')" class="flex items-center gap-2 px-4 py-2.5 border border-[#E0E0E0] bg-white text-[#757575] font-black rounded text-sm hover:text-[#212121] hover:border-primary/30 transition-all">
          <Settings :size="15" /> Admins
        </button>
        <button @click="router.push('/app/admin/reports')" class="flex items-center gap-2 px-4 py-2.5 bg-primary text-white font-black rounded text-sm hover:bg-primary-dark transition-all">
          <BarChart3 :size="15" /> Métricas
        </button>
      </template>
    </PageHeader>

    <div class="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
      <MetricCard label="Total" :value="counts.total" variant="default" class="cursor-pointer" @click="filterStatus = 'todos'" />
      <MetricCard label="Pagas" :value="counts.paga" variant="accent" class="cursor-pointer" @click="filterStatus = 'paga'" />
      <MetricCard label="Pendentes" :value="counts.pendente" variant="amber" class="cursor-pointer" @click="filterStatus = 'pendente'" />
      <MetricCard label="Canceladas" :value="counts.cancelada" variant="red" class="cursor-pointer" @click="filterStatus = 'cancelada'" />
      <MetricCard label="Expiradas" :value="counts.expirada" variant="default" class="cursor-pointer" @click="filterStatus = 'expirada'" />
    </div>

    <div class="flex flex-col sm:flex-row gap-3 mb-6">
      <div class="relative flex-1">
        <Search :size="16" class="absolute left-4 top-1/2 -translate-y-1/2 text-[#757575]" />
        <input v-model="search" type="text" placeholder="Buscar por estabelecimento ou gerente..."
          class="w-full bg-white border border-[#E0E0E0] rounded pl-10 pr-4 py-3 text-sm text-[#212121] outline-none focus:border-primary/40 placeholder:text-[#757575]" />
      </div>
      <div class="flex gap-2 flex-wrap">
        <button v-for="opt in [{ v: 'todos', l: 'Todos' }, { v: 'paga', l: 'Pagas' }, { v: 'pendente', l: 'Pendentes' }, { v: 'cancelada', l: 'Canceladas' }]"
          :key="opt.v" @click="filterStatus = opt.v"
          :class="filterStatus === opt.v ? 'bg-primary text-white border-primary' : 'bg-gray-50 text-[#757575] border-[#E0E0E0]'"
          class="px-4 py-2 rounded border text-xs font-black uppercase tracking-wider transition-all">
          {{ opt.l }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="py-20 text-center text-[#757575]">Carregando...</div>

    <div v-else class="bg-white border border-[#E0E0E0] rounded-xl overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="border-b border-[#E0E0E0] bg-gray-100">
            <th class="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#757575]">Estabelecimento</th>
            <th class="text-left px-4 py-4 text-[10px] font-black uppercase tracking-widest text-[#757575] hidden md:table-cell">Gerente</th>
            <th class="text-left px-4 py-4 text-[10px] font-black uppercase tracking-widest text-[#757575]">Plano</th>
            <th class="text-left px-4 py-4 text-[10px] font-black uppercase tracking-widest text-[#757575]">Status</th>
            <th class="text-left px-4 py-4 text-[10px] font-black uppercase tracking-widest text-[#757575] hidden lg:table-cell">Vencimento</th>
            <th class="text-right px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#757575] hidden sm:table-cell">Valor</th>
            <th class="px-4 py-4"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#E0E0E0]">
          <tr v-for="sub in filtered" :key="sub.id" class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4">
              <span class="font-bold text-[#212121] text-sm">{{ sub.establishment?.name || '—' }}</span>
            </td>
            <td class="px-4 py-4 hidden md:table-cell">
              <span class="text-[#757575] text-sm">{{ getManager(sub)?.name || '—' }}</span>
            </td>
            <td class="px-4 py-4">
              <span class="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded border text-blue-400 bg-blue-500/10 border-blue-500/20">
                {{ sub.plan?.name || '—' }}
              </span>
            </td>
            <td class="px-4 py-4">
              <StatusBadge :status="sub.status" type="subscription" />
            </td>
            <td class="px-4 py-4 hidden lg:table-cell">
              <div class="flex items-center gap-1.5 text-sm text-[#757575]">
                <Calendar :size="13" /> {{ formatDate(sub.expirationDate) }}
              </div>
            </td>
            <td class="px-6 py-4 text-right hidden sm:table-cell">
              <span class="text-sm font-black text-[#212121]">{{ formatCurrency(sub.price || sub.plan?.price) }}</span>
            </td>
            <td class="px-4 py-4">
              <button @click="openDetail(sub)" class="p-2 rounded text-[#757575] hover:text-accent hover:bg-primary-dark/10 transition-all" title="Ver detalhes">
                <UserCircle :size="18" />
              </button>
            </td>
          </tr>
          <tr v-if="!filtered.length">
            <td colspan="7" class="px-6 py-16 text-center">
              <CreditCard :size="32" class="mx-auto mb-3 text-[#757575] opacity-30" />
              <p class="text-[#757575] text-sm font-bold">Nenhuma assinatura encontrada</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </main>

  <Teleport to="body">
    <Transition name="fade">
      <div v-if="selectedSub" class="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
        <div class="bg-white border border-[#E0E0E0] w-full max-w-lg rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
          <div class="p-6 border-b border-[#E0E0E0] flex justify-between items-center bg-gray-50 sticky top-0">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded bg-accent-light border border-accent/30 flex items-center justify-center">
                <ClipboardList :size="18" class="text-accent" />
              </div>
              <div>
                <h2 class="text-lg font-black text-[#212121]">Detalhes da Assinatura</h2>
                <p class="text-xs text-[#757575]">{{ selectedSub.establishment?.name }}</p>
              </div>
            </div>
            <button @click="selectedSub = null" class="p-2 text-[#757575] hover:text-[#212121]"><X :size="20" /></button>
          </div>

          <div class="p-6 space-y-4">
            <div class="p-4 bg-gray-50 rounded-lg border border-[#E0E0E0]">
              <p class="text-[10px] font-black text-[#757575] uppercase tracking-widest mb-3">Gerente Responsável</p>
              <div class="space-y-2">
                <div class="flex items-center gap-2">
                  <UserCircle :size="15" class="text-[#757575]" />
                  <span class="text-sm font-bold text-[#212121]">{{ getManager(selectedSub)?.name || '—' }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <Mail :size="15" class="text-[#757575]" />
                  <span class="text-sm text-[#757575]">{{ getManager(selectedSub)?.email || '—' }}</span>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="p-4 bg-gray-50 rounded-lg border border-[#E0E0E0]">
                <p class="text-[10px] font-black text-[#757575] uppercase tracking-widest mb-2">Status</p>
                <StatusBadge :status="selectedSub.status" type="subscription" />
              </div>
              <div class="p-4 bg-gray-50 rounded-lg border border-[#E0E0E0]">
                <p class="text-[10px] font-black text-[#757575] uppercase tracking-widest mb-2">Plano</p>
                <span class="text-sm font-black text-[#212121]">{{ selectedSub.plan?.name || '—' }}</span>
              </div>
            </div>

            <div class="p-4 bg-gray-50 rounded-lg border border-[#E0E0E0]">
              <div class="flex items-center justify-between mb-2">
                <p class="text-[10px] font-black text-[#757575] uppercase tracking-widest">Valor da Assinatura</p>
                <button v-if="!editingPrice" @click="editingPrice = true; newPrice = String(selectedSub.price || selectedSub.plan?.price || '').replace('.', ',')"
                  class="text-[10px] font-black text-primary uppercase tracking-wider hover:underline">Editar</button>
              </div>
              <div v-if="!editingPrice">
                <span class="text-2xl font-black text-[#212121]">{{ formatCurrency(selectedSub.price || selectedSub.plan?.price) }}</span>
                <span class="text-[#757575] text-sm ml-1">/mês</span>
              </div>
              <div v-else class="flex gap-2">
                <div class="relative flex-1">
                  <DollarSign :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-[#757575]" />
                  <input :value="newPrice" type="text" inputmode="numeric" placeholder="79,90"
                    class="w-full bg-white border border-[#E0E0E0] rounded pl-8 pr-3 py-2 text-sm text-[#212121] outline-none focus:border-primary/40"
                    @input="onNewPriceInput" />
                </div>
                <button @click="savePrice" :disabled="savingPrice" class="px-4 py-2 bg-primary text-white font-black rounded text-sm hover:bg-primary-dark disabled:opacity-50">
                  {{ savingPrice ? '...' : 'Salvar' }}
                </button>
                <button @click="editingPrice = false" class="px-3 py-2 text-[#757575] font-bold rounded border border-[#E0E0E0] text-sm hover:bg-gray-50">
                  <X :size="14" />
                </button>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="p-4 bg-gray-50 rounded-lg border border-[#E0E0E0]">
                <p class="text-[10px] font-black text-[#757575] uppercase tracking-widest mb-2">Início</p>
                <span class="text-sm font-bold text-[#212121]">{{ formatDate(selectedSub.initialDate) }}</span>
              </div>
              <div class="p-4 bg-gray-50 rounded-lg border border-[#E0E0E0]">
                <p class="text-[10px] font-black text-[#757575] uppercase tracking-widest mb-2">Vencimento</p>
                <span class="text-sm font-bold text-[#212121]">{{ formatDate(selectedSub.expirationDate) }}</span>
              </div>
            </div>

            <div class="flex gap-3 pt-2">
              <button v-if="selectedSub.status !== 'Cancelada'" @click="cancelSub(selectedSub)"
                class="flex-1 py-2.5 rounded-lg border border-amber-300 text-amber-600 font-black text-sm hover:bg-amber-50 transition-colors">
                Cancelar Assinatura
              </button>
              <button @click="deleteSub(selectedSub)"
                class="flex-1 py-2.5 rounded-lg border border-red-300 text-red-500 font-black text-sm hover:bg-red-50 transition-colors">
                Deletar
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>