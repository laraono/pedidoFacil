<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useSubscriptionStore } from '@/stores/subscriptions';
import {
  ArrowLeft, ShieldAlert, Users, CheckCircle2, AlertTriangle,
  XCircle, Search, Calendar, CreditCard
} from 'lucide-vue-next';

const router = useRouter();
const subscriptionStore = useSubscriptionStore();

const search = ref('');
const filterStatus = ref('todos');

const allSubs = computed(() => subscriptionStore.adminSubscriptions);

const filtered = computed(() => {
  return allSubs.value.filter(s => {
    const matchSearch = !search.value ||
      s.establishment.toLowerCase().includes(search.value.toLowerCase()) ||
      s.manager.toLowerCase().includes(search.value.toLowerCase());
    const matchStatus = filterStatus.value === 'todos' || s.status === filterStatus.value;
    return matchSearch && matchStatus;
  });
});

const counts = computed(() => ({
  total: allSubs.value.length,
  ativo: allSubs.value.filter(s => s.status === 'ativo').length,
  expirado: allSubs.value.filter(s => s.status === 'expirado').length,
  desativado: allSubs.value.filter(s => s.status === 'desativado').length,
  anual: allSubs.value.filter(s => s.plan === 'anual').length,
  mensal: allSubs.value.filter(s => s.plan === 'mensal').length,
}));

const statusConfig = (status) => {
  if (status === 'ativo') return { label: 'Ativa', icon: CheckCircle2, color: 'text-brand-green', bg: 'bg-brand-green/10 border-brand-green/25' };
  if (status === 'expirado') return { label: 'Expirada', icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/25' };
  return { label: 'Desativada', icon: XCircle, color: 'text-zinc-500', bg: 'bg-zinc-700/20 border-zinc-600/20' };
};

const formatDate = (d) =>
  new Date(d + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
</script>

<template>
  <main class="max-w-7xl mx-auto py-12 px-6 font-inter">

    <!-- Header -->
    <header class="flex items-center gap-4 mb-10">
      <button @click="router.push('/app/dashboard')" class="p-3 bg-white/5 border border-white/10 rounded-2xl text-gray-400 hover:text-white transition-colors">
        <ArrowLeft :size="20" />
      </button>
      <div>
        <div class="flex items-center gap-2 mb-1">
          <ShieldAlert :size="16" class="text-brand-green" />
          <span class="text-xs font-black text-brand-green uppercase tracking-widest">Painel Admin</span>
        </div>
        <h1 class="text-3xl font-black text-white">Assinaturas</h1>
        <p class="text-gray-400 text-sm">Controle de todos os gerentes e seus planos</p>
      </div>
    </header>

    <!-- KPI cards -->
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      <div class="bg-dark-card border border-white/10 rounded-2xl p-4 text-center">
        <p class="text-3xl font-black text-white">{{ counts.total }}</p>
        <p class="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-1">Total</p>
      </div>
      <div class="bg-brand-green/5 border border-brand-green/20 rounded-2xl p-4 text-center cursor-pointer hover:bg-brand-green/10 transition-colors" @click="filterStatus = 'ativo'">
        <p class="text-3xl font-black text-brand-green">{{ counts.ativo }}</p>
        <p class="text-[10px] font-black text-brand-green/60 uppercase tracking-widest mt-1">Ativas</p>
      </div>
      <div class="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 text-center cursor-pointer hover:bg-amber-500/10 transition-colors" @click="filterStatus = 'expirado'">
        <p class="text-3xl font-black text-amber-400">{{ counts.expirado }}</p>
        <p class="text-[10px] font-black text-amber-400/60 uppercase tracking-widest mt-1">Expiradas</p>
      </div>
      <div class="bg-zinc-800/50 border border-zinc-700/30 rounded-2xl p-4 text-center cursor-pointer hover:bg-zinc-700/30 transition-colors" @click="filterStatus = 'desativado'">
        <p class="text-3xl font-black text-zinc-400">{{ counts.desativado }}</p>
        <p class="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-1">Desativadas</p>
      </div>
      <div class="bg-purple-500/5 border border-purple-500/20 rounded-2xl p-4 text-center">
        <p class="text-3xl font-black text-purple-400">{{ counts.anual }}</p>
        <p class="text-[10px] font-black text-purple-400/60 uppercase tracking-widest mt-1">Anuais</p>
      </div>
      <div class="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4 text-center">
        <p class="text-3xl font-black text-blue-400">{{ counts.mensal }}</p>
        <p class="text-[10px] font-black text-blue-400/60 uppercase tracking-widest mt-1">Mensais</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-col sm:flex-row gap-3 mb-6">
      <div class="relative flex-1">
        <Search :size="16" class="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          v-model="search"
          type="text"
          placeholder="Buscar por estabelecimento ou gerente..."
          class="w-full bg-dark-card border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-sm text-white outline-none focus:border-brand-green/40 placeholder:text-zinc-600"
        />
      </div>
      <div class="flex gap-2">
        <button
          v-for="opt in [{ v: 'todos', l: 'Todos' }, { v: 'ativo', l: 'Ativas' }, { v: 'expirado', l: 'Expiradas' }, { v: 'desativado', l: 'Desativadas' }]"
          :key="opt.v"
          @click="filterStatus = opt.v"
          :class="filterStatus === opt.v
            ? 'bg-brand-green text-black border-brand-green'
            : 'bg-white/5 text-zinc-400 border-white/10 hover:border-white/20'"
          class="px-4 py-2 rounded-xl border text-xs font-black uppercase tracking-wider transition-all"
        >
          {{ opt.l }}
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-dark-card border border-white/10 rounded-[2rem] overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="border-b border-white/5 bg-black/20">
            <th class="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Estabelecimento</th>
            <th class="text-left px-4 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 hidden md:table-cell">Gerente</th>
            <th class="text-left px-4 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Plano</th>
            <th class="text-left px-4 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Status</th>
            <th class="text-left px-4 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 hidden lg:table-cell">Vencimento</th>
            <th class="text-right px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 hidden sm:table-cell">Valor</th>
            <th class="text-right px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 hidden lg:table-cell">Usuários</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-white/5">
          <tr v-for="sub in filtered" :key="sub.id" class="hover:bg-white/[0.02] transition-colors">
            <td class="px-6 py-4">
              <span class="font-bold text-white text-sm">{{ sub.establishment }}</span>
            </td>
            <td class="px-4 py-4 hidden md:table-cell">
              <span class="text-zinc-400 text-sm">{{ sub.manager }}</span>
            </td>
            <td class="px-4 py-4">
              <span
                class="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border"
                :class="sub.plan === 'anual'
                  ? 'text-purple-400 bg-purple-500/10 border-purple-500/20'
                  : 'text-blue-400 bg-blue-500/10 border-blue-500/20'"
              >
                {{ sub.plan }}
              </span>
            </td>
            <td class="px-4 py-4">
              <div
                class="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border"
                :class="statusConfig(sub.status).bg + ' ' + statusConfig(sub.status).color"
              >
                <component :is="statusConfig(sub.status).icon" :size="10" />
                {{ statusConfig(sub.status).label }}
              </div>
            </td>
            <td class="px-4 py-4 hidden lg:table-cell">
              <div class="flex items-center gap-1.5 text-sm text-zinc-400">
                <Calendar :size="13" class="text-zinc-600" />
                {{ formatDate(sub.nextDueDate) }}
              </div>
            </td>
            <td class="px-6 py-4 text-right hidden sm:table-cell">
              <span class="text-sm font-black text-white">
                {{ sub.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
              </span>
              <span class="text-[10px] text-zinc-500 block">/mês</span>
            </td>
            <td class="px-6 py-4 text-right hidden lg:table-cell">
              <div class="flex items-center justify-end gap-1.5 text-zinc-400 text-sm">
                <Users :size="13" class="text-zinc-600" />
                {{ sub.users }}
              </div>
            </td>
          </tr>

          <tr v-if="filtered.length === 0">
            <td colspan="7" class="px-6 py-16 text-center">
              <CreditCard :size="32" class="mx-auto mb-3 text-zinc-700" />
              <p class="text-zinc-500 text-sm font-bold">Nenhuma assinatura encontrada</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

  </main>
</template>
