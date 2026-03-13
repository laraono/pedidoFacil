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
        <ShieldAlert :size="16" class="text-brand-green" />
        <span class="text-xs font-black text-brand-green uppercase tracking-widest">Painel Administrativo</span>
      </div>
      <h1 class="text-4xl font-black text-white tracking-tight">
        {{ isAdmin ? `Bem-vindo, ${firstName}!` : `Bem-vindo, ${firstName}!` }}
      </h1>
      <p class="text-gray-400 mt-2 text-lg">
        {{ isAdmin ? 'Gerencie a plataforma PedidoFácil.' : 'O que vamos gerenciar hoje?' }}
      </p>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div
        v-for="card in dashboardCards"
        :key="card.label"
        @click="router.push(card.route)"
        class="group border rounded-[2.5rem] p-8 cursor-pointer transition-all duration-500 relative overflow-hidden flex flex-col justify-between h-64 shadow-2xl"
        :class="isAdmin
          ? 'bg-emerald-950/40 border-brand-green/20 hover:border-brand-green/50'
          : 'bg-dark-card border-white/5 hover:border-brand-green/30'"
      >
        <div
          class="absolute -right-10 -top-10 w-40 h-40 blur-[80px] transition-all group-hover:opacity-150"
          :class="isAdmin ? 'bg-brand-green/8' : 'bg-brand-green/5'"
        ></div>

        <div class="relative z-10">
          <div
            class="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:text-brand-green transition-all duration-500"
            :class="isAdmin ? 'bg-brand-green/10 text-brand-green' : 'bg-white/5 group-hover:bg-brand-green/10'"
          >
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
