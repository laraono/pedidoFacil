<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import {
  DollarSign, Users, TrendingUp, AlertTriangle,
  BarChart3, UserCheck, Flame, CreditCard,
  Target, Download, PackageOpen, ArrowLeft, Tag
} from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import { metricsApi } from '@/services/metricsApi';
import localStorageService from '@/services/localStorageService';
import { useToast } from '@/composables/useToast';
import ReportPrintLayout from '@/components/reports/ReportPrintLayout.vue';

const router = useRouter();
const { showToast } = useToast();

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
const couponUsage = ref([]);

const getDateRange = (filter) => {
  const end = new Date();
  const start = new Date();
  
  if (filter === '24h') {
    start.setHours(0, 0, 0, 0); 
  } else if (filter === '7d') {
    start.setDate(end.getDate() - 7);
  } else if (filter === '30d') {
    start.setDate(end.getDate() - 30);
  } else {
    start.setFullYear(2020); 
  }
  
  return { 
    startDate: start.toISOString(), 
    endDate: end.toISOString() 
  };
};

const loadData = async () => {
  isLoaded.value = false;
  
  try {
    const { startDate, endDate } = getDateRange(dateFilter.value);
    
    const overview = await metricsApi.getDashboardOverview(startDate, endDate, dateFilter.value);
    
    kpis.value = overview.kpis || {};
    revenueData.value = overview.revenueData || [];
    salesByChannel.value = overview.salesByChannel || [];
    peakHours.value = overview.peakHours || [];
    topWaiters.value = overview.topWaiters || [];
    cancellations.value = overview.cancellations || [];
    paymentMethods.value = overview.paymentMethods || [];
    topProducts.value = overview.topProducts || [];
    couponUsage.value = overview.couponUsage || [];

  } catch (error) {
    console.error("Erro ao carregar relatórios", error);
    showToast("Erro ao processar métricas. Tente novamente.", "error");
  } finally {
    setTimeout(() => { isLoaded.value = true; }, 50);
  }
};

const maxCouponUses = () => Math.max(...couponUsage.value.map(c => c.uses), 1);

onMounted(() => loadData());
watch(dateFilter, () => loadData());
watch(activeTab, () => {
  isLoaded.value = false;
  setTimeout(() => { isLoaded.value = true; }, 50);
});

const getMaxRevenue = () => Math.max(...revenueData.value.map(d => d.value), 1);
const getRevenueHeight = (val) => isLoaded.value ? `${(val / getMaxRevenue()) * 100}%` : '5%';

const restaurantName = computed(() => {
  try { return localStorageService.getOnboarding()?.nome_estabelecimento || 'Meu Restaurante'; }
  catch { return 'Meu Restaurante'; }
});

const currentDate = computed(() =>
  new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
);

const totalCancellationsCount = computed(() => cancellations.value.reduce((acc, curr) => acc + curr.count, 0));

const financialImpact = computed(() => {
  const tmStr = kpis.value.ticketMedio || '0';
  const ticketMedio = parseFloat(tmStr.replace('R$', '').replace(/\./g, '').replace(',', '.')) || 0;
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
  <div>
  <div class="max-w-7xl mx-auto py-12 px-6 font-inter overflow-x-hidden print:hidden">

    <header class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
      <div class="flex items-center gap-4">
        <button @click="router.back()" class="p-3 bg-gray-50 border border-[#E0E0E0] rounded text-[#757575] hover:text-[#212121] transition-all">
          <ArrowLeft :size="20" />
        </button>
        <div>
          <h1 class="text-3xl font-black text-[#212121] tracking-tight">Relatórios</h1>
          <p class="text-[#757575] text-sm mt-1">Inteligência de dados do seu negócio</p>
        </div>
      </div>

      <div class="flex items-center gap-3 w-full sm:w-auto">
        <button @click="exportToPDF"
          class="flex items-center gap-2 px-5 py-3 bg-gray-50 border border-[#E0E0E0] text-[#757575] text-xs font-black uppercase tracking-widest rounded hover:bg-gray-100 hover:text-[#212121] transition-all">
          <Download :size="16" /> PDF
        </button>
        <div class="flex items-center bg-gray-50 border border-[#E0E0E0] rounded p-1">
          <button v-for="opt in [{k:'24h', l:'Hoje'}, {k:'7d', l:'7d'}, {k:'30d', l:'30d'}, {k:'all', l:'Tudo'}]"
            :key="opt.k" @click="dateFilter = opt.k"
            class="px-4 py-2 rounded text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap"
            :class="dateFilter === opt.k ? 'bg-primary text-white' : 'text-[#757575] hover:text-[#212121]'">
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
        {id:'produtos', n:'Produtos', i: PackageOpen},
        {id:'cupons', n:'Cupons', i: Tag}
      ]"
        :key="tab.id" @click="activeTab = tab.id"
        class="flex items-center gap-2 px-5 py-3 rounded text-xs font-black uppercase tracking-widest transition-all duration-300 border whitespace-nowrap"
        :class="activeTab === tab.id
          ? 'bg-white border-[#E0E0E0] text-[#212121] shadow-xl'
          : 'bg-transparent border-transparent text-[#757575] hover:text-[#757575]'">
        <component :is="tab.i" :size="16" :class="activeTab === tab.id ? 'text-accent' : 'text-[#757575]'" />
        {{ tab.n }}
      </button>
    </div>

    <section class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div v-for="(val, key) in kpis" :key="key"
        class="bg-white border border-[#E0E0E0] p-6 rounded hover:border-accent/30 transition-all duration-300 group">
        <div class="flex items-center gap-4">
          <div class="p-3 bg-gray-50 border border-[#E0E0E0] rounded group-hover:bg-primary-dark/10 group-hover:border-accent/30 transition-all">
            <component :is="getKpiIcon(key)" :size="20" class="text-accent" />
          </div>
          <div>
            <p class="text-[10px] font-black text-[#757575] uppercase tracking-widest mb-0.5">{{ key.replace(/([A-Z])/g, ' $1').trim() }}</p>
            <h3 class="text-xl font-black text-[#212121]">{{ val }}</h3>
          </div>
        </div>
      </div>
    </section>

    <Transition enter-active-class="transition-all duration-400 ease-out" enter-from-class="opacity-0 translate-y-3" enter-to-class="opacity-100 translate-y-0" mode="out-in">

      <div v-if="activeTab === 'geral'" class="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12">
        <div class="lg:col-span-2 bg-white border border-[#E0E0E0] rounded p-8 flex flex-col">
          <h3 class="text-sm font-black text-[#212121] flex items-center gap-3 mb-8 uppercase tracking-widest">
            <Target :size="18" class="text-accent" /> {{ performanceTitle }}
          </h3>
          <div class="flex-grow flex items-end justify-between gap-2 px-2 relative min-h-[200px]">
            <div v-for="(data, i) in revenueData" :key="i" class="w-full flex flex-col items-center group h-full justify-end">
              <div class="w-full bg-gradient-to-t from-brand-green/10 to-brand-green/30 rounded-t-xl group-hover:from-brand-green/40 group-hover:to-brand-green/70 transition-all duration-700 relative cursor-pointer bar-animation"
                :style="{ height: getRevenueHeight(data.value) }">
                <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-[#212121] text-white text-[10px] font-black px-3 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap pointer-events-none">
                  R$ {{ data.value.toLocaleString('pt-BR') }}
                </div>
              </div>
              <span class="mt-3 text-[9px] font-black text-[#757575] uppercase tracking-widest">{{ data.label }}</span>
            </div>
          </div>
        </div>
        <div class="bg-white border border-[#E0E0E0] rounded p-8">
          <h3 class="text-sm font-black text-[#212121] mb-8 uppercase tracking-widest">Canais de Venda</h3>
          <div class="space-y-6">
            <div v-for="channel in salesByChannel" :key="channel.name" class="space-y-2">
              <div class="flex justify-between items-end">
                <span class="text-[10px] font-black text-[#757575] uppercase tracking-widest">{{ channel.name }}</span>
                <span class="text-sm font-black text-[#212121]">{{ channel.value }}%</span>
              </div>
              <div class="w-full bg-gray-50 h-3 rounded overflow-hidden border border-[#E0E0E0]">
                <div :class="channel.color" class="h-full rounded transition-all duration-1000"
                  :style="{ width: isLoaded ? channel.value + '%' : '0%' }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="activeTab === 'operacional'" class="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
        <div class="bg-white border border-[#E0E0E0] rounded p-8 flex flex-col">
          <h3 class="text-sm font-black text-[#212121] flex items-center gap-3 mb-8 uppercase tracking-widest">
            <Flame :size="18" class="text-orange-400" /> Fluxo de Pedidos
          </h3>
          <div class="flex-grow flex items-end justify-between gap-2 px-2 min-h-[200px]">
            <div v-for="h in peakHours" :key="h.hora" class="w-full flex flex-col items-center h-full justify-end group">
              <div class="w-full rounded-t-lg transition-all duration-700 bar-animation"
                :class="h.fluxo > 75 ? 'bg-gradient-to-t from-orange-600 to-orange-400' : 'bg-gray-100 group-hover:bg-gray-100'"
                :style="{ height: isLoaded ? `${h.fluxo}%` : '5%' }"></div>
              <span class="mt-3 text-[9px] font-black text-[#757575] uppercase">{{ h.hora }}</span>
            </div>
          </div>
        </div>
        <div class="bg-white border border-[#E0E0E0] rounded p-8">
          <h3 class="text-sm font-black text-[#212121] mb-8 flex items-center gap-3 uppercase tracking-widest">
            <UserCheck :size="18" class="text-accent" /> Performance Staff
          </h3>
          <div class="space-y-4">
            <div v-for="(waiter, index) in topWaiters" :key="waiter.id"
              class="flex items-center justify-between p-5 bg-gray-50 border border-[#E0E0E0] rounded hover:bg-gray-50 transition-all">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded flex items-center justify-center font-black text-lg"
                  :class="index === 0 ? 'bg-primary text-white' : 'bg-gray-100 text-[#757575]'">
                  {{ waiter.name.charAt(0) }}
                </div>
                <div>
                  <span class="font-black text-[#212121] block text-sm">{{ waiter.name }}</span>
                  <span class="text-[10px] font-black text-[#757575] uppercase tracking-widest">{{ waiter.orders }} pedidos</span>
                </div>
              </div>
              <span class="font-black text-[#212121] text-lg">{{ waiter.revenue }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="activeTab === 'financeiro'" class="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
        <div class="bg-white border border-[#E0E0E0] rounded p-8">
          <h3 class="text-sm font-black text-[#212121] flex items-center gap-3 mb-8 uppercase tracking-widest">
            <CreditCard :size="18" class="text-blue-400" /> Métodos de Recebimento
          </h3>
          <div class="space-y-6">
            <div v-for="method in paymentMethods" :key="method.name" class="space-y-2">
              <div class="flex justify-between items-end">
                <span class="text-[10px] font-black text-[#757575] uppercase tracking-widest">{{ method.name }}</span>
                <span class="text-sm font-black text-[#212121]">{{ method.value }}%</span>
              </div>
              <div class="w-full bg-gray-50 h-3 rounded overflow-hidden border border-[#E0E0E0]">
                <div :class="method.color" class="h-full rounded transition-all duration-1000"
                  :style="{ width: isLoaded ? method.value + '%' : '0%' }"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="bg-white border border-[#E0E0E0] rounded p-8 flex flex-col justify-between">
          <div>
            <h3 class="text-sm font-black text-[#212121] flex items-center gap-3 mb-8 uppercase tracking-widest">
              <AlertTriangle :size="18" class="text-danger" /> Perdas de Receita
            </h3>
            <div class="space-y-6">
              <div v-for="item in cancellations" :key="item.motivo" class="space-y-2">
                <div class="flex justify-between items-end">
                  <span class="text-[10px] font-black text-[#757575] uppercase tracking-widest">{{ item.motivo }}</span>
                  <span class="text-xs font-black text-[#212121]">{{ item.count }} un.</span>
                </div>
                <div class="w-full bg-gray-50 h-2.5 rounded overflow-hidden border border-[#E0E0E0]">
                  <div :class="item.color" class="h-full transition-all duration-1000"
                    :style="{ width: isLoaded ? `${(item.count / totalCancellationsCount) * 100}%` : '0%' }"></div>
                </div>
              </div>
            </div>
          </div>
          <div class="mt-8 p-6 bg-danger-light border border-danger rounded flex items-start gap-4">
            <AlertTriangle :size="20" class="text-danger flex-shrink-0 mt-0.5" />
            <div>
              <h4 class="text-danger font-black text-[10px] uppercase tracking-widest mb-1">Impacto Financeiro</h4>
              <p class="text-danger/80 text-xs leading-relaxed">
                Cancelamentos geraram perda de <strong class="text-danger font-black">{{ financialImpact }}</strong> no período.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="activeTab === 'produtos'" class="pb-12">
        <div class="bg-white border border-[#E0E0E0] rounded p-8">
          <h3 class="text-sm font-black text-[#212121] flex items-center gap-3 mb-8 uppercase tracking-widest">
            <PackageOpen :size="18" class="text-accent" /> Top Produtos & Margem
          </h3>
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr class="border-b border-[#E0E0E0]">
                  <th class="py-4 px-2 text-[10px] font-black text-[#757575] uppercase tracking-widest">Produto</th>
                  <th class="py-4 px-2 text-[10px] font-black text-[#757575] uppercase tracking-widest">Categoria</th>
                  <th class="py-4 px-2 text-[10px] font-black text-[#757575] uppercase tracking-widest text-center">Vendas</th>
                  <th class="py-4 px-2 text-[10px] font-black text-[#757575] uppercase tracking-widest text-right">Faturamento</th>
                  <th class="py-4 px-2 text-[10px] font-black text-[#757575] uppercase tracking-widest text-center">Margem</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="produto in topProducts" :key="produto.nome"
                  class="hover:bg-gray-50 border-b border-[#E0E0E0] last:border-0 transition-colors">
                  <td class="py-5 px-2 font-black text-sm text-[#212121]">{{ produto.nome }}</td>
                  <td class="py-5 px-2 text-xs text-[#757575]">{{ produto.categoria }}</td>
                  <td class="py-5 px-2 text-center font-black text-[#212121]">{{ produto.qtd }}</td>
                  <td class="py-5 px-2 text-right font-black text-accent">{{ produto.receita }}</td>
                  <td class="py-5 px-2 text-center">
                    <span class="bg-accent-light text-accent border border-accent/30 px-3 py-1 rounded text-[10px] font-black">{{ produto.margem }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div v-else-if="activeTab === 'cupons'" class="pb-12">
        <div class="bg-white border border-[#E0E0E0] rounded p-8">
          <h3 class="text-sm font-black text-[#212121] flex items-center gap-3 mb-8 uppercase tracking-widest">
            <Tag :size="18" class="text-accent" /> Uso de Cupons no Período
          </h3>
          <div v-if="couponUsage.length === 0" class="flex items-center justify-center h-40 text-[#757575]">
            <p class="text-[10px] font-black uppercase tracking-[0.2em]">Nenhum cupom utilizado no período.</p>
          </div>
          <div v-else class="space-y-6">
            <div v-for="coupon in couponUsage" :key="coupon.code" class="space-y-2">
              <div class="flex justify-between items-end">
                <div class="flex items-center gap-3">
                  <span class="text-[10px] font-black text-[#212121] uppercase tracking-widest font-mono">{{ coupon.code }}</span>
                  <span class="text-[9px] font-black text-[#757575] uppercase">
                    {{ coupon.type === 'percent' ? coupon.discount + '%' : 'R$ ' + coupon.discount }}
                  </span>
                </div>
                <span class="text-sm font-black text-accent">{{ coupon.uses }} usos</span>
              </div>
              <div class="w-full bg-gray-50 h-4 rounded overflow-hidden border border-[#E0E0E0]">
                <div class="h-full rounded bg-accent transition-all duration-1000"
                  :style="{ width: isLoaded ? `${(coupon.uses / maxCouponUses()) * 100}%` : '0%' }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </Transition>
  </div>

  <!-- Layout de impressão — visível apenas ao imprimir (window.print()) -->
  <ReportPrintLayout
    :restaurantName="restaurantName"
    :performanceTitle="performanceTitle"
    :currentDate="currentDate"
    :metrics="kpis"
    :revenueData="revenueData"
    :getMaxRevenue="getMaxRevenue"
    :salesByChannel="salesByChannel"
    :paymentMethods="paymentMethods"
    :topWaiters="topWaiters"
    :peakHours="peakHours"
    :cancellations="cancellations"
    :totalCancellationsCount="totalCancellationsCount"
    :financialImpact="financialImpact"
    :topProducts="topProducts"
    :couponUsage="couponUsage"
    :maxCouponUses="maxCouponUses"
  />
  </div>
</template>

<style scoped>
.bar-animation { transition: height 1s cubic-bezier(0.34, 1.56, 0.64, 1); }
</style>
