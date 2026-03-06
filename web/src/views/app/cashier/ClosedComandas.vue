<template>
  <div class="h-screen bg-gray-50 flex flex-col font-inter overflow-hidden">
    
    <header class="h-16 md:h-20 bg-header-kitchen border-b border-black/20 flex items-center justify-between px-4 md:px-8 shadow-md z-20 shrink-0 bg-slate-900">
      <div class="flex items-center gap-3 md:gap-4">
        <div class="bg-brand-green p-1.5 md:p-2 rounded-xl text-black shadow-lg shadow-brand-green/30">
             <Receipt :size="20" class="md:w-6 md:h-6" />
        </div>
        <h1 class="text-white/90 font-bold text-lg hidden sm:block">Comandas Finalizadas</h1>
      </div>
    </header>

    <main class="flex-grow flex flex-col p-4 md:p-6 overflow-hidden pb-6">
      <section class="flex-1 flex flex-col min-w-0 bg-gray-100/50 rounded-2xl md:rounded-[2rem] border border-gray-200/60 shadow-inner overflow-hidden">
        
        <header class="p-4 md:p-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-gray-100/50 backdrop-blur-sm z-10 border-b border-gray-200/50">
          <div class="flex items-center gap-3">
             <div class="w-2 md:w-3 h-6 md:h-8 bg-green-500 rounded-full"></div>
             <h2 class="font-extrabold text-gray-700 text-base md:text-lg uppercase tracking-wide">Histórico</h2>
             <span class="bg-green-500 text-white font-bold px-3 py-1 rounded-full text-sm shadow-sm shadow-green-200 ml-1">
                {{ filteredComandas.length }}
             </span>
          </div>

          <div class="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-gray-200 shadow-sm hover:border-green-300 transition-colors">
             <CalendarDays :size="18" class="text-gray-500" />
             <select v-model="timeFilter" class="bg-transparent text-sm font-bold text-gray-700 outline-none cursor-pointer pr-2">
                <option value="1">Últimas 24 horas</option>
                <option value="7">Últimos 7 dias</option>
                <option value="30">Últimos 30 dias</option>
                <option value="all">Todo o período</option>
             </select>
          </div>
        </header>

        <div class="flex-grow p-4 md:p-6 overflow-y-auto custom-scrollbar">
          
          <div v-if="filteredComandas.length === 0" class="flex flex-col items-center justify-center h-full text-gray-400 opacity-60 min-h-[200px]">
             <FileText :size="48" class="mb-2" />
             <p class="font-medium text-center">Nenhuma comanda finalizada neste período.</p>
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            <div v-for="comanda in filteredComandas" :key="comanda.id" class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col gap-3">
              
              <div class="flex justify-between items-center border-b border-gray-100 pb-3">
                <span class="font-extrabold text-gray-800 text-lg">Comanda #{{ comanda.id }}</span>
                <span class="text-green-600 font-bold bg-green-50 px-3 py-1 rounded-lg">
                  R$ {{ comanda.total.toFixed(2) }}
                </span>
              </div>
              
              <div class="text-sm text-gray-500 flex items-center gap-2">
                <CheckCircle :size="16" class="text-green-500" />
                Fechada em: {{ new Date(comanda.closedAt).toLocaleString('pt-BR') }}
              </div>
              
              <div class="text-sm mt-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <span class="font-semibold text-gray-700 block mb-2">Detalhes do Pagamento:</span>
                <ul class="space-y-1">
                  <li v-for="p in comanda.paymentDetails?.payments" :key="p.type" class="flex justify-between text-gray-600">
                    <span>{{ p.type }}</span>
                    <span class="font-medium text-gray-800">R$ {{ p.amount.toFixed(2) }}</span>
                  </li>
                </ul>
              </div>

            </div>
          </div>

        </div>
      </section>
    </main>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useClosedComandaStore } from '@/stores/closedComandas';
import { Receipt, FileText, CheckCircle, CalendarDays } from 'lucide-vue-next';

const closedComandaStore = useClosedComandaStore();
const closedComandas = closedComandaStore.closedComandas;

const timeFilter = ref('1');

const filteredComandas = computed(() => {
  if (timeFilter.value === 'all') return closedComandas;

  const now = new Date().getTime();
  const daysInMs = parseInt(timeFilter.value) * 24 * 60 * 60 * 1000;

  return closedComandas.filter(c => {
    if (!c.closedAt) return false; 
    
    const closedTime = new Date(c.closedAt).getTime();
    return (now - closedTime) <= daysInMs;
  });
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
</style>