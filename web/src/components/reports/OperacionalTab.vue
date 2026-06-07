<script setup>
import { Clock, Flame, Users, UserCheck } from 'lucide-vue-next';
import { useUtils } from '@/composables/useUtils';
import { EmptyState } from '@/components/ui';

defineProps({
  peakHours: { type: Array, default: () => [] },
  topWaiters: { type: Array, default: () => [] },
  isLoaded: { type: Boolean, required: true },
});

const { formatCurrency } = useUtils();
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
    <div class="bg-white border border-[#E0E0E0] rounded p-8 flex flex-col min-h-[400px] shadow-sm">
      <h3 class="text-sm font-black text-[#212121] flex items-center gap-3 mb-12 uppercase tracking-widest">
        <Flame :size="18" class="text-orange-500" /> Fluxo de Pedidos
      </h3>
      <div v-if="peakHours.length > 0" class="flex-grow flex items-end justify-between gap-2 px-2">
        <div v-for="h in peakHours" :key="h.hora" class="w-full flex flex-col items-center h-full justify-end group">
          <div class="w-full rounded-t-lg transition-all duration-700 bar-animation shadow-sm"
            :class="h.fluxo > 75 ? 'bg-gradient-to-t from-orange-600 to-orange-400' : 'bg-gray-100'"
            :style="{ height: isLoaded ? `${h.fluxo}%` : '5%' }"></div>
          <span class="mt-4 text-[9px] font-black text-[#757575] uppercase">{{ h.hora }}</span>
        </div>
      </div>
      <EmptyState v-else :icon="Clock" message="Sem registros de horário" />
    </div>

    <div class="bg-white border border-[#E0E0E0] rounded p-8 min-h-[400px] flex flex-col shadow-sm">
      <h3 class="text-sm font-black text-[#212121] mb-12 flex items-center gap-3 uppercase tracking-widest">
        <UserCheck :size="18" class="text-accent" /> Performance Staff
      </h3>
      <div v-if="topWaiters.length > 0" class="space-y-5">
        <div v-for="(waiter, index) in topWaiters" :key="waiter.id"
          class="flex items-center justify-between p-5 bg-gray-50 border border-[#E0E0E0] rounded-xl hover:translate-x-2 transition-all cursor-default">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-full flex items-center justify-center font-black text-lg border-2 border-white shadow-sm"
              :class="index === 0 ? 'bg-primary text-white' : 'bg-gray-200 text-[#757575]'">
              {{ waiter.name.charAt(0) }}
            </div>
            <div>
              <span class="font-black text-[#212121] block text-sm">{{ waiter.name }}</span>
              <span class="text-[10px] font-black text-[#757575] uppercase tracking-widest">{{ waiter.orders }} pedidos</span>
            </div>
          </div>
          <span class="font-black text-[#212121] text-lg">{{ formatCurrency(waiter.revenue) }}</span>
        </div>
      </div>
      <EmptyState v-else :icon="Users" message="Sem dados de staff" />
    </div>
  </div>
</template>

<style scoped>
.bar-animation { transition: height 1s cubic-bezier(0.34, 1.56, 0.64, 1); }
</style>
