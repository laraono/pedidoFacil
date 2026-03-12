<script setup>
defineProps({
  restaurantName: String,
  performanceTitle: String,
  currentDate: String,
  metrics: Object,
  revenueData: Array,
  getMaxRevenue: Function,
  salesByChannel: Array,
  paymentMethods: Array,
  topWaiters: Array,
  peakHours: Array,
  cancellations: Array,
  totalCancellationsCount: Number,
  financialImpact: String,
  topProducts: Array
});

const formatCurrency = (val) => Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const getMetricLabel = (key) => {
  const labels = { faturamento: 'Faturamento', ticketMedio: 'Ticket Médio', cancelamentos: 'Cancelamentos', giroMesa: 'Giro de Mesa' };
  return labels[key] || key;
};

const formatMetric = (key, val) => {
  if (key === 'faturamento' || key === 'ticketMedio') return formatCurrency(val);
  return val;
};
</script>

<template>
  <div class="hidden print:block w-full mx-auto bg-white text-black font-inter px-2">
    
    <div class="flex justify-between items-end border-b-2 border-gray-900 pb-4 mb-6 mt-2">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200 overflow-hidden shrink-0">
           <img src="https://placehold.co/100x100/10b981/ffffff?text=Logo" alt="Logo" class="w-full h-full object-cover" />
        </div>
        <div>
          <h1 class="text-2xl font-black text-gray-900">Relatório de Gestão</h1>
          <p class="text-gray-500 font-bold uppercase text-[10px] tracking-widest mt-1">{{ restaurantName }}</p>
        </div>
      </div>
      <div class="text-right">
        <p class="text-xs font-black text-gray-900 uppercase tracking-widest">{{ performanceTitle }}</p>
        <p class="text-[9px] text-gray-500 font-bold mt-1">Gerado em: {{ currentDate }}</p>
      </div>
    </div>

    <h2 class="text-sm font-black text-gray-900 uppercase tracking-widest mb-3">Resumo Executivo</h2>
    <div class="grid grid-cols-4 gap-3 mb-6">
      <div v-for="(val, key) in metrics" :key="key" class="border border-gray-300 p-3 rounded-xl bg-gray-50 flex flex-col justify-center overflow-hidden">
        <p class="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1 truncate">{{ getMetricLabel(key) }}</p>
        <h3 class="text-base font-black text-gray-900 truncate">{{ formatMetric(key, val) }}</h3>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-6 mb-6 break-inside-avoid">
       <div class="flex flex-col">
          <h2 class="text-xs font-black text-gray-900 uppercase tracking-widest mb-3">Evolução de Receita</h2>
          <div class="border border-gray-300 rounded-2xl p-4 flex items-end justify-between flex-grow min-h-[160px] gap-1 bg-gray-50">
             <div v-if="revenueData.length === 0" class="w-full text-center text-[10px] text-gray-400 font-bold self-center">Sem dados.</div>
             <div v-else v-for="(data, i) in revenueData" :key="i" class="w-full flex flex-col items-center justify-end h-full min-w-0">
                <span class="text-[6px] font-bold text-gray-700 mb-1 truncate w-full text-center">
                  {{ typeof data.value === 'number' && data.value >= 1000 ? (data.value/1000).toFixed(1)+'k' : data.value }}
                </span>
                <div class="w-full rounded-t-sm" style="background-color: #10b981;" :style="{ height: `${(data.value / getMaxRevenue()) * 100}%`, minHeight: '3px' }"></div>
                <span class="mt-1.5 text-[6px] font-black text-gray-500 uppercase truncate w-full text-center">{{ data.label.substring(0,3) }}</span>
             </div>
          </div>
       </div>

       <div class="grid grid-cols-1 gap-4">
          <div class="border border-gray-300 rounded-2xl p-4 bg-white">
            <h2 class="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-3">Canais de Venda</h2>
            <div v-if="salesByChannel.length === 0" class="text-[9px] text-gray-400 font-bold">Sem vendas registradas.</div>
            <div v-for="channel in salesByChannel" :key="channel.name" class="mb-2.5">
               <div class="flex justify-between items-center text-[9px] mb-1">
                 <span class="text-gray-700 font-bold truncate pr-2">{{ channel.name }}</span>
                 <span class="font-black text-gray-900 shrink-0">{{ channel.value }}%</span>
               </div>
               <div class="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                 <div class="h-full rounded-full" :style="{ width: channel.value + '%', backgroundColor: channel.name.includes('Auto') ? '#3b82f6' : (channel.name.includes('Caixa') ? '#9ca3af' : '#10b981') }"></div>
               </div>
            </div>
          </div>
          
          <div class="border border-gray-300 rounded-2xl p-4 bg-white">
            <h2 class="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-3">Métodos de Recebimento</h2>
            <div v-if="paymentMethods.length === 0" class="text-[9px] text-gray-400 font-bold">Sem pagamentos.</div>
            <div v-for="method in paymentMethods" :key="method.name" class="mb-2.5">
               <div class="flex justify-between items-center text-[9px] mb-1">
                 <span class="text-gray-700 font-bold truncate pr-2">{{ method.name }}</span>
                 <span class="font-black text-gray-900 shrink-0">{{ method.value }}%</span>
               </div>
               <div class="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                 <div class="h-full rounded-full" :style="{ width: method.value + '%', backgroundColor: method.name.includes('Pix') ? '#10b981' : (method.name.includes('Crédito') ? '#3b82f6' : '#818cf8') }"></div>
               </div>
            </div>
          </div>
        </div>
    </div>

    <div class="grid grid-cols-2 gap-6 mb-6 break-inside-avoid">
        <div>
          <h2 class="text-xs font-black text-gray-900 uppercase tracking-widest mb-3">Dados Operacionais</h2>
          <div class="border border-gray-300 rounded-2xl p-4 mb-4 bg-white min-h-[80px]">
            <h3 class="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-3">Top Staff (Vendas)</h3>
            <div v-if="topWaiters.length === 0" class="text-[9px] text-gray-400 font-bold">Sem dados de staff.</div>
            <div v-for="(waiter, index) in topWaiters" :key="waiter.id" class="flex justify-between items-center text-[10px] mb-2 border-b border-gray-100 pb-1.5 last:border-0 last:pb-0">
               <span class="font-bold text-gray-800 truncate pr-2">{{ index + 1 }}. {{ waiter.name }} <span class="text-[8px] text-gray-400 font-normal">({{ waiter.orders }} ped.)</span></span>
               <span class="font-black text-gray-900 shrink-0">{{ waiter.revenue }}</span>
            </div>
          </div>
          
          <div class="border border-gray-300 rounded-2xl p-4 flex items-end justify-between h-[100px] gap-1 bg-gray-50">
             <div v-if="peakHours.length === 0" class="w-full text-center text-[10px] text-gray-400 font-bold self-center">Sem picos de fluxo.</div>
             <div v-else v-for="h in peakHours" :key="h.hora" class="w-full flex flex-col items-center justify-end h-full min-w-0">
                <div class="w-full rounded-t-sm" style="background-color: #f97316;" :style="{ height: `${h.fluxo}%`, minHeight: '3px' }"></div>
                <span class="mt-1.5 text-[6px] font-black text-gray-500 truncate w-full text-center">{{ h.hora }}</span>
             </div>
          </div>
        </div>

        <div>
          <h2 class="text-xs font-black text-gray-900 uppercase tracking-widest mb-3">Auditoria de Perdas</h2>
          <div class="border border-red-200 rounded-2xl p-5 bg-red-50/50 min-h-[195px]">
             <p class="text-[10px] font-black text-red-800 uppercase tracking-widest mb-4 border-b border-red-200 pb-2 truncate">Total Projetado: {{ financialImpact }}</p>
             <div v-if="cancellations.length === 0" class="text-[10px] text-gray-500 font-bold text-center mt-6">Nenhuma perda registrada.</div>
             <div v-for="item in cancellations" :key="item.motivo" class="mb-3">
               <div class="flex justify-between text-[9px] font-bold text-gray-800 mb-1">
                 <span class="truncate pr-2">{{ item.motivo }}</span>
                 <span class="font-black shrink-0">{{ item.count }} un.</span>
               </div>
               <div class="w-full bg-red-200 h-1.5 rounded-full overflow-hidden">
                 <div style="background-color: #ef4444;" class="h-full rounded-full" :style="{ width: `${(item.count / totalCancellationsCount) * 100}%` }"></div>
               </div>
             </div>
          </div>
        </div>
    </div>

    <div class="break-before-page pt-6 pb-8">
         <div class="border-b-2 border-gray-900 pb-2 mb-4">
           <h2 class="text-base font-black text-gray-900 uppercase tracking-widest">Desempenho de Produtos</h2>
           <p class="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1">Detalhamento de vendas, categorias e faturamento por item do cardápio</p>
         </div>

         <div v-if="topProducts.length === 0" class="text-center text-gray-500 font-bold text-sm mt-8">Sem produtos vendidos neste período.</div>
         <table v-else class="w-full text-left border-collapse border border-gray-300 rounded-xl overflow-hidden bg-white mt-4">
            <thead class="bg-gray-100">
              <tr>
                <th class="py-2 px-3 border-b border-gray-300 text-[8px] font-black text-gray-600 uppercase tracking-widest">Produto</th>
                <th class="py-2 px-3 border-b border-gray-300 text-[8px] font-black text-gray-600 uppercase tracking-widest">Categoria</th>
                <th class="py-2 px-3 border-b border-gray-300 text-[8px] font-black text-gray-600 uppercase tracking-widest text-center">Vendas</th>
                <th class="py-2 px-3 border-b border-gray-300 text-[8px] font-black text-gray-600 uppercase tracking-widest text-right">Faturamento</th>
                <th class="py-2 px-3 border-b border-gray-300 text-[8px] font-black text-gray-600 uppercase tracking-widest text-center">Participação (%)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="produto in topProducts" :key="produto.nome">
                <td class="py-2 px-3 border-b border-gray-100 text-[10px] font-bold text-gray-800 truncate max-w-[120px]">{{ produto.nome }}</td>
                <td class="py-2 px-3 border-b border-gray-100 text-[10px] text-gray-500 truncate">{{ produto.categoria }}</td>
                <td class="py-2 px-3 border-b border-gray-100 text-[10px] text-center font-black text-gray-900">{{ produto.qtd }}</td>
                <td class="py-2 px-3 border-b border-gray-100 text-[10px] text-right font-black text-green-600 shrink-0">{{ produto.receita }}</td>
                <td class="py-2 px-3 border-b border-gray-100 text-[10px] text-center"><span class="bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-[9px] font-black">{{ produto.participacao }}</span></td>
              </tr>
            </tbody>
          </table>
      </div>
  </div>
</template>

<style scoped>
@media print {
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
  body { background-color: white !important; }
  @page { size: A4; margin: 10mm 15mm; }
  .break-inside-avoid { break-inside: avoid; page-break-inside: avoid; }
  .break-before-page { page-break-before: always; break-before: page; }
}
</style>