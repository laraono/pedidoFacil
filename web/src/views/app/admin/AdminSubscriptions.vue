<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAsyncAction } from '@/composables/useAsyncAction';
import { ShieldAlert, Search, Calendar, CreditCard, ExternalLink } from 'lucide-vue-next';
import { adminSubscriptionApi } from '@/services/adminApi';
import { useUtils } from '@/composables/useUtils';
import { PageHeader, StatusBadge, MetricCard } from '@/components/ui';

const router = useRouter();
const { loading, run: runLoad } = useAsyncAction();

const subscriptions = ref([]);
const search = ref('');
const filterStatus = ref('todos');

async function load() {
  subscriptions.value = await runLoad(() => adminSubscriptionApi.list(), 'Erro ao carregar assinaturas.') ?? subscriptions.value;
}

onMounted(load);

const filtered = computed(() => {
  return subscriptions.value.filter(s => {
    const matchSearch = !search.value ||
      s.establishment?.name?.toLowerCase().includes(search.value.toLowerCase()) ||
      s.establishment?.manager?.name?.toLowerCase().includes(search.value.toLowerCase());
    const matchStatus = filterStatus.value === 'todos' || s.status?.nome?.toLowerCase() === filterStatus.value;
    return matchSearch && matchStatus;
  });
});

const counts = computed(() => ({
  total: subscriptions.value.length,
  paga: subscriptions.value.filter(s => s.status?.nome === 'Paga').length,
  pendente: subscriptions.value.filter(s => s.status?.nome === 'Pendente').length,
  cancelada: subscriptions.value.filter(s => s.status?.nome === 'Cancelada').length,
  expirada: subscriptions.value.filter(s => s.status?.nome === 'Expirada').length,
}));

const { formatCurrency } = useUtils();
const formatDate = (d) => d ? new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

function goToEstablishment(sub) {
  const id = sub.establishment?.id;
  if (id) router.push(`/app/admin/establishments/${id}`);
}
</script>

<template>
  <main class="max-w-7xl mx-auto py-12 px-6 font-inter">

    <PageHeader
      title="Assinaturas"
      subtitle="Controle de todos os gerentes e seus planos"
      :category-icon="ShieldAlert"
      category-label="Painel Admin"
    />

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
      <div class="overflow-x-auto">
      <table class="w-full min-w-[700px]">
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
              <span class="text-[#757575] text-sm">{{ sub.establishment?.manager?.name || '—' }}</span>
            </td>
            <td class="px-4 py-4">
              <span class="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded border text-blue-700 bg-blue-100 border-blue-700/30">
                {{ sub.plan?.name || '—' }}
              </span>
            </td>
            <td class="px-4 py-4">
              <StatusBadge :status="sub.status?.nome" type="subscription" />
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
              <button
                @click="goToEstablishment(sub)"
                class="p-2 rounded text-[#757575] hover:text-accent hover:bg-primary-dark/10 transition-all"
                title="Ver detalhes do estabelecimento"
              >
                <ExternalLink :size="16" />
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
    </div>
  </main>
</template>
