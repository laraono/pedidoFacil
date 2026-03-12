<template>
  <div class="h-screen bg-black flex flex-col font-inter overflow-hidden text-white">
    
    <header class="h-16 md:h-20 bg-zinc-900 border-b border-white/10 flex items-center justify-between px-6 md:px-8 shadow-2xl z-20 shrink-0">
      <div class="flex items-center gap-4">
        <div class="bg-brand-green p-2 rounded-xl text-black shadow-lg shadow-brand-green/20">
          <Receipt :size="20" class="md:w-6 md:h-6" />
        </div>
        <div>
          <h1 class="text-white font-black text-lg tracking-tight leading-none">Comandas Finalizadas</h1>
          <p class="text-gray-500 text-[10px] uppercase font-black tracking-widest mt-1">Histórico de Transações</p>
        </div>
      </div>
    </header>

    <main class="flex-grow flex flex-col p-4 md:p-8 overflow-hidden bg-black">
      <section class="flex-1 flex flex-col min-w-0 bg-dark-card rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden">
        
        <header class="p-6 md:px-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-white/5 backdrop-blur-md z-10 border-b border-white/5">
          <div class="flex items-center gap-3">
            <div class="w-2 h-6 bg-brand-green rounded-full shadow-[0_0_15px_rgba(0,255,159,0.4)]"></div>
            <h2 class="font-black text-white text-base md:text-lg uppercase tracking-widest">Registros</h2>
            <span class="bg-white/10 text-white font-black px-4 py-1 rounded-full text-xs border border-white/10 ml-2">
              {{ filteredComandas.length }}
            </span>
          </div>

          <div class="flex items-center gap-3 bg-white/5 px-4 py-2.5 rounded-2xl border border-white/10 hover:border-brand-green/40 transition-all group">
            <CalendarDays :size="18" class="text-gray-500 group-hover:text-brand-green transition-colors" />
            <select v-model="timeFilter" class="bg-transparent text-xs font-black uppercase tracking-widest text-gray-300 outline-none cursor-pointer pr-2 appearance-none">
              <option value="1" class="bg-zinc-900 text-white">Últimas 24 horas</option>
              <option value="7" class="bg-zinc-900 text-white">Últimos 7 dias</option>
              <option value="30" class="bg-zinc-900 text-white">Últimos 30 dias</option>
              <option value="all" class="bg-zinc-900 text-white">Todo o período</option>
            </select>
          </div>
        </header>

        <div class="flex-grow p-6 md:p-8 overflow-y-auto custom-scrollbar">
          
          <div v-if="filteredComandas.length === 0" class="flex flex-col items-center justify-center h-full text-gray-600 min-h-[200px]">
            <FileText :size="48" class="mb-4 opacity-20" />
            <p class="font-black uppercase tracking-widest text-sm opacity-40">Nenhum registro encontrado</p>
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <div
              v-for="comanda in filteredComandas"
              :key="comanda.id"
              class="bg-white/5 p-6 rounded-[2rem] border border-white/5 hover:border-white/20 hover:bg-white/[0.07] transition-all group relative overflow-hidden"
            >
              <div class="flex justify-between items-start mb-6">
                <div>
                  <span class="text-gray-500 text-[10px] font-black uppercase tracking-widest block mb-1">Identificador</span>
                  <span class="font-black text-white text-xl tracking-tighter">#{{ comanda.id }}</span>
                </div>
                <div class="text-right">
                  <span class="text-brand-green font-black text-xl tracking-tighter block">
                    {{ formatMoney(comanda.total) }}
                  </span>
                  <span class="text-[8px] font-black uppercase tracking-widest text-brand-green/60">Total Pago</span>
                </div>
              </div>
              
              <div class="flex items-center gap-2 mb-6">
                <div class="p-1.5 bg-brand-green/10 rounded-lg">
                  <CheckCircle :size="14" class="text-brand-green" />
                </div>
                <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  {{ new Date(comanda.closedAt).toLocaleString('pt-BR') }}
                </span>
              </div>
              
              <div class="bg-black/40 p-4 rounded-2xl border border-white/5 mb-4">
                <span class="text-[9px] font-black text-gray-500 uppercase tracking-widest block mb-3 border-b border-white/5 pb-2">Método de Liquidação</span>
                <ul class="space-y-2">
                  <li v-for="p in comanda.paymentDetails?.payments" :key="p.type + p.amount" class="flex justify-between items-center">
                    <span class="text-xs font-bold text-gray-300">{{ p.type }}</span>
                    <span class="font-mono text-sm font-bold text-white">{{ formatMoney(p.amount) }}</span>
                  </li>
                </ul>
              </div>

              <div v-if="comanda.paymentDetails?.discountValue > 0" class="text-[10px] font-bold text-orange-400 flex items-center gap-1">
                <span>Desconto aplicado:</span>
                <span v-if="comanda.paymentDetails.discountType === 'percent'">{{ comanda.paymentDetails.discountValue }}%</span>
                <span v-else>{{ formatMoney(comanda.paymentDetails.discountValue) }}</span>
              </div>

              <div class="absolute -bottom-4 -right-4 w-20 h-20 bg-brand-green/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
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
    return (now - new Date(c.closedAt).getTime()) <= daysInMs;
  });
});

const formatMoney = (val) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
select:focus { border-color: rgba(0, 255, 159, 0.4); }
</style>
