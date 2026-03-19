<script setup>
import { ref, computed, onMounted } from 'vue';
import localStorageService from '@/services/localStorageService';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { LogOut, User, Menu, ShieldAlert } from 'lucide-vue-next';
import { allMenuItems } from '@/utils/navigation';
import AppSidebar from './AppSidebar.vue';
import imgLogo from '@/assets/logo.png';

const router = useRouter();
const authStore = useAuthStore();

const isSidebarOpen = ref(false);

const establishmentName = ref('');
const establishmentLogo = ref('');

onMounted(() => {
  const data = localStorageService.getOnboarding();
  establishmentName.value = data?.nome_estabelecimento || '';
  establishmentLogo.value = localStorageService.getImage() || '';
});

const roleName = computed(() => authStore.user?.role?.name || '');
const isAdmin = computed(() => authStore.isAdmin);

const visibleMenuItems = computed(() => {
  return allMenuItems.filter(item => {
    if (item.permission && !authStore.hasPermission(item.permission)) {
      return false;
    }
    return true;
  });
});

const logout = () => {
  authStore.logout();
  router.push('/login');
};

const handleNavigation = (path) => {
  isSidebarOpen.value = false;
  router.push(path);
};
</script>

<template>
  <header
    class="h-20 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30 shadow-md print:hidden transition-colors duration-300"
    :class="isAdmin
      ? 'bg-emerald-950/90 border-b border-brand-green/20'
      : 'bg-dark-card border-b border-white/5'"
  >
    <div class="flex items-center gap-3 sm:gap-5">
      <button
        @click="isSidebarOpen = true"
        class="p-2 -ml-2 rounded-xl transition-all active:scale-95"
        :class="isAdmin ? 'text-brand-green/70 hover:text-brand-green hover:bg-brand-green/10' : 'text-gray-400 hover:text-brand-green hover:bg-white/5'"
      >
        <Menu class="w-7 h-7"/>
      </button>

      <div class="flex items-center cursor-pointer hover:opacity-80 transition-opacity" @click="router.push('/app/dashboard')">
        <img :src="imgLogo" alt="PedidoFácil" class="h-9 sm:h-12 object-contain" />
      </div>
    </div>

    <!-- Establishment name + logo -->
    <div v-if="establishmentName" class="hidden md:flex items-center gap-2.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full">
      <div class="w-6 h-6 rounded-lg overflow-hidden bg-white/10 flex items-center justify-center shrink-0">
        <img v-if="establishmentLogo" :src="establishmentLogo" class="w-full h-full object-contain p-0.5" />
        <div v-else class="w-3 h-3 rounded-sm bg-brand-green/40" />
      </div>
      <span class="text-white text-xs font-bold max-w-[120px] truncate">{{ establishmentName }}</span>
    </div>

    <div class="flex items-center gap-3">
      <!-- Admin badge destacado -->
      <div v-if="isAdmin" class="flex items-center gap-2 px-3 py-1.5 bg-brand-green/15 border border-brand-green/40 rounded-full">
        <ShieldAlert class="w-4 h-4 text-brand-green" />
        <span class="text-xs font-black text-brand-green uppercase tracking-[0.15em]">Admin</span>
      </div>

      <!-- User info -->
      <div
        class="hidden sm:flex items-center gap-3 px-4 py-2 rounded-full border"
        :class="isAdmin ? 'bg-brand-green/10 border-brand-green/20' : 'bg-white/5 border-white/10'"
      >
        <User class="w-4 h-4" :class="isAdmin ? 'text-brand-green' : 'text-brand-green'" />
        <div class="flex flex-col leading-none">
          <span class="text-sm font-bold" :class="isAdmin ? 'text-white' : 'text-white'">
            {{ authStore.user?.name || 'Gestor Principal' }}
          </span>
          <span v-if="!isAdmin" class="text-[10px] text-gray-500 font-medium mt-0.5">{{ roleName }}</span>
        </div>
      </div>

      <button
        @click="logout"
        class="p-2.5 rounded-xl transition-all"
        :class="isAdmin ? 'text-brand-green/50 hover:text-red-400 hover:bg-red-400/10' : 'text-gray-400 hover:text-red-400 hover:bg-red-400/10'"
      >
        <LogOut class="w-5 h-5" />
      </button>
    </div>
  </header>

  <AppSidebar
    :isOpen="isSidebarOpen"
    :menuItems="visibleMenuItems"
    :isAdmin="isAdmin"
    @close="isSidebarOpen = false"
    @navigate="handleNavigation"
  />
</template>
