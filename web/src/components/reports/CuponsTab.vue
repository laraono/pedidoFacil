<script setup>
import { computed } from 'vue';
import { Tag } from 'lucide-vue-next';
import { EmptyState } from '@/components/ui';

const props = defineProps({
  couponUsage: { type: Array, default: () => [] },
  isLoaded: { type: Boolean, required: true },
});

const maxUses = computed(() => Math.max(...props.couponUsage.map(c => c.uses), 1));
</script>

<template>
  <div class="pb-12">
    <div class="bg-white border border-[#E0E0E0] rounded-2xl p-8 min-h-[400px] flex flex-col shadow-sm">
      <h3 class="text-sm font-black text-[#212121] flex items-center gap-3 mb-12 uppercase tracking-widest">
        <Tag :size="18" class="text-accent" /> Engajamento via Cupons
      </h3>
      <div v-if="couponUsage.length > 0" class="space-y-8">
        <div v-for="coupon in couponUsage" :key="coupon.code" class="space-y-3">
          <div class="flex justify-between items-end">
            <div class="flex items-center gap-3">
              <span class="text-[11px] font-black text-[#212121] uppercase tracking-widest font-mono bg-gray-100 px-3 py-1 rounded border">{{ coupon.code }}</span>
              <span class="text-[10px] font-black text-[#757575] uppercase">
                {{ coupon.type === 'Percentual' ? coupon.discount + '%' : 'R$ ' + coupon.discount }} OFF
              </span>
            </div>
            <span class="text-sm font-black text-accent">{{ coupon.uses }} USOS</span>
          </div>
          <div class="w-full bg-gray-100 h-4 rounded-full overflow-hidden">
            <div class="h-full rounded-full bg-accent shadow-inner transition-all duration-1000"
              :style="{ width: isLoaded ? `${(coupon.uses / maxUses) * 100}%` : '0%' }"></div>
          </div>
        </div>
      </div>
      <EmptyState v-else :icon="Tag" message="Nenhum cupom ativado" />
    </div>
  </div>
</template>
