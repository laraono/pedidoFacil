<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { 
  DollarSign, Users, TrendingUp, AlertTriangle, 
  BarChart3, Flame, CreditCard, Target, Download, PackageOpen, Ghost
} from 'lucide-vue-next';

import ReportCard from '@/components/reports/ReportCard.vue';
import ReportPrintLayout from '@/components/reports/ReportPrintLayout.vue';

import { 
  getMainMetricsMock, getRevenueChartMock, getSalesByChannelMock, 
  getPeakHoursMock, getTopWaitersMock, getCancellationsMock, getPaymentMethodsMock, getTopProductsMock
} from '@/mock/reportsmock';
import { getEstablishmentMock, initMockEstablishment } from '@/mock/stablishmentmock'; 

const activeTab = ref('geral');
const dateFilter = ref('7d');
const isLoaded = ref(false); 
const isLoading = ref(true); 
const restaurantName = ref('Carregando...'); 

const summaryMetrics = ref({}); 
const revenueData = ref([]);
const salesByChannel = ref([]);
const peakHours = ref([]);
const topWaiters = ref([]);
const cancellations = ref([]);
const paymentMethods = ref([]);
const topProducts = ref([]);

const loadData = async () => {
  isLoading.value = true;
  isLoaded.value = false;
  
  try {
    await new Promise(resolve => setTimeout(resolve, 800));

    summaryMetrics.value = getMainMetricsMock(dateFilter.value);
    revenueData.value = getRevenueChartMock(dateFilter.value);
    salesByChannel.value = getSalesByChannelMock(dateFilter.value);
    peakHours.value = getPeakHoursMock(dateFilter.value);
    topWaiters.value = getTopWaitersMock(dateFilter.value);
    cancellations.value = getCancellationsMock(dateFilter.value);
    paymentMethods.value = getPaymentMethodsMock(dateFilter.value);
    topProducts.value = getTopProductsMock(dateFilter.value);
    
  } catch (error) {
    console.error(error);
  } finally {
    isLoading.value = false;
    setTimeout(() => { isLoaded.value = true; }, 50);
  }
};

onMounted(async () => {
  initMockEstablishment(); 
  try {
    const data = await getEstablishmentMock();
    if (data && data.info) restaurantName.value = data.info.name;
  } catch (error) {
    restaurantName.value = 'Restaurante';
  }
  
  loadData();
});

watch(dateFilter, () => loadData());
watch(activeTab, () => {
  if(!isLoading.value) {
    isLoaded.value = false;
    setTimeout(() => { isLoaded.value = true; }, 50);
  }
});

const formatCurrency = (val) => Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const formatMetric = (key, val) => {
  if (key === 'faturamento' || key === 'ticketMedio') return formatCurrency(val);
  return val;
};

const getMetricLabel = (key) => {
  const labels = { faturamento: 'Faturamento', ticketMedio: 'Ticket Médio', cancelamentos: 'Cancelamentos', giroMesa: 'Giro de Mesa' };
  return labels[key] || key;
};

const getMaxRevenue = () => revenueData.value.length ? Math.max(...revenueData.value.map(d => d.value)) : 1;
const getRevenueHeight = (val) => isLoaded.value ? `${(val / getMaxRevenue()) * 100}%` : '5%';
const totalCancellationsCount = computed(() => cancellations.value.reduce((acc, curr) => acc + curr.count, 0));

const financialImpactRaw = computed(() => {
  const ticketMedio = summaryMetrics.value.ticketMedio || 0; 
  return totalCancellationsCount.value * ticketMedio;
});
const financialImpact = computed(() => formatCurrency(financialImpactRaw.value));

const getIcon = (key) => {
  if (key === 'faturamento') return DollarSign;
  if (key === 'ticketMedio') return TrendingUp;
  if (key === 'giroMesa') return Users;
  return AlertTriangle;
};

const getIconColor = (key) => key === 'cancelamentos' ? 'text-red-500' : 'text-brand-green';

const performanceTitle = computed(() => {
  if (dateFilter.value === '24h') return 'Performance Horária';
  if (dateFilter.value === '7d') return 'Performance Diária';
  if (dateFilter.value === '30d') return 'Performance Semanal';
  return 'Performance Geral (Todo o Período)';
});

const currentDate = computed(() => new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }));

const exportToPDF = () => window.print();
</script>

<template>
  <div class="min-h-screen bg-gray-50 text-gray-900 font-inter p-4 md:p-8 selection:bg-brand-green/30 overflow-x-hidden print:bg-white print:p-0 print:min-h-0">
    
    <header class="max-w-7xl mx-auto mb-6 md:mb-10 print:hidden">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6 mb-6 md:mb-10">
        <div>
          <h1 class="text-3xl md:text-4xl font-black text-gray-900">Relatórios</h1>
          <p class="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">{{ restaurantName }}</p>
        </div>
        
        <div class="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <button @click="exportToPDF" :disabled="isLoading" class="w-full md:w-auto flex items-center justify-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-colors shadow-lg disabled:opacity-50">
            <Download class="w-4 h-4" /> Exportar PDF
          </button>

          <div class="flex items-center w-full md:w-auto bg-white border border-gray-200 rounded-xl md:rounded-2xl p-1 md:p-1.5 shadow-sm overflow-x-auto">
            <button v-for="opt in [{k:'24h', l:'Hoje'}, {k:'7d', l:'7 dias'}, {k:'30d', l:'30 dias'}, {k:'all', l:'Tudo'}]" :key="opt.k"
              @click="dateFilter = opt.k"
              class="flex-1 md:flex-none px-4 py-2 md:px-5 md:py-2.5 rounded-lg md:rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all duration-300 text-center whitespace-nowrap"
              :class="dateFilter === opt.k ? 'bg-brand-green text-black shadow-lg shadow-brand-green/20 scale-100 md:scale-105' : 'text-gray-400 hover:text-gray-800'">
              {{ opt.l }}
            </button>
          </div>
        </div>
      </div>

      <div class="flex gap-3 md:gap-4 overflow-x-auto pb-4 custom-scrollbar select-none -mx-4 px-4 md:mx-0 md:px-0">
        <button v-for="tab in [
                  {id:'geral', n:'Visão Geral', i: BarChart3}, 
                  {id:'operacional', n:'Operacional & Salão', i: Users}, 
                  {id:'financeiro', n:'Financeiro & Caixa', i: DollarSign},
                  {id:'produtos', n:'Produtos & Detalhes', i: PackageOpen}
                ]" 
                :key="tab.id" @click="activeTab = tab.id"
                class="flex items-center gap-2 md:gap-3 px-5 py-3 md:px-8 py-4 rounded-xl md:rounded-[1.5rem] text-xs md:text-sm font-black transition-all duration-500 border-2 whitespace-nowrap"
                :class="activeTab === tab.id ? 'bg-white border-brand-green/30 text-gray-900 shadow-xl shadow-brand-green/5' : 'bg-transparent border-transparent text-gray-500 hover:bg-gray-100'">
          <component :is="tab.i" class="w-4 h-4 md:w-5 md:h-5 transition-colors" :class="activeTab === tab.id ? 'text-brand-green' : 'text-gray-300'" />
          {{ tab.n }}
        </button>
      </div>
    </header>

    <main class="max-w-7xl mx-auto print:hidden">
      
      <div v-if="isLoading" class="animate-pulse space-y-8 pb-12">
        <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div v-for="i in 4" :key="i" class="h-[120px] bg-gray-200 rounded-2xl md:rounded-[2.5rem]"></div>
        </section>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <div class="lg:col-span-2 h-[400px] bg-gray-200 rounded-3xl md:rounded-[3rem]"></div>
          <div class="h-[400px] bg-gray-200 rounded-3xl md:rounded-[3rem]"></div>
        </div>
      </div>

      <div v-else>
        <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
          <ReportCard 
            v-for="(val, key) in summaryMetrics" 
            :key="key" 
            :title="getMetricLabel(key)" 
            :value="formatMetric(key, val)" 
            :icon="getIcon(key)"
            :iconColor="getIconColor(key)"
          />
        </section>

        <transition enter-active-class="transition-all duration-500 ease-out" enter-from-class="opacity-0 translate-y-4" enter-to-class="opacity-100 translate-y-0" mode="out-in">
          
          <div v-if="activeTab === 'geral'" class="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 pb-12">
            <div class="lg:col-span-2 bg-white rounded-3xl md:rounded-[3rem] p-6 md:p-10 shadow-sm border border-gray-100 flex flex-col relative overflow-hidden">
              <h3 class="text-lg md:text-xl font-black flex items-center gap-2 md:gap-3 text-gray-800 mb-8 md:mb-12">
                <Target class="text-brand-green" :size="20" /> {{ performanceTitle }}
              </h3>
              
              <div v-if="revenueData.length === 0" class="flex-grow flex flex-col items-center justify-center text-gray-400">
                <Ghost class="w-12 h-12 mb-3 opacity-30" />
                <p class="text-sm font-bold">Nenhum faturamento registrado.</p>
              </div>
              <div v-else class="flex-grow flex items-end justify-between gap-1.5 md:gap-4 px-1 md:px-4 relative min-h-[250px] md:min-h-[300px]">
                <div v-for="(data, i) in revenueData" :key="i" class="w-full flex flex-col items-center group z-10 h-full justify-end">
                  <div role="img" :aria-label="`Faturamento ${data.label}: R$ ${data.value}`" class="w-full bg-gradient-to-t from-brand-green/10 to-brand-green/40 rounded-t-lg md:rounded-t-[1.25rem] group-hover:from-brand-green group-hover:to-brand-green/80 transition-all duration-700 relative cursor-pointer shadow-inner bar-animation" :style="{ height: getRevenueHeight(data.value) }">
                       <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 md:mb-4 bg-gray-900/95 backdrop-blur-md text-white text-[9px] md:text-[10px] font-black px-3 py-1.5 md:px-4 md:py-2 rounded-xl md:rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap shadow-2xl transform group-hover:-translate-y-2 pointer-events-none">
                         {{ formatCurrency(data.value) }}
                       </div>
                  </div>
                  <span class="mt-3 md:mt-6 text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">{{ data.label }}</span>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-3xl md:rounded-[3rem] p-6 md:p-10 shadow-sm border border-gray-100">
              <h3 class="text-lg md:text-xl font-black text-gray-800 mb-6 md:mb-10">Canais de Venda</h3>
              <div v-if="salesByChannel.length === 0" class="text-center text-gray-400 font-bold text-sm mt-10">Sem vendas no período.</div>
              <div v-else class="space-y-6 md:space-y-8 mt-4">
                <div v-for="channel in salesByChannel" :key="channel.name" class="space-y-2 group">
                  <div class="flex justify-between items-end">
                    <span class="text-[10px] md:text-[11px] font-black text-gray-500 uppercase tracking-widest">{{ channel.name }}</span>
                    <span class="text-base md:text-lg font-black text-gray-900">{{ channel.value }}%</span>
                  </div>
                  <div class="w-full bg-gray-50 h-3 md:h-4 rounded-full p-1 border border-gray-100 shadow-inner">
                    <div :class="channel.color" class="h-full rounded-full transition-all duration-1000 shadow-sm" :style="{ width: isLoaded ? channel.value + '%' : '0%' }"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="activeTab === 'operacional'" class="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 pb-12">
            <div class="bg-white rounded-3xl md:rounded-[3rem] p-6 md:p-10 shadow-sm border border-gray-100 flex flex-col relative overflow-hidden">
              <h3 class="text-lg md:text-xl font-black mb-8 md:mb-12 flex items-center gap-2 md:gap-3 text-gray-800"><Flame class="text-orange-500" /> Fluxo de Pedidos</h3>
              <div v-if="peakHours.length === 0" class="flex-grow flex flex-col items-center justify-center text-gray-400"><Ghost class="w-12 h-12 mb-3 opacity-30" /><p class="text-sm font-bold">Sem fluxo registrado.</p></div>
              <div v-else class="flex-grow flex items-end justify-between gap-1.5 md:gap-3 px-1 md:px-2 relative min-h-[250px] md:min-h-[300px]">
                <div v-for="h in peakHours" :key="h.hora" class="w-full flex flex-col items-center h-full justify-end group">
                  <div class="w-full rounded-t-md md:rounded-t-xl transition-all duration-700 relative cursor-pointer shadow-inner" :class="h.fluxo > 75 ? 'bg-gradient-to-t from-orange-500 to-orange-400' : 'bg-gray-100 group-hover:bg-gray-200'" :style="{ height: isLoaded ? `${h.fluxo}%` : '5%' }"></div>
                  <span class="mt-3 md:mt-6 text-[8px] md:text-[9px] font-black text-gray-400 uppercase">{{ h.hora }}</span>
                </div>
              </div>
            </div>
            <div class="bg-white rounded-3xl md:rounded-[3rem] p-6 md:p-10 shadow-sm border border-gray-100">
              <h3 class="text-lg md:text-xl font-black mb-6 md:mb-10 text-gray-800">Performance Staff</h3>
              <div v-if="topWaiters.length === 0" class="text-center text-gray-400 font-bold text-sm mt-10">Sem equipe ativa.</div>
              <div v-else class="space-y-4 md:space-y-6">
                <div v-for="(waiter, index) in topWaiters" :key="waiter.id" class="flex items-center justify-between p-4 md:p-6 bg-gray-50 rounded-2xl md:rounded-[2rem] hover:bg-white hover:border-gray-100 hover:shadow-xl transition-all duration-500 group border border-transparent">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-black text-base" :class="index === 0 ? 'bg-brand-green text-black' : 'bg-gray-200 text-gray-400'">{{ waiter.name.charAt(0) }}</div>
                    <div>
                      <span class="font-black text-gray-800 block text-sm">{{ waiter.name }}</span>
                      <span class="text-[9px] font-black text-gray-400 uppercase">{{ waiter.orders }} Pedidos</span>
                    </div>
                  </div>
                  <span class="font-black text-gray-900 text-lg">{{ waiter.revenue }}</span>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="activeTab === 'financeiro'" class="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 pb-12">
            <div class="bg-white rounded-3xl md:rounded-[3rem] p-6 md:p-10 shadow-sm border border-gray-100">
              <h3 class="text-lg md:text-xl font-black mb-6 md:mb-10 flex items-center gap-2 md:gap-3 text-gray-800"><CreditCard class="text-blue-500" /> Métodos de Recebimento</h3>
              <div v-if="paymentMethods.length === 0" class="text-center text-gray-400 font-bold text-sm mt-10">Sem métodos usados.</div>
              <div v-else class="space-y-6 md:space-y-8">
                <div v-for="method in paymentMethods" :key="method.name" class="space-y-2 group">
                  <div class="flex justify-between items-end">
                    <span class="text-[10px] md:text-[11px] font-black text-gray-500 uppercase tracking-widest">{{ method.name }}</span>
                    <span class="text-base md:text-lg font-black text-gray-900">{{ method.value }}%</span>
                  </div>
                  <div class="w-full bg-gray-50 h-3 md:h-4 rounded-full p-1 border border-gray-100 shadow-inner">
                    <div :class="method.color" class="h-full rounded-full transition-all duration-1000 shadow-sm" :style="{ width: isLoaded ? method.value + '%' : '0%' }"></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="bg-white rounded-3xl md:rounded-[3rem] p-6 md:p-10 shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden">
              <div>
                <h3 class="text-lg md:text-xl font-black flex items-center gap-2 md:gap-3 text-gray-800 mb-6 md:mb-10"><AlertTriangle class="text-red-500" /> Perdas de Receita</h3>
                <div v-if="cancellations.length === 0" class="text-center text-gray-400 font-bold text-sm mt-10">Nenhum cancelamento!</div>
                <div v-else class="space-y-6 md:space-y-8">
                  <div v-for="item in cancellations" :key="item.motivo" class="space-y-2">
                    <div class="flex justify-between items-end">
                      <span class="text-[10px] md:text-[11px] font-black text-gray-500 uppercase tracking-widest">{{ item.motivo }}</span>
                      <span class="text-xs md:text-sm font-black text-gray-900 uppercase">{{ item.count }} un.</span>
                    </div>
                    <div class="w-full bg-gray-50 h-2 md:h-2.5 rounded-full overflow-hidden shadow-inner border border-gray-100">
                      <div :class="item.color" class="h-full transition-all duration-1000" :style="{ width: isLoaded ? `${(item.count / totalCancellationsCount) * 100}%` : '0%' }"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="mt-8 md:mt-12 p-6 md:p-8 bg-red-50/50 border border-red-100 rounded-2xl md:rounded-[2rem] flex items-start gap-3 md:gap-5 relative group overflow-hidden">
                 <div class="absolute top-0 left-0 w-1 md:w-1.5 h-full bg-red-500"></div>
                 <AlertTriangle class="text-red-500 w-5 h-5 md:w-6 md:h-6 flex-shrink-0 mt-0.5 md:mt-1" />
                 <div class="z-10">
                    <h4 class="text-red-800 font-black text-xs md:text-sm uppercase tracking-widest mb-1 md:mb-2">Impacto Financeiro</h4>
                    <p class="text-red-600/90 text-[11px] md:text-xs font-medium leading-relaxed">Cancelamentos geraram perda de <strong class="font-black text-red-700">{{ financialImpact }}</strong> no período.</p> 
                 </div>
              </div>
            </div>
          </div>

          <div v-else-if="activeTab === 'produtos'" class="pb-12">
            <div class="bg-white rounded-3xl md:rounded-[3rem] p-6 md:p-10 shadow-sm border border-gray-100">
              <h3 class="text-lg md:text-xl font-black mb-8 flex items-center gap-2 md:gap-3 text-gray-800"><PackageOpen class="text-brand-green" /> Desempenho de Produtos</h3>
              <div v-if="topProducts.length === 0" class="text-center text-gray-400 font-bold text-sm py-10"><Ghost class="w-12 h-12 mx-auto mb-3 opacity-30" />Nenhum produto vendido no período.</div>
              <div v-else class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                  <thead>
                    <tr class="border-b-2 border-gray-100">
                      <th class="py-4 text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest">Produto</th>
                      <th class="py-4 text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest">Categoria</th>
                      <th class="py-4 text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest text-center">Vendas</th>
                      <th class="py-4 text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest text-right">Faturamento</th>
                      <th class="py-4 text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest text-center">Participação (%)</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-50">
                    <tr v-for="produto in topProducts" :key="produto.nome" class="hover:bg-gray-50 transition-colors group">
                      <td class="py-5 font-black text-sm md:text-base text-gray-800">{{ produto.nome }}</td>
                      <td class="py-5 text-xs md:text-sm font-bold text-gray-500">{{ produto.categoria }}</td>
                      <td class="py-5 text-center font-black text-gray-900">{{ produto.qtd }}</td>
                      <td class="py-5 text-right font-black text-brand-green">{{ produto.receita }}</td>
                      <td class="py-5 text-center"><span class="bg-gray-100 text-gray-800 px-3 py-1 rounded-lg text-xs font-black">{{ produto.participacao }}</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p class="text-xs text-gray-400 mt-6 font-medium text-center italic">* A participação (%) indica o quanto a venda deste produto representa no faturamento total do período selecionado.</p>
            </div>
          </div>
        </transition>
      </div>
    </main>

    <ReportPrintLayout 
      v-if="!isLoading"
      :restaurantName="restaurantName"
      :performanceTitle="performanceTitle"
      :currentDate="currentDate"
      :metrics="summaryMetrics"
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
    />
  </div>
</template>

<style>
@media print {
  #app > div > header, 
  #app > aside,
  .fixed { display: none !important; }
  #app { padding: 0 !important; margin: 0 !important; }
}
</style>

<style scoped>
.bar-animation { transition: height 1s cubic-bezier(0.34, 1.56, 0.64, 1); }
.custom-scrollbar::-webkit-scrollbar { height: 0px; }
@media (min-width: 768px) { .custom-scrollbar::-webkit-scrollbar { height: 5px; } }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 20px; }
</style>