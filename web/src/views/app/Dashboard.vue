<script setup>
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { allMenuItems, adminMenuItems } from '@/utils/navigation';
import { useRouter } from 'vue-router';
import { ChevronRight, ShieldAlert } from 'lucide-vue-next';

const authStore = useAuthStore();
const router = useRouter();

const isAdmin = computed(() => authStore.isAdmin);

const dashboardCards = computed(() => {
  if (isAdmin.value) return adminMenuItems;
  return allMenuItems
    .filter(item => !item.permission || authStore.hasPermission(item.permission))
    .map(item => ({ ...item, route: item.route || '#' }));
});

const firstName = computed(() => {
  const name = authStore.user?.name || '';
  return name ? name.split(' ')[0] : 'Admin';
});
</script>

<template>
  <main class="max-w-7xl mx-auto py-12 px-6">
    <header class="mb-12">
      <div v-if="isAdmin" class="flex items-center gap-2 mb-2">
        <ShieldAlert :size="16" class="text-accent" />
        <span class="text-xs font-black text-accent uppercase tracking-widest">Painel Administrativo</span>
      </div>
      <h1 class="text-4xl font-black text-[#212121] tracking-tight">
        {{ isAdmin ? `Bem-vindo, ${firstName}!` : `Bem-vindo, ${firstName}!` }}
      </h1>
      <p class="text-[#757575] mt-2 text-lg">
        {{ isAdmin ? 'Gerencie a plataforma PedidoFácil.' : 'O que vamos gerenciar hoje?' }}
      </p>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div
        v-for="card in dashboardCards"
        :key="card.label"
        @click="router.push(card.route)"
        class="group border rounded p-8 cursor-pointer transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-64"
        :class="isAdmin
          ? 'bg-emerald-950/40 border-accent/30 hover:border-accent/60 hover:shadow-lg'
          : 'bg-primary/15 border-primary/20 hover:border-primary/30 hover:shadow-md hover:bg-primary/25'"
      >
        <div class="relative z-10">
          <div
            class="w-16 h-16 rounded flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300"
            :class="isAdmin ? 'bg-accent-light text-accent' : 'text-primary'"
          >
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
