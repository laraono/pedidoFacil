<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { 
  DollarSign, Users, TrendingUp, AlertTriangle, 
  ShoppingBag, BarChart3, UserCheck, Flame, CreditCard,
  Target, Info
} from 'lucide-vue-next';
import { 
  getKpisMock, getRevenueChartMock, getSalesByChannelMock, 
  getPeakHoursMock, getTopWaitersMock, getCancellationsMock, getPaymentMethodsMock
} from '@/mock/reportsmock';

const activeTab = ref('geral');
const dateFilter = ref('7d');
const isLoaded = ref(false); // Gatilho para animações de barras

const kpis = ref({});
const revenueData = ref([]);
const salesByChannel = ref([]);
const peakHours = ref([]);
const topWaiters = ref([]);
const cancellations = ref([]);
const paymentMethods = ref([]);

const loadData = () => {
  isLoaded.value = false;
  kpis.value = getKpisMock(dateFilter.value);
  revenueData.value = getRevenueChartMock(dateFilter.value);
  salesByChannel.value = getSalesByChannelMock(dateFilter.value);
  peakHours.value = getPeakHoursMock(dateFilter.value);
  topWaiters.value = getTopWaitersMock(dateFilter.value);
  cancellations.value = getCancellationsMock(dateFilter.value);
  paymentMethods.value = getPaymentMethodsMock(dateFilter.value);
  
  // Timeout para disparar animação de crescimento das barras
  setTimeout(() => { isLoaded.value = true; }, 50);
};

onMounted(() => loadData());
watch(dateFilter, () => loadData());
watch(activeTab, () => {
  isLoaded.value = false;
  setTimeout(() => { isLoaded.value = true; }, 50);
});

// Helpers Visuais e Cálculos
const getMaxRevenue = () => Math.max(...revenueData.value.map(d => d.value));
const getRevenueHeight = (val) => isLoaded.value ? `${(val / getMaxRevenue()) * 100}%` : '5%';

const totalCancellationsCount = computed(() => cancellations.value.reduce((acc, curr) => acc + curr.count, 0));

const financialImpact = computed(() => {
  const tmStr = kpis.value.ticketMedio || '0';
  const ticketMedio = parseFloat(tmStr.replace('R$', '').replace(/\./g, '').replace(',', '.')) || 85.25;
  const loss = totalCancellationsCount.value * ticketMedio;
  return loss.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
});

// Ícones dinâmicos para KPIs
const getIcon = (key) => {
  if (key === 'faturamento') return DollarSign;
  if (key === 'ticketMedio') return TrendingUp;
  if (key === 'giroMesa') return Users;
  return AlertTriangle;
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 text-gray-900 font-inter p-4 md:p-8 selection:bg-brand-green/30">
    
    <header class="max-w-7xl mx-auto mb-8 md:mb-10">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6 mb-8 md:mb-10">
        <div>
          <h1 class="text-3xl md:text-4xl font-black text-gray-900">Relatórios</h1>
          <p class="text-gray-400 font-bold uppercase text-[9px] md:text-[10px] tracking-[0.2em] mt-1">Inteligência de Dados • Restaurante Exemplo</p>
        </div>
        
        <div class="flex items-center justify-between w-full md:w-auto bg-white border border-gray-200 rounded-2xl p-1.5 shadow-sm">
          <button v-for="opt in [{k:'24h', l:'Hoje'}, {k:'7d', l:'7 dias'}, {k:'30d', l:'30 dias'}]" :key="opt.k"
            @click="dateFilter = opt.k"
            class="flex-1 md:flex-none px-3 py-2 md:px-6 md:py-2.5 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all duration-300 text-center"
            :class="dateFilter === opt.k ? 'bg-brand-green text-black shadow-lg shadow-brand-green/20 scale-100 md:scale-105' : 'text-gray-400 hover:text-gray-800'">
            {{ opt.l }}
          </button>
        </div>
      </div>

      <div class="flex gap-3 md:gap-4 overflow-x-auto pb-4 custom-scrollbar select-none">
        <button v-for="tab in [{id:'geral', n:'Visão Geral', i: BarChart3}, {id:'operacional', n:'Operacional & Salão', i: Users}, {id:'financeiro', n:'Financeiro & Caixa', i: DollarSign}]" 
                :key="tab.id" @click="activeTab = tab.id"
                class="flex items-center gap-2 md:gap-3 px-5 py-3 md:px-8 md:py-4 rounded-2xl md:rounded-[1.5rem] text-xs md:text-sm font-black transition-all duration-500 border-2 whitespace-nowrap"
                :class="activeTab === tab.id ? 'bg-white border-brand-green/30 text-gray-900 shadow-xl shadow-brand-green/5' : 'bg-transparent border-transparent text-gray-400 hover:bg-gray-100'">
          <component :is="tab.i" class="w-4 h-4 md:w-5 md:h-5 transition-colors" :class="activeTab === tab.id ? 'text-brand-green' : 'text-gray-300'" />
          {{ tab.n }}
        </button>
      </div>
    </header>

    <main class="max-w-7xl mx-auto">
      
      <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
        <div v-for="(val, key) in kpis" :key="key" 
             class="bg-white p-5 md:p-7 rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm border border-gray-100 hover:border-brand-green/30 hover:shadow-2xl hover:shadow-brand-green/10 transition-all duration-500 group relative overflow-hidden">
          
          <div class="flex items-center gap-4 md:gap-5">
            <div class="p-3 md:p-4 bg-gray-50 border border-gray-100 rounded-2xl md:rounded-3xl group-hover:bg-brand-green/10 group-hover:border-brand-green/20 transition-all duration-500 shadow-inner">
              <component :is="getIcon(key)" class="w-6 h-6 md:w-7 md:h-7 text-brand-green group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div>
              <p class="text-[10px] md:text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">{{ key.replace(/([A-Z])/g, ' $1').trim() }}</p>
              <h3 class="text-xl md:text-2xl font-black text-gray-900">{{ val }}</h3>
            </div>
          </div>
        </div>
      </section>

      <transition enter-active-class="transition-all duration-500 ease-out" enter-from-class="opacity-0 translate-y-4" enter-to-class="opacity-100 translate-y-0" mode="out-in">
        <div v-if="activeTab === 'geral'" class="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 pb-12">
          
          <div class="lg:col-span-2 bg-white rounded-[1.5rem] md:rounded-[3rem] p-6 md:p-10 shadow-sm border border-gray-100 flex flex-col relative overflow-hidden">
            <div class="flex justify-between items-center mb-8 md:mb-12">
              <h3 class="text-lg md:text-xl font-black flex items-center gap-2 md:gap-3 text-gray-800">
                <Target class="text-brand-green" :size="20" /> Performance Diária
              </h3>
            </div>
            
            <div class="flex-grow flex items-end justify-between gap-1 md:gap-4 px-1 md:px-4 relative min-h-[250px] md:min-h-[300px]">

              <div v-for="(data, i) in revenueData" :key="i" class="w-full flex flex-col items-center group z-10 h-full justify-end">
                <div class="w-full bg-gradient-to-t from-brand-green/10 to-brand-green/40 rounded-t-[0.75rem] md:rounded-t-[1.25rem] group-hover:from-brand-green group-hover:to-brand-green/80 transition-all duration-700 relative cursor-pointer shadow-inner bar-animation"
                     :style="{ height: getRevenueHeight(data.value) }">
                     <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 md:mb-4 bg-gray-900/95 backdrop-blur-md text-white text-[9px] md:text-[10px] font-black px-3 py-1.5 md:px-4 md:py-2 rounded-xl md:rounded-2xl opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-all duration-300 whitespace-nowrap shadow-2xl transform group-hover:-translate-y-2 z-20 pointer-events-none">
                       R$ {{ data.value.toLocaleString('pt-BR') }}
                       <div class="absolute top-full left-1/2 -translate-x-1/2 border-4 md:border-8 border-transparent border-t-gray-900/95"></div>
                     </div>
                </div>
                <span class="mt-3 md:mt-6 text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">{{ data.label }}</span>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-[1.5rem] md:rounded-[3rem] p-6 md:p-10 shadow-sm border border-gray-100">
            <div class="flex justify-between items-start mb-6 md:mb-10">
              <h3 class="text-lg md:text-xl font-black text-gray-800">Canais</h3>
              <Info :size="18" class="text-gray-200 cursor-help hover:text-brand-green transition-colors" />
            </div>
            <div class="space-y-5 md:space-y-8 mt-4">
              <div v-for="channel in salesByChannel" :key="channel.name" class="space-y-2 md:space-y-3 group">
                <div class="flex justify-between items-end">
                  <span class="text-[10px] md:text-[11px] font-black text-gray-500 uppercase tracking-widest group-hover:text-gray-800 transition-colors">{{ channel.name }}</span>
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
          
          <div class="bg-white rounded-[1.5rem] md:rounded-[3rem] p-6 md:p-10 shadow-sm border border-gray-100 flex flex-col relative overflow-hidden">
            <h3 class="text-lg md:text-xl font-black mb-8 md:mb-12 flex items-center gap-2 md:gap-3 text-gray-800"><Flame class="text-orange-500" /> Fluxo de Pedidos</h3>
            
            <div class="flex-grow flex items-end justify-between gap-1 md:gap-3 px-1 md:px-2 relative min-h-[250px] md:min-h-[300px]">
              <div v-for="h in peakHours" :key="h.hora" class="w-full flex flex-col items-center h-full justify-end group">
                <div class="w-full rounded-t-lg md:rounded-t-xl transition-all duration-700 relative cursor-pointer shadow-inner" 
                     :class="h.fluxo > 75 ? 'bg-gradient-to-t from-orange-500 to-orange-400' : 'bg-gray-100 group-hover:bg-gray-200'" 
                     :style="{ height: isLoaded ? `${h.fluxo}%` : '5%' }">
                     <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 md:mb-4 bg-gray-900/95 backdrop-blur-md text-white text-[9px] md:text-[10px] font-black px-3 py-1.5 md:px-4 md:py-2 rounded-xl md:rounded-2xl opacity-0 group-hover:opacity-100 group-active:opacity-100 whitespace-nowrap shadow-2xl pointer-events-none transform group-hover:-translate-y-2 z-20">
                       Pico: {{ h.fluxo }}%
                     </div>
                </div>
                <span class="mt-3 md:mt-6 text-[8px] md:text-[9px] font-black text-gray-400 uppercase">{{ h.hora }}</span>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-[1.5rem] md:rounded-[3rem] p-6 md:p-10 shadow-sm border border-gray-100">
            <h3 class="text-lg md:text-xl font-black mb-6 md:mb-10 text-gray-800">Performance Staff</h3>
            <div class="space-y-4 md:space-y-6">
              <div v-for="(waiter, index) in topWaiters" :key="waiter.id" 
                   class="flex items-center justify-between p-4 md:p-6 bg-gray-50 border border-transparent rounded-2xl md:rounded-[2rem] hover:bg-white hover:border-gray-100 hover:shadow-xl transition-all duration-500 group">
                <div class="flex items-center gap-4 md:gap-5">
                  <div class="w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center font-black text-base md:text-xl shadow-inner transition-all duration-500 group-hover:scale-110"
                       :class="index === 0 ? 'bg-brand-green text-black shadow-brand-green/20' : 'bg-gray-200 text-gray-400'">
                    {{ waiter.name.charAt(0) }}
                  </div>
                  <div>
                    <span class="font-black text-gray-800 block text-sm md:text-base">{{ waiter.name }}</span>
                    <span class="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">{{ waiter.orders }} Pedidos</span>
                  </div>
                </div>
                <span class="font-black text-gray-900 text-base md:text-xl">{{ waiter.revenue }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="activeTab === 'financeiro'" class="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 pb-12">
          
          <div class="bg-white rounded-[1.5rem] md:rounded-[3rem] p-6 md:p-10 shadow-sm border border-gray-100">
            <h3 class="text-lg md:text-xl font-black mb-6 md:mb-10 flex items-center gap-2 md:gap-3 text-gray-800"><CreditCard class="text-blue-500" /> Métodos de Recebimento</h3>
            <div class="space-y-5 md:space-y-8">
              <div v-for="method in paymentMethods" :key="method.name" class="space-y-2 md:space-y-3 group">
                <div class="flex justify-between items-end">
                  <span class="text-[10px] md:text-[11px] font-black text-gray-500 uppercase tracking-widest">{{ method.name }}</span>
                  <span class="text-base md:text-lg font-black text-gray-900">{{ method.value }}%</span>
                </div>
                <div class="w-full bg-gray-50 h-3 md:h-4 rounded-full p-1 border border-gray-100 shadow-inner">
                  <div :class="method.color" class="h-full rounded-full transition-all duration-1000" :style="{ width: isLoaded ? method.value + '%' : '0%' }"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-[1.5rem] md:rounded-[3rem] p-6 md:p-10 shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden">
            <div>
              <div class="flex justify-between items-center mb-6 md:mb-10">
                  <h3 class="text-lg md:text-xl font-black flex items-center gap-2 md:gap-3 text-gray-800">
                    <AlertTriangle class="text-red-500" /> Perdas de Receita
                  </h3>
              </div>
              <div class="space-y-5 md:space-y-8">
                <div v-for="item in cancellations" :key="item.motivo" class="space-y-2 md:space-y-3">
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
            
            <div class="mt-8 md:mt-12 p-5 md:p-8 bg-red-50/50 border border-red-100 rounded-2xl md:rounded-[2rem] flex items-start gap-4 md:gap-5 relative group overflow-hidden">
               <div class="absolute top-0 left-0 w-1 md:w-1.5 h-full bg-red-500"></div>
               <AlertTriangle class="text-red-500 w-5 h-5 md:w-6 md:h-6 flex-shrink-0 mt-0.5 md:mt-1" />
               <div class="z-10">
                  <h4 class="text-red-700 font-bold text-xs md:text-sm mb-1">Impacto Financeiro</h4>
                    <p class="text-red-600/90 text-[11px] md:text-xs font-medium leading-relaxed">
                        Os cancelamentos representaram uma perda aproximada de <strong class="font-black text-red-700">{{ financialImpact }}</strong> no período selecionado.
                    </p> 
               </div>
            </div>
          </div>
        </div>
      </transition>
    </main>
  </div>
</template>

<style scoped>
/* Transição suave para crescimento das barras */
.bar-animation {
  transition: height 1s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.custom-scrollbar::-webkit-scrollbar { height: 4px; }
@media (min-width: 768px) {
  .custom-scrollbar::-webkit-scrollbar { height: 5px; }
}
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 20px; }

/* Micro-interação de pulso suave para picos de calor */
@keyframes pulse-soft {
  0% { opacity: 0.8; }
  50% { opacity: 1; }
  100% { opacity: 0.8; }
}
.bg-orange-500 {
  animation: pulse-soft 2s infinite ease-in-out;
}
</style>