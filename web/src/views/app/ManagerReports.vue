<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import {
  DollarSign, Users, TrendingUp, AlertTriangle,
  BarChart3, UserCheck, Flame, CreditCard,
  Target, Download, PackageOpen, ArrowLeft
} from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import {
  getKpisMock, getRevenueChartMock, getSalesByChannelMock,
  getPeakHoursMock, getTopWaitersMock, getCancellationsMock,
  getPaymentMethodsMock, getTopProductsMock
} from '@/mock/reportsmock';

const router = useRouter();

const activeTab = ref('geral');
const dateFilter = ref('7d');
const isLoaded = ref(false);

const kpis = ref({});
const revenueData = ref([]);
const salesByChannel = ref([]);
const peakHours = ref([]);
const topWaiters = ref([]);
const cancellations = ref([]);
const paymentMethods = ref([]);
const topProducts = ref([]);

const loadData = () => {
  isLoaded.value = false;
  kpis.value = getKpisMock(dateFilter.value);
  revenueData.value = getRevenueChartMock(dateFilter.value);
  salesByChannel.value = getSalesByChannelMock(dateFilter.value);
  peakHours.value = getPeakHoursMock(dateFilter.value);
  topWaiters.value = getTopWaitersMock(dateFilter.value);
  cancellations.value = getCancellationsMock(dateFilter.value);
  paymentMethods.value = getPaymentMethodsMock(dateFilter.value);
  topProducts.value = getTopProductsMock(dateFilter.value);
  setTimeout(() => { isLoaded.value = true; }, 50);
};

onMounted(() => loadData());
watch(dateFilter, () => loadData());
watch(activeTab, () => {
  isLoaded.value = false;
  setTimeout(() => { isLoaded.value = true; }, 50);
});

const getMaxRevenue = () => Math.max(...revenueData.value.map(d => d.value));
const getRevenueHeight = (val) => isLoaded.value ? `${(val / getMaxRevenue()) * 100}%` : '5%';

const totalCancellationsCount = computed(() => cancellations.value.reduce((acc, curr) => acc + curr.count, 0));

const financialImpact = computed(() => {
  const tmStr = kpis.value.ticketMedio || '0';
  const ticketMedio = parseFloat(tmStr.replace('R$', '').replace(/\./g, '').replace(',', '.')) || 85.25;
  const loss = totalCancellationsCount.value * ticketMedio;
  return loss.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
});

const getKpiIcon = (key) => {
  if (key === 'faturamento') return DollarSign;
  if (key === 'ticketMedio') return TrendingUp;
  if (key === 'giroMesa') return Users;
  return AlertTriangle;
};

const performanceTitle = computed(() => {
  if (dateFilter.value === '24h') return 'Performance Horária';
  if (dateFilter.value === '7d') return 'Performance Diária';
  if (dateFilter.value === '30d') return 'Performance Semanal';
  return 'Performance Geral';
});

const exportToPDF = () => { window.print(); };
</script>

<template>
  <div class="max-w-7xl mx-auto py-12 px-6 font-inter overflow-x-hidden">

    <header class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
      <div class="flex items-center gap-4">
        <button @click="router.back()" class="p-3 bg-white/5 border border-white/10 rounded-2xl text-gray-400 hover:text-white transition-all">
          <ArrowLeft :size="20" />
        </button>
        <div>
          <h1 class="text-3xl font-black text-white tracking-tight">Relatórios</h1>
          <p class="text-gray-400 text-sm mt-1">Inteligência de dados do seu negócio</p>
        </div>
      </div>

      <div class="flex items-center gap-3 w-full sm:w-auto">
        <button @click="exportToPDF"
          class="flex items-center gap-2 px-5 py-3 bg-white/5 border border-white/10 text-gray-300 text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-white/10 hover:text-white transition-all">
          <Download :size="16" /> PDF
        </button>
        <div class="flex items-center bg-white/5 border border-white/10 rounded-2xl p-1">
          <button v-for="opt in [{k:'24h', l:'Hoje'}, {k:'7d', l:'7d'}, {k:'30d', l:'30d'}, {k:'all', l:'Tudo'}]"
            :key="opt.k" @click="dateFilter = opt.k"
            class="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap"
            :class="dateFilter === opt.k ? 'bg-brand-green text-black' : 'text-gray-400 hover:text-white'">
            {{ opt.l }}
          </button>
        </div>
      </div>
    </header>

    <div class="flex gap-2 overflow-x-auto pb-2 mb-8 -mx-6 px-6 sm:mx-0 sm:px-0">
      <button v-for="tab in [
        {id:'geral', n:'Visão Geral', i: BarChart3},
        {id:'operacional', n:'Operacional', i: Users},
        {id:'financeiro', n:'Financeiro', i: DollarSign},
        {id:'produtos', n:'Produtos', i: PackageOpen}
      ]"
        :key="tab.id" @click="activeTab = tab.id"
        class="flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 border whitespace-nowrap"
        :class="activeTab === tab.id
          ? 'bg-dark-card border-white/20 text-white shadow-xl'
          : 'bg-transparent border-transparent text-gray-500 hover:text-gray-300'">
        <component :is="tab.i" :size="16" :class="activeTab === tab.id ? 'text-brand-green' : 'text-gray-600'" />
        {{ tab.n }}
      </button>
    </div>

    <section class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div v-for="(val, key) in kpis" :key="key"
        class="bg-dark-card border border-white/10 p-6 rounded-[2rem] hover:border-brand-green/20 transition-all duration-300 group">
        <div class="flex items-center gap-4">
          <div class="p-3 bg-white/5 border border-white/10 rounded-2xl group-hover:bg-brand-green/10 group-hover:border-brand-green/20 transition-all">
            <component :is="getKpiIcon(key)" :size="20" class="text-brand-green" />
          </div>
          <div>
            <p class="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-0.5">{{ key.replace(/([A-Z])/g, ' $1').trim() }}</p>
            <h3 class="text-xl font-black text-white">{{ val }}</h3>
          </div>
        </div>
      </div>
    </section>

    <Transition enter-active-class="transition-all duration-400 ease-out" enter-from-class="opacity-0 translate-y-3" enter-to-class="opacity-100 translate-y-0" mode="out-in">

      <div v-if="activeTab === 'geral'" class="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12">
        <div class="lg:col-span-2 bg-dark-card border border-white/10 rounded-[2.5rem] p-8 flex flex-col">
          <h3 class="text-sm font-black text-white flex items-center gap-3 mb-8 uppercase tracking-widest">
            <Target :size="18" class="text-brand-green" /> {{ performanceTitle }}
          </h3>
          <div class="flex-grow flex items-end justify-between gap-2 px-2 relative min-h-[200px]">
            <div v-for="(data, i) in revenueData" :key="i" class="w-full flex flex-col items-center group h-full justify-end">
              <div class="w-full bg-gradient-to-t from-brand-green/10 to-brand-green/30 rounded-t-xl group-hover:from-brand-green/40 group-hover:to-brand-green/70 transition-all duration-700 relative cursor-pointer bar-animation"
                :style="{ height: getRevenueHeight(data.value) }">
                <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-zinc-900 border border-white/10 text-white text-[10px] font-black px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap pointer-events-none">
                  R$ {{ data.value.toLocaleString('pt-BR') }}
                </div>
              </div>
              <span class="mt-3 text-[9px] font-black text-gray-500 uppercase tracking-widest">{{ data.label }}</span>
            </div>
          </div>
        </div>
        <div class="bg-dark-card border border-white/10 rounded-[2.5rem] p-8">
          <h3 class="text-sm font-black text-white mb-8 uppercase tracking-widest">Canais de Venda</h3>
          <div class="space-y-6">
            <div v-for="channel in salesByChannel" :key="channel.name" class="space-y-2">
              <div class="flex justify-between items-end">
                <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">{{ channel.name }}</span>
                <span class="text-sm font-black text-white">{{ channel.value }}%</span>
              </div>
              <div class="w-full bg-white/5 h-3 rounded-full overflow-hidden border border-white/5">
                <div :class="channel.color" class="h-full rounded-full transition-all duration-1000"
                  :style="{ width: isLoaded ? channel.value + '%' : '0%' }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="activeTab === 'operacional'" class="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
        <div class="bg-dark-card border border-white/10 rounded-[2.5rem] p-8 flex flex-col">
          <h3 class="text-sm font-black text-white flex items-center gap-3 mb-8 uppercase tracking-widest">
            <Flame :size="18" class="text-orange-400" /> Fluxo de Pedidos
          </h3>
          <div class="flex-grow flex items-end justify-between gap-2 px-2 min-h-[200px]">
            <div v-for="h in peakHours" :key="h.hora" class="w-full flex flex-col items-center h-full justify-end group">
              <div class="w-full rounded-t-lg transition-all duration-700 bar-animation"
                :class="h.fluxo > 75 ? 'bg-gradient-to-t from-orange-600 to-orange-400' : 'bg-white/10 group-hover:bg-white/20'"
                :style="{ height: isLoaded ? `${h.fluxo}%` : '5%' }"></div>
              <span class="mt-3 text-[9px] font-black text-gray-500 uppercase">{{ h.hora }}</span>
            </div>
          </div>
        </div>
        <div class="bg-dark-card border border-white/10 rounded-[2.5rem] p-8">
          <h3 class="text-sm font-black text-white mb-8 flex items-center gap-3 uppercase tracking-widest">
            <UserCheck :size="18" class="text-brand-green" /> Performance Staff
          </h3>
          <div class="space-y-4">
            <div v-for="(waiter, index) in topWaiters" :key="waiter.id"
              class="flex items-center justify-between p-5 bg-white/[0.03] border border-white/5 rounded-2xl hover:bg-white/5 transition-all">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-full flex items-center justify-center font-black text-lg"
                  :class="index === 0 ? 'bg-brand-green text-black' : 'bg-white/10 text-gray-300'">
                  {{ waiter.name.charAt(0) }}
                </div>
                <div>
                  <span class="font-black text-white block text-sm">{{ waiter.name }}</span>
                  <span class="text-[10px] font-black text-gray-500 uppercase tracking-widest">{{ waiter.orders }} pedidos</span>
                </div>
              </div>
              <span class="font-black text-white text-lg">{{ waiter.revenue }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="activeTab === 'financeiro'" class="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
        <div class="bg-dark-card border border-white/10 rounded-[2.5rem] p-8">
          <h3 class="text-sm font-black text-white flex items-center gap-3 mb-8 uppercase tracking-widest">
            <CreditCard :size="18" class="text-blue-400" /> Métodos de Recebimento
          </h3>
          <div class="space-y-6">
            <div v-for="method in paymentMethods" :key="method.name" class="space-y-2">
              <div class="flex justify-between items-end">
                <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">{{ method.name }}</span>
                <span class="text-sm font-black text-white">{{ method.value }}%</span>
              </div>
              <div class="w-full bg-white/5 h-3 rounded-full overflow-hidden border border-white/5">
                <div :class="method.color" class="h-full rounded-full transition-all duration-1000"
                  :style="{ width: isLoaded ? method.value + '%' : '0%' }"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="bg-dark-card border border-white/10 rounded-[2.5rem] p-8 flex flex-col justify-between">
          <div>
            <h3 class="text-sm font-black text-white flex items-center gap-3 mb-8 uppercase tracking-widest">
              <AlertTriangle :size="18" class="text-red-400" /> Perdas de Receita
            </h3>
            <div class="space-y-6">
              <div v-for="item in cancellations" :key="item.motivo" class="space-y-2">
                <div class="flex justify-between items-end">
                  <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">{{ item.motivo }}</span>
                  <span class="text-xs font-black text-white">{{ item.count }} un.</span>
                </div>
                <div class="w-full bg-white/5 h-2.5 rounded-full overflow-hidden border border-white/5">
                  <div :class="item.color" class="h-full transition-all duration-1000"
                    :style="{ width: isLoaded ? `${(item.count / totalCancellationsCount) * 100}%` : '0%' }"></div>
                </div>
              </div>
            </div>
          </div>
          <div class="mt-8 p-6 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-4">
            <AlertTriangle :size="20" class="text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 class="text-red-300 font-black text-[10px] uppercase tracking-widest mb-1">Impacto Financeiro</h4>
              <p class="text-red-400/80 text-xs leading-relaxed">
                Cancelamentos geraram perda de <strong class="text-red-300 font-black">{{ financialImpact }}</strong> no período.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="activeTab === 'produtos'" class="pb-12">
        <div class="bg-dark-card border border-white/10 rounded-[2.5rem] p-8">
          <h3 class="text-sm font-black text-white flex items-center gap-3 mb-8 uppercase tracking-widest">
            <PackageOpen :size="18" class="text-brand-green" /> Top Produtos & Margem
          </h3>
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr class="border-b border-white/5">
                  <th class="py-4 px-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">Produto</th>
                  <th class="py-4 px-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">Categoria</th>
                  <th class="py-4 px-2 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Vendas</th>
                  <th class="py-4 px-2 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Faturamento</th>
                  <th class="py-4 px-2 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Margem</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="produto in topProducts" :key="produto.nome"
                  class="hover:bg-white/5 border-b border-white/5 last:border-0 transition-colors">
                  <td class="py-5 px-2 font-black text-sm text-white">{{ produto.nome }}</td>
                  <td class="py-5 px-2 text-xs text-gray-400">{{ produto.categoria }}</td>
                  <td class="py-5 px-2 text-center font-black text-white">{{ produto.qtd }}</td>
                  <td class="py-5 px-2 text-right font-black text-brand-green">{{ produto.receita }}</td>
                  <td class="py-5 px-2 text-center">
                    <span class="bg-brand-green/10 text-brand-green border border-brand-green/20 px-3 py-1 rounded-lg text-[10px] font-black">{{ produto.margem }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="text-[10px] text-gray-600 mt-6 text-center italic">* A margem de lucro é uma estimativa calculada com base no CMV.</p>
        </div>
      </div>

    </Transition>
  </div>
</template>

<style scoped>
.bar-animation { transition: height 1s cubic-bezier(0.34, 1.56, 0.64, 1); }
</style>
