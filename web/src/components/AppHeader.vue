<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { LogOut, User, Menu } from 'lucide-vue-next'; 
import { allMenuItems } from '@/utils/navigation';
import AppSidebar from './AppSidebar.vue'; // <-- Importamos o novo componente
import imgLogo from '@/assets/logo.png'; 

const router = useRouter();
const authStore = useAuthStore();

const isSidebarOpen = ref(false);
const openMenus = ref({}); 

const userName = computed(() => authStore.user?.name || '');

const roleName = computed(() => authStore.user?.role?.name || authStore.role?.name || '');
const roleId = computed(() => authStore.user?.role?.id || authStore.role?.id || 0);
const roleCode = computed(() => authStore.user?.role?.role || authStore.role?.role || '');

const establishmentName = ref('Carregando...');

const publicRoutes = ['landing', 'login', 'register', 'OnboardingName', 'OnboardingType']; 

const shouldShowNavbar = computed(() => {
  return authStore.isAuthenticated && route.name && !publicRoutes.includes(route.name);
});

const visibleMenuItems = computed(() => {
  return allMenuItems.filter(item => {
    if (item.permission && !authStore.hasPermission(item.permission)) {
      return false;
    }
    return true;
  });
});

const headerColorClass = computed(() => {
  const role = roleName.value.toLowerCase();
  const code = roleCode.value.toUpperCase();
  const id = roleId.value;

  if (id === 2 || code === 'GERENTE' || role.includes('gerente')) {
    return 'bg-blue-700 border-b border-blue-500'; 
  }

  if (id === 1 || code === 'ADMIN' || role.includes('admin')) {
    return 'bg-black border-b border-gray-800'; 
  }
  
  return 'bg-header-default border-b border-gray-700'; 
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
  <header class="h-20 bg-dark-card border-b border-white/5 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30 shadow-md">
    <div class="flex items-center gap-3 sm:gap-5">
      <button 
        @click="isSidebarOpen = true" 
        class="p-2 -ml-2 text-gray-400 hover:text-brand-green hover:bg-white/5 rounded-xl transition-all active:scale-95"
      >
        <Menu class="w-7 h-7"/>
      </button>

      <div class="flex items-center cursor-pointer hover:opacity-80 transition-opacity" @click="router.push('/app/dashboard')">
        <img :src="imgLogo" alt="PedidoFácil" class="h-9 sm:h-12 object-contain" />
      </div>
    </div>

    <div class="flex items-center gap-4">
      <div class="hidden sm:flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/10">
        <User class="w-4 h-4 text-brand-green" />
        <span class="text-sm font-bold text-white">{{ authStore.user?.name || 'Gestor Principal' }}</span>
      </div>
      
      <button @click="logout" class="p-2.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all">
        <LogOut class="w-5 h-5" />
      </button>
    </div>
  </header>

  <AppSidebar 
    :isOpen="isSidebarOpen" 
    :menuItems="visibleMenuItems" 
    @close="isSidebarOpen = false"
    @navigate="handleNavigation"
  />
</template>