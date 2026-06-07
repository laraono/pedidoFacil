<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { DollarSign, Users, TrendingUp, AlertTriangle, BarChart3, PackageOpen, Tag, Download } from 'lucide-vue-next';
import { metricsApi } from '@/services/metricsApi';
import localStorageService from '@/services/localStorageService';
import { useUtils } from '@/composables/useUtils';
import { useAsyncAction } from '@/composables/useAsyncAction';
import { PageHeader, MetricCard, BaseButton } from '@/components/ui';
import ReportPrintLayout from '@/components/reports/ReportPrintLayout.vue';
import GeralTab from '@/components/reports/GeralTab.vue';
import OperacionalTab from '@/components/reports/OperacionalTab.vue';
import FinanceiroTab from '@/components/reports/FinanceiroTab.vue';
import ProdutosTab from '@/components/reports/ProdutosTab.vue';
import CuponsTab from '@/components/reports/CuponsTab.vue';

const { formatCurrency } = useUtils();
const { run } = useAsyncAction();

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
  if (filter === '24h') start.setHours(0, 0, 0, 0);
  else if (filter === '7d') start.setDate(end.getDate() - 7);
  else if (filter === '30d') start.setDate(end.getDate() - 30);
  else start.setFullYear(2020);
  return { startDate: start.toISOString(), endDate: end.toISOString() };
};

const loadData = async () => {
  isLoaded.value = false;
  await run(async () => {
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
  }, 'Erro ao carregar relatórios');
  setTimeout(() => { isLoaded.value = true; }, 50);
};

onMounted(() => loadData());
watch(dateFilter, () => loadData());
watch(activeTab, () => {
  isLoaded.value = false;
  setTimeout(() => { isLoaded.value = true; }, 50);
});

const restaurantName = computed(() => {
  try { return localStorageService.getOnboarding()?.nome_estabelecimento || 'Meu Restaurante'; }
  catch { return 'Meu Restaurante'; }
});

const currentDate = computed(() =>
  new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
);

const totalCancellationsCount = computed(() => kpis.value.cancelamentos || 0);

const financialImpact = computed(() =>
  formatCurrency((kpis.value.cancelamentos || 0) * (kpis.value.ticketMedio || 0))
);

const performanceTitle = computed(() => ({
  '24h': 'Performance Horária',
  '7d': 'Performance Diária',
  '30d': 'Performance Mensal',
}[dateFilter.value] ?? 'Performance Geral'));

const getMaxRevenue = () => {
  const max = Math.max(...revenueData.value.map(d => d.value), 0);
  return max <= 0 ? 1 : max;
};
const maxCouponUses = () => Math.max(...couponUsage.value.map(c => c.uses), 1);

const kpiLabels = { faturamento: 'Faturamento', ticketMedio: 'Ticket Médio', giroMesa: 'Giro de Mesa', cancelamentos: 'Cancelamentos' };
const kpiIcons = { faturamento: DollarSign, ticketMedio: TrendingUp, giroMesa: Users, cancelamentos: AlertTriangle };
const formatKpi = (key, val) => (key === 'faturamento' || key === 'ticketMedio') ? formatCurrency(val) : val;

const tabs = [
  { id: 'geral', n: 'Visão Geral', i: BarChart3 },
  { id: 'operacional', n: 'Operacional', i: Users },
  { id: 'financeiro', n: 'Financeiro', i: DollarSign },
  { id: 'produtos', n: 'Produtos', i: PackageOpen },
  { id: 'cupons', n: 'Cupons', i: Tag },
];
</script>

<template>
  <div class="bg-page min-h-screen">
    <div class="max-w-7xl mx-auto py-12 px-6 font-inter overflow-x-hidden print:hidden">

      <PageHeader title="Relatórios" subtitle="Acompanhe o desempenho do seu negócio" back-to="back">
        <template #actions>
          <BaseButton variant="secondary" :icon="Download" @click="() => window.print()">PDF</BaseButton>
          <div class="flex items-center bg-white border border-[#E0E0E0] rounded p-1 shadow-sm">
            <button v-for="opt in [{k:'24h', l:'Hoje'}, {k:'7d', l:'7D'}, {k:'30d', l:'30D'}, {k:'all', l:'Tudo'}]"
              :key="opt.k" @click="dateFilter = opt.k"
              class="px-4 py-2 rounded text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap"
              :class="dateFilter === opt.k ? 'bg-primary text-white shadow-lg' : 'text-[#757575] hover:text-[#212121]'">
              {{ opt.l }}
            </button>
          </div>
        </template>
      </PageHeader>

      <div class="flex gap-2 overflow-x-auto pb-2 mb-8 -mx-6 px-6 sm:mx-0 sm:px-0 custom-scrollbar">
        <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id"
          class="flex items-center gap-2 px-5 py-3 rounded text-xs font-black uppercase tracking-widest transition-all duration-300 border whitespace-nowrap shadow-sm"
          :class="activeTab === tab.id ? 'bg-white border-[#E0E0E0] text-[#212121] scale-105 z-10' : 'bg-transparent border-transparent text-[#757575] hover:opacity-80'">
          <component :is="tab.i" :size="16" :class="activeTab === tab.id ? 'text-accent' : 'text-[#757575]'" />
          {{ tab.n }}
        </button>
      </div>

      <section class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard v-for="(val, key) in kpis" :key="key"
          :label="kpiLabels[key] || key"
          :value="formatKpi(key, val) || '---'"
          :icon="kpiIcons[key]"
        />
      </section>

      <Transition enter-active-class="transition-all duration-400 ease-out" enter-from-class="opacity-0 translate-y-3" enter-to-class="opacity-100 translate-y-0" mode="out-in">
        <GeralTab v-if="activeTab === 'geral'" :revenue-data="revenueData" :sales-by-channel="salesByChannel" :performance-title="performanceTitle" :is-loaded="isLoaded" />
        <OperacionalTab v-else-if="activeTab === 'operacional'" :peak-hours="peakHours" :top-waiters="topWaiters" :is-loaded="isLoaded" />
        <FinanceiroTab v-else-if="activeTab === 'financeiro'" :payment-methods="paymentMethods" :cancellations="cancellations" :total-cancellations-count="totalCancellationsCount" :financial-impact="financialImpact" :is-loaded="isLoaded" />
        <ProdutosTab v-else-if="activeTab === 'produtos'" :top-products="topProducts" />
        <CuponsTab v-else-if="activeTab === 'cupons'" :coupon-usage="couponUsage" :is-loaded="isLoaded" />
      </Transition>
    </div>

    <ReportPrintLayout
      v-if="isLoaded"
      :restaurant-name="restaurantName"
      :performance-title="performanceTitle"
      :current-date="currentDate"
      :metrics="kpis"
      :revenue-data="revenueData"
      :get-max-revenue="getMaxRevenue"
      :sales-by-channel="salesByChannel"
      :payment-methods="paymentMethods"
      :top-waiters="topWaiters"
      :peak-hours="peakHours"
      :cancellations="cancellations"
      :total-cancellations-count="totalCancellationsCount"
      :financial-impact="financialImpact"
      :top-products="topProducts"
      :coupon-usage="couponUsage"
      :max-coupon-uses="maxCouponUses"
    />
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { height: 4px; width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #E0E0E0; border-radius: 10px; }
@media print { .bg-page { background-color: white !important; } }
</style>
