<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useSubscriptionStore } from '@/stores/subscriptions';
import {
  ArrowLeft, ShieldAlert, TrendingUp, DollarSign, Users,
  BarChart3, Download, Calendar
} from 'lucide-vue-next';

const router = useRouter();
const subscriptionStore = useSubscriptionStore();

const isLoaded = ref(false);
const dateFilter = ref('12m');

onMounted(() => setTimeout(() => isLoaded.value = true, 60));

const allSubs = computed(() => subscriptionStore.adminSubscriptions);

// KPIs
const totalActive = computed(() => allSubs.value.filter(s => s.status === 'ativo').length);
const totalMRR = computed(() => allSubs.value
  .filter(s => s.status === 'ativo')
  .reduce((acc, s) => acc + s.amount, 0));
const totalAnnual = computed(() => allSubs.value.filter(s => s.plan === 'anual').length);
const totalMonthly = computed(() => allSubs.value.filter(s => s.plan === 'mensal').length);
const avgUsers = computed(() => {
  const active = allSubs.value.filter(s => s.status === 'ativo');
  if (!active.length) return 0;
  return Math.round(active.reduce((a, s) => a + s.users, 0) / active.length);
});

// Monthly revenue chart (mock)
const monthlyRevenue = computed(() => {
  const months = ['Out', 'Nov', 'Dez', 'Jan', 'Fev', 'Mar'];
  const base = [420, 498, 549, 598, 648, totalMRR.value];
  return months.map((m, i) => ({ month: m, value: base[i] }));
});

const maxRevenue = computed(() => Math.max(...monthlyRevenue.value.map(d => d.value), 1));
const revenueHeight = (val) => isLoaded.value ? `${(val / maxRevenue.value) * 100}%` : '4%';

// Plan distribution
const planShare = computed(() => {
  const total = allSubs.value.length || 1;
  return {
    anual: Math.round((totalAnnual.value / total) * 100),
    mensal: Math.round((totalMonthly.value / total) * 100),
  };
});

// Per-establishment data sorted by users
const establishmentData = computed(() =>
  [...allSubs.value]
    .filter(s => s.status === 'ativo')
    .sort((a, b) => b.users - a.users)
);

const maxUsers = computed(() => Math.max(...establishmentData.value.map(e => e.users), 1));
</script>

<template>
  <main class="max-w-7xl mx-auto py-12 px-6 font-inter">

    <!-- Header -->
    <header class="flex items-center justify-between gap-4 mb-10">
      <div class="flex items-center gap-4">
        <button @click="router.push('/app/dashboard')" class="p-3 bg-white/5 border border-white/10 rounded-2xl text-gray-400 hover:text-white transition-colors">
          <ArrowLeft :size="20" />
        </button>
        <div>
          <div class="flex items-center gap-2 mb-1">
            <ShieldAlert :size="16" class="text-brand-green" />
            <span class="text-xs font-black text-brand-green uppercase tracking-widest">Painel Admin</span>
          </div>
          <h1 class="text-3xl font-black text-white">Relatórios de Assinaturas</h1>
          <p class="text-gray-400 text-sm">Faturamento e métricas da plataforma</p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <div class="flex bg-dark-card border border-white/10 rounded-2xl overflow-hidden">
          <button
            v-for="opt in [{ v: '3m', l: '3M' }, { v: '6m', l: '6M' }, { v: '12m', l: '12M' }]"
            :key="opt.v"
            @click="dateFilter = opt.v"
            :class="dateFilter === opt.v ? 'bg-brand-green text-black' : 'text-zinc-400 hover:text-white'"
            class="px-4 py-2 text-xs font-black uppercase transition-all"
          >
            {{ opt.l }}
          </button>
        </div>
        <button
          @click="window?.print()"
          class="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-zinc-400 hover:text-white text-sm font-bold transition-colors"
        >
          <Download :size="15" /> Exportar
        </button>
      </div>
    </header>

    <!-- KPI cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div class="bg-dark-card border border-white/10 rounded-[1.5rem] p-6">
        <div class="flex items-center gap-2 text-zinc-500 text-xs font-black uppercase tracking-widest mb-3">
          <DollarSign :size="14" /> MRR
        </div>
        <p class="text-3xl font-black text-white">
          {{ totalMRR.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
        </p>
        <p class="text-xs text-zinc-500 mt-1">receita mensal recorrente</p>
      </div>

      <div class="bg-dark-card border border-white/10 rounded-[1.5rem] p-6">
        <div class="flex items-center gap-2 text-zinc-500 text-xs font-black uppercase tracking-widest mb-3">
          <Users :size="14" /> Assinantes Ativos
        </div>
        <p class="text-3xl font-black text-brand-green">{{ totalActive }}</p>
        <p class="text-xs text-zinc-500 mt-1">de {{ allSubs.length }} cadastrados</p>
      </div>

      <div class="bg-dark-card border border-white/10 rounded-[1.5rem] p-6">
        <div class="flex items-center gap-2 text-zinc-500 text-xs font-black uppercase tracking-widest mb-3">
          <TrendingUp :size="14" /> ARR Estimado
        </div>
        <p class="text-3xl font-black text-white">
          {{ (totalMRR * 12).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
        </p>
        <p class="text-xs text-zinc-500 mt-1">receita anual recorrente</p>
      </div>

      <div class="bg-dark-card border border-white/10 rounded-[1.5rem] p-6">
        <div class="flex items-center gap-2 text-zinc-500 text-xs font-black uppercase tracking-widest mb-3">
          <Users :size="14" /> Média de Usuários
        </div>
        <p class="text-3xl font-black text-white">{{ avgUsers }}</p>
        <p class="text-xs text-zinc-500 mt-1">por estabelecimento ativo</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

      <!-- Revenue chart -->
      <div class="lg:col-span-2 bg-dark-card border border-white/10 rounded-[2rem] p-8">
        <div class="flex items-center gap-2 mb-6">
          <BarChart3 :size="18" class="text-brand-green" />
          <h2 class="font-black text-white">Faturamento Mensal (MRR)</h2>
        </div>

        <div class="flex items-end gap-3 h-48">
          <div
            v-for="(item, i) in monthlyRevenue"
            :key="i"
            class="flex-1 flex flex-col items-center gap-2"
          >
            <span class="text-[10px] font-black text-zinc-500">
              {{ item.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }) }}
            </span>
            <div class="w-full rounded-t-lg relative overflow-hidden" style="height: 120px;">
              <div
                class="absolute bottom-0 left-0 right-0 rounded-t-lg transition-all duration-700"
                :class="i === monthlyRevenue.length - 1 ? 'bg-brand-green' : 'bg-brand-green/30'"
                :style="{ height: revenueHeight(item.value) }"
              />
            </div>
            <span class="text-[10px] font-black text-zinc-400">{{ item.month }}</span>
          </div>
        </div>
      </div>

      <!-- Plan distribution -->
      <div class="bg-dark-card border border-white/10 rounded-[2rem] p-8">
        <div class="flex items-center gap-2 mb-6">
          <Calendar :size="18" class="text-brand-green" />
          <h2 class="font-black text-white">Distribuição de Planos</h2>
        </div>

        <div class="space-y-5">
          <div>
            <div class="flex justify-between items-center mb-2">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-purple-500 inline-block" />
                <span class="text-sm font-bold text-white">Anual</span>
              </div>
              <span class="text-sm font-black text-white">{{ totalAnnual }} <span class="text-zinc-500 font-medium">({{ planShare.anual }}%)</span></span>
            </div>
            <div class="h-2.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                class="h-full bg-purple-500 rounded-full transition-all duration-700"
                :style="{ width: isLoaded ? planShare.anual + '%' : '0%' }"
              />
            </div>
          </div>

          <div>
            <div class="flex justify-between items-center mb-2">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-blue-500 inline-block" />
                <span class="text-sm font-bold text-white">Mensal</span>
              </div>
              <span class="text-sm font-black text-white">{{ totalMonthly }} <span class="text-zinc-500 font-medium">({{ planShare.mensal }}%)</span></span>
            </div>
            <div class="h-2.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                class="h-full bg-blue-500 rounded-full transition-all duration-700"
                :style="{ width: isLoaded ? planShare.mensal + '%' : '0%' }"
              />
            </div>
          </div>

          <div class="pt-4 border-t border-white/5 space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-zinc-400">Ticket médio anual</span>
              <span class="font-black text-white">R$ 598,80</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-zinc-400">Ticket médio mensal</span>
              <span class="font-black text-white">R$ 79,90</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Per-establishment table -->
    <div class="bg-dark-card border border-white/10 rounded-[2rem] overflow-hidden">
      <div class="p-6 border-b border-white/5 flex items-center gap-3">
        <Users :size="18" class="text-brand-green" />
        <h2 class="font-black text-white">Usuários por Estabelecimento</h2>
        <span class="ml-auto text-xs text-zinc-500 font-bold">apenas ativos</span>
      </div>

      <div class="divide-y divide-white/5">
        <div v-for="est in establishmentData" :key="est.id" class="px-6 py-4 flex items-center gap-4">
          <div class="w-40 shrink-0">
            <p class="text-sm font-bold text-white truncate">{{ est.establishment }}</p>
            <p class="text-[11px] text-zinc-500">{{ est.manager }}</p>
          </div>
          <div class="flex-1">
            <div class="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                class="h-full bg-brand-green rounded-full transition-all duration-700"
                :style="{ width: isLoaded ? (est.users / maxUsers * 100) + '%' : '0%' }"
              />
            </div>
          </div>
          <div class="shrink-0 w-20 text-right">
            <span class="text-sm font-black text-white">{{ est.users }}</span>
            <span class="text-xs text-zinc-500"> usuários</span>
          </div>
          <span
            class="shrink-0 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border"
            :class="est.plan === 'anual'
              ? 'text-purple-400 bg-purple-500/10 border-purple-500/20'
              : 'text-blue-400 bg-blue-500/10 border-blue-500/20'"
          >
            {{ est.plan }}
          </span>
        </div>
      </div>
    </div>

  </main>
</template>
