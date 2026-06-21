<script setup>
import { computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { allMenuItems } from '@/utils/navigation';
import { useRouter } from 'vue-router';
import { ChevronRight } from 'lucide-vue-next';

const authStore = useAuthStore();
const router = useRouter();

onMounted(() => {
  if (authStore.isAdmin) router.replace({ name: 'admin-reports' });
});

const dashboardCards = computed(() =>
  allMenuItems
    .filter(item => !item.permission || authStore.hasPermission(item.permission))
    .map(item => ({ ...item, route: item.route || '#' }))
);

const firstName = computed(() => {
  const name = authStore.user?.name || '';
  return name.split(' ')[0] || '';
});
</script>

<template>
  <main class="max-w-7xl mx-auto py-12 px-6">
    <header class="mb-12">
      <h1 class="text-4xl font-black text-[#212121] tracking-tight">
        {{ firstName ? `Bem-vindo, ${firstName}!` : 'Bem-vindo!' }}
      </h1>
      <p class="text-[#757575] mt-2 text-lg">
        {{ 'Escolha uma área abaixo para começar.' }}
      </p>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div
        v-for="card in dashboardCards"
        :key="card.label"
        @click="router.push(card.route)"
        class="group border rounded p-8 cursor-pointer transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-64 bg-primary/15 border-primary/20 hover:border-primary/30 hover:shadow-md hover:bg-primary/25"
      >
        <div class="relative z-10">
          <div class="text-primary w-16 h-16 rounded flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300">
            <component :is="card.icon" :size="60" />
          </div>
          <h2 class="text-2xl font-black text-[#212121] group-hover:text-primary transition-colors">{{ card.label }}</h2>
          <p class="text-[#757575] mt-2 text-sm leading-relaxed line-clamp-2">{{ card.description }}</p>
        </div>

        <div class="relative z-10 flex items-center gap-2 text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-500 text-primary">
          {{ card.callToAction }} <ChevronRight :size="14" />
        </div>
      </div>
    </div>
  </main>
</template>
