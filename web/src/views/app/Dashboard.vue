<script setup>
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { allMenuItems } from '@/utils/navigation';
import { useRouter } from 'vue-router';
import { ChevronRight } from 'lucide-vue-next';

const authStore = useAuthStore();
const router = useRouter();

const dashboardCards = computed(() => {
  return allMenuItems
    .filter(item => !item.permission || authStore.hasPermission(item.permission))
    .map(item => ({
      ...item,
      route: item.route || (item.children ? item.children[0].route : '#')
    }));
});
</script>

<template>
  <main class="max-w-7xl mx-auto py-12 px-6">
    <header class="mb-12">
      <h1 class="text-4xl font-black text-white tracking-tight">Bem-vinda, Lara!</h1>
      <p class="text-gray-400 mt-2 text-lg">O que vamos gerenciar hoje?</p>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div 
        v-for="card in dashboardCards" 
        :key="card.label"
        @click="router.push(card.route)"
        class="group bg-dark-card border border-white/5 rounded-[2.5rem] p-8 cursor-pointer hover:border-brand-green/30 transition-all duration-500 relative overflow-hidden flex flex-col justify-between h-64 shadow-2xl"
      >
        <div class="absolute -right-10 -top-10 w-40 h-40 bg-brand-green/5 blur-[80px] group-hover:bg-brand-green/10 transition-all"></div>

        <div class="relative z-10">
          <div class="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-brand-green/10 group-hover:text-brand-green transition-all duration-500">
            <component :is="card.icon" :size="32" />
          </div>
          <h2 class="text-2xl font-black text-white group-hover:text-brand-green transition-colors">{{ card.label }}</h2>
          <p class="text-gray-400 mt-2 text-sm leading-relaxed line-clamp-2">{{ card.description }}</p>
        </div>

        <div class="relative z-10 flex items-center gap-2 text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-500 text-brand-green">
          {{ card.callToAction }} <ChevronRight :size="14" />
        </div>
      </div>
    </div>
  </main>
</template>