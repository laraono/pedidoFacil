<script setup>
defineProps({
  title: { type: String, required: true },
  value: { type: [String, Number], required: true },
  icon: { type: [Object, Function], required: true },
  iconColor: { type: String, default: 'text-accent' }
});
</script>

<template>
  <div class="bg-white p-5 md:p-7 rounded md:rounded shadow-sm border border-gray-100 hover:border-accent/40 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 group relative overflow-hidden">
    <div class="flex items-center gap-4 md:gap-5">
      <div class="p-3 md:p-4 bg-gray-50 border border-gray-100 rounded md:rounded group-hover:bg-primary-dark/10 group-hover:border-accent/30 transition-all duration-500 shadow-inner">
        <component :is="icon" class="w-6 h-6 md:w-7 md:h-7 group-hover:scale-110 transition-transform duration-500" :class="iconColor" />
      </div>
      <div>
        <p class="text-[10px] md:text-[11px] font-black text-[#757575] uppercase tracking-widest mb-1">{{ title }}</p>
        <h3 class="text-xl md:text-2xl font-black text-[#212121]">{{ value }}</h3>
      </div>
    </div>
  </div>
</template>