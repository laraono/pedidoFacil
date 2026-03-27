<script setup>
defineProps({
  title: { type: String, required: true },
  value: { type: [String, Number], required: true },
  icon: { type: [Object, Function], required: true },
  iconColor: { type: String, default: 'text-brand-green' }
});
</script>

<template>
  <div class="bg-white p-5 md:p-7 rounded-2xl md:rounded-[2.5rem] shadow-sm border border-gray-100 hover:border-brand-green/30 hover:shadow-2xl hover:shadow-brand-green/10 transition-all duration-500 group relative overflow-hidden">
    <div class="flex items-center gap-4 md:gap-5">
      <div class="p-3 md:p-4 bg-gray-50 border border-gray-100 rounded-2xl md:rounded-3xl group-hover:bg-brand-green/10 group-hover:border-brand-green/20 transition-all duration-500 shadow-inner">
        <component :is="icon" class="w-6 h-6 md:w-7 md:h-7 group-hover:scale-110 transition-transform duration-500" :class="iconColor" />
      </div>
      <div>
        <p class="text-[10px] md:text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">{{ title }}</p>
        <h3 class="text-xl md:text-2xl font-black text-gray-900">{{ value }}</h3>
      </div>
    </div>
  </div>
</template>