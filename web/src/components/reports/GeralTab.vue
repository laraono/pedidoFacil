<script setup>
import { computed } from 'vue';
import { BarChart3, PackageOpen, Target } from 'lucide-vue-next';
import { EmptyState } from '@/components/ui';

const props = defineProps({
  revenueData: { type: Array, default: () => [] },
  salesByChannel: { type: Array, default: () => [] },
  performanceTitle: { type: String, required: true },
  isLoaded: { type: Boolean, required: true },
});

const maxRevenue = computed(() => {
  const max = Math.max(...props.revenueData.map(d => d.value), 0);
  return max <= 0 ? 1 : max;
});

const revenueHeight = (val) => props.isLoaded ? `${(val / maxRevenue.value) * 100}%` : '5%';

const channelColorMap = {
  'Auto-atendimento': 'bg-blue-400',
  'Caixa': 'bg-gray-400',
};
const channelColor = (name) => channelColorMap[name] || 'bg-brand-green';
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12">
    <div class="lg:col-span-2 bg-white border border-[#E0E0E0] rounded p-8 flex flex-col min-h-[400px] shadow-sm">
      <h3 class="text-sm font-black text-[#212121] flex items-center gap-3 mb-12 uppercase tracking-widest">
        <Target :size="18" class="text-accent" /> {{ performanceTitle }}
      </h3>
      <div v-if="revenueData.length > 0" class="flex-grow flex items-end justify-between gap-3 px-2 relative min-h-[200px]">
        <div v-for="(data, i) in revenueData" :key="i" class="w-full flex flex-col items-center group h-full justify-end">
          <div class="w-full bg-gradient-to-t from-brand-green/10 to-brand-green/40 rounded-t-xl group-hover:from-brand-green/40 group-hover:to-brand-green/70 transition-all duration-700 relative cursor-pointer bar-animation shadow-sm"
            :style="{ height: revenueHeight(data.value) }">
            <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-[#212121] text-white text-[10px] font-black px-3 py-2 rounded opacity-0 group-hover:opacity-100 transition-all shadow-xl whitespace-nowrap z-30">
              R$ {{ data.value.toLocaleString('pt-BR') }}
            </div>
          </div>
          <span class="mt-4 text-[9px] font-black text-[#757575] uppercase tracking-widest">{{ data.label }}</span>
        </div>
      </div>
      <EmptyState v-else :icon="BarChart3" message="Sem dados no período" />
    </div>

    <div class="bg-white border border-[#E0E0E0] rounded p-8 min-h-[400px] flex flex-col shadow-sm">
      <h3 class="text-sm font-black text-[#212121] mb-12 uppercase tracking-widest">Canais de Venda</h3>
      <div v-if="salesByChannel.length > 0" class="space-y-8 flex-grow">
        <div v-for="channel in salesByChannel" :key="channel.name" class="space-y-3">
          <div class="flex justify-between items-end">
            <span class="text-[10px] font-black text-[#757575] uppercase tracking-widest">{{ channel.name }}</span>
            <span class="text-sm font-black text-[#212121]">{{ channel.value }}%</span>
          </div>
          <div class="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
            <div :class="channelColor(channel.name)" class="h-full transition-all duration-1000 shadow-inner"
              :style="{ width: isLoaded ? channel.value + '%' : '0%' }"></div>
          </div>
        </div>
      </div>
      <EmptyState v-else :icon="PackageOpen" message="Nenhuma venda" />
    </div>
  </div>
</template>

<style scoped>
.bar-animation { transition: height 1s cubic-bezier(0.34, 1.56, 0.64, 1); }
</style>
