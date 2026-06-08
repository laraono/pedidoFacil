<script setup>
  import { computed } from "vue";
  import { AlertTriangle } from "lucide-vue-next";

  const props = defineProps({
    items: { type: Array, required: true },
    isDelayed: { type: Boolean, default: false },
    isReady: { type: Boolean, default: false },
  });

  const groupedItems = computed(() => {
    const groups = [];
    props.items.forEach((item) => {
      const obs = (item.obs || item.observation || "").trim();
      const variation = (item.variationName || "").trim();
      const existing = groups.find(
        (g) =>
          g.name === item.name &&
          (g.variationName || "").trim() === variation &&
          (g.obs || g.observation || "").trim() === obs,
      );
      const qty = Number(item.amount) || Number(item.quantity) || 1;
      if (existing) existing.amount += qty;
      else groups.push({ ...item, amount: qty });
    });
    return groups;
  });
</script>

<template>
  <div class="p-5 space-y-4">
    <div
      v-for="(item, index) in groupedItems"
      :key="index"
      class="flex flex-col border-b border-[#E0E0E0] pb-3 last:border-0 last:pb-0"
    >
      <div class="flex items-start gap-4">
        <span
          class="font-black text-2xl min-w-[35px] transition-colors"
          :class="isDelayed && !isReady ? 'text-red-500' : 'text-accent'"
        >
          {{ item.amount }}x
        </span>
        <div class="flex flex-col gap-1 pt-0.5">
          <span
            class="font-black text-lg text-[#212121] uppercase tracking-tight leading-none"
            >{{ item.name }}</span
          >
          <span
            v-if="item.variationName"
            class="inline-block self-start px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-600 text-[11px] font-black uppercase tracking-wide"
          >
            {{ item.variationName }}
          </span>
        </div>
      </div>
      <div
        v-if="item.obs || item.observation"
        class="ml-12 mt-2 p-3 rounded bg-amber-50 border border-amber-200 flex items-center gap-2"
      >
        <AlertTriangle :size="14" class="text-amber-500" />
        <p
          class="text-[11px] font-black text-amber-700 uppercase tracking-wider italic"
        >
          {{ item.obs || item.observation }}
        </p>
      </div>
    </div>
  </div>
</template>
