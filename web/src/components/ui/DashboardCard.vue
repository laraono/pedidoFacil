<script setup>
import { useRouter } from 'vue-router';
import { ArrowRight } from 'lucide-vue-next';

const props = defineProps({
  cardProps: { type: Object, required: true }
});
const router = useRouter();
</script>

<template>
  <div 
    @click="router.push(cardProps.route)"
    class="group bg-dark-card border border-white/5 rounded-[2rem] p-6 sm:p-8 cursor-pointer hover:border-brand-green/50 hover:shadow-[0_0_30px_rgba(0,210,106,0.15)] hover:-translate-y-1 transition-all duration-300 flex flex-col h-full relative overflow-hidden"
  >
    <div class="bg-white/5 p-4 rounded-2xl w-fit mb-6 group-hover:bg-brand-green/10 transition-colors">
      <component :is="cardProps.icon" class="w-8 h-8 text-brand-green" />
    </div>
    
    <h3 class="text-xl sm:text-2xl font-black text-white mb-3">{{ cardProps.name }}</h3>
    <p class="text-gray-400 text-sm sm:text-base leading-relaxed flex-1 mb-8">{{ cardProps.description }}</p>
    
    <div class="flex items-center gap-2 text-brand-green font-bold text-sm sm:text-base mt-auto group-hover:translate-x-2 transition-transform">
      {{ cardProps.callToAction || 'Acessar módulo' }}
      <ArrowRight class="w-4 h-4" />
    </div>
  </div>
</template>