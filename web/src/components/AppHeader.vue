<script setup>
import { computed, ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { PERMISSIONS } from '@/utils/permissions';
import { getEstablishmentMock, initMockEstablishment } from '@/mock/stablishmentmock'; 

import { 
  LogOut, 
  Menu as MenuIcon, 
  X, 
  ChevronDown, 
  BarChart3,      
  ChefHat,        
  Package,        
  UtensilsCrossed,
  Users,          
  CreditCard,     
  Tag,            
  Palette,        
  Shield,         
  UserCog,
  HamburgerIcon        
} from 'lucide-vue-next';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute(); 

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

const allMenuItems = [
  { 
    label: establishmentName, 
    route: '/app/dashboard', 
    icon: BarChart3,
    permission: PERMISSIONS.RELATORIOS 
  },
  { 
    label: 'Pedidos', 
    route: '/app/kitchen', 
    icon: ChefHat,
    permission: PERMISSIONS.COZINHA 
  },
  { 
    label: 'Estoque', 
    route: '/app/...',
    icon: Package,
    permission: PERMISSIONS.ESTOQUE 
  },
  { 
    label: 'Cardápio', 
    icon: UtensilsCrossed,
    permission: PERMISSIONS.CARDAPIO,
    children: [
      { label: 'Produtos e Categorias', route: '/app/...', icon: Tag }, 
      { label: 'Personalizar Cardápio', route: '/app/settings/menu', icon: Palette }
    ]
  },
  { 
    label: 'Funcionários', 
    icon: Users,
    permission: PERMISSIONS.FUNCIONARIOS,
    children: [
      { label: 'Cargos e Permissões', route: '/app/settings/roles', icon: Shield }, 
      { label: 'Controle de Usuários', route: '/app/settings/users', icon: UserCog }
    ]
  },
  { 
    label: 'Assinatura', 
    route: '/app/...', 
    icon: CreditCard,
    permission: PERMISSIONS.ASSINATURA 
  },
  {
    label: 'Criar Pedido',
    route: '/app/menu', 
    icon:   HamburgerIcon,
    permission: PERMISSIONS.CRIAR_PEDIDO
  }
];

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

onMounted(async () => {
  initMockEstablishment(); 
  try {
    const data = await getEstablishmentMock();
    if (data && data.info) establishmentName.value = data.info.name;
  } catch (error) {
    establishmentName.value = 'Erro ao carregar';
  }
});

const logout = () => {
  authStore.logout();
  router.push('/login');
};

const toggleSidebar = () => isSidebarOpen.value = !isSidebarOpen.value;

const toggleSubmenu = (label) => {
  openMenus.value[label] = !openMenus.value[label];
};

const navigateTo = (path) => {
  if (path) {
    router.push(path);
    isSidebarOpen.value = false;
  }
};
</script>

<template>
  <div>
    <header
      v-if="shouldShowNavbar"
      class="text-white px-4 md:px-6 py-3 flex justify-between items-center fixed top-0 left-0 w-full z-40 shadow-md transition-colors duration-300 h-16"
      :class="headerColorClass"
    >
      <div class="flex items-center gap-4 order-1">
        <button @click="logout" class="hover:bg-white/10 p-2 rounded-lg transition-colors text-white/80 hover:text-white" title="Sair">
          <LogOut :size="20" />
        </button>
        <div class="flex flex-col border-l border-white/20 pl-4">
            <span class="text-sm font-bold leading-tight">{{ userName }}</span>
        </div>
      </div>

      <nav class="hidden md:flex items-center gap-4 order-2">
        <template v-for="(item, index) in visibleMenuItems" :key="item.label">
          <a 
            v-if="index < 4" 
            @click.prevent="item.children ? toggleSidebar() : navigateTo(item.route)"
            class="flex items-center gap-2 text-sm font-medium opacity-70 hover:opacity-100 hover:bg-white/10 px-3 py-1.5 rounded transition-all cursor-pointer"
            :class="{ 'bg-white/10 opacity-100 font-bold': route.path === item.route }"
          >
            <component :is="item.icon" :size="16" />
            {{ item.label }}
            <ChevronDown v-if="item.children" :size="12" class="opacity-50" />
          </a>
        </template>
      </nav>

      <div class="flex items-center gap-4 order-3">
        <h1 class="font-medium text-sm md:text-base opacity-90 hidden sm:block text-right">{{ establishmentName }}</h1>
        <button @click="toggleSidebar" class="p-2 hover:bg-white/10 rounded-lg transition-colors focus:outline-none active:scale-95">
          <MenuIcon :size="28" />
        </button>
      </div>
    </header>

    <div v-if="shouldShowNavbar" class="h-16"></div>

    <div v-if="isSidebarOpen && shouldShowNavbar" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity" @click="toggleSidebar"></div>

    <aside
      class="fixed top-0 right-0 h-full w-72 bg-white text-gray-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col"
      :class="[isSidebarOpen && shouldShowNavbar ? 'translate-x-0' : 'translate-x-full']"
    >
      <div class="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <span class="font-bold text-lg text-gray-700">Navegação</span>
        <button @click="toggleSidebar" class="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50">
          <X :size="24" />
        </button>
      </div>

      <nav class="flex-grow p-3 space-y-1 overflow-y-auto custom-scrollbar select-none">
        
        <div v-for="item in visibleMenuItems" :key="item.label">
          
          <div v-if="item.children">
            <button 
              @click="toggleSubmenu(item.label)"
              class="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group hover:bg-gray-50 text-gray-600"
              :class="{ 'bg-blue-50 text-blue-700': openMenus[item.label] }"
            >
              <div class="flex items-center gap-3">
                <component :is="item.icon" :size="20" :class="openMenus[item.label] ? 'text-blue-600' : 'text-gray-400'" />
                <span class="font-medium">{{ item.label }}</span>
              </div>
              <ChevronDown 
                :size="16" 
                class="transition-transform duration-200"
                :class="openMenus[item.label] ? 'rotate-180 text-blue-500' : 'text-gray-400'"
              />
            </button>

            <div v-show="openMenus[item.label]" class="pl-4 pr-2 py-1 space-y-1 bg-gray-50/50 rounded-b-xl mb-2">
              <a
                v-for="subitem in item.children"
                :key="subitem.label"
                @click.prevent="navigateTo(subitem.route)"
                class="flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer text-sm transition-colors border-l-2"
                :class="route.path === subitem.route 
                  ? 'border-blue-500 text-blue-700 bg-blue-100/50 font-bold' 
                  : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'"
              >
                <component :is="subitem.icon" :size="16" class="opacity-70" />
                {{ subitem.label }}
              </a>
            </div>
          </div>

          <a
            v-else
            @click.prevent="navigateTo(item.route)"
            class="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all group hover:bg-gray-50 border border-transparent"
            :class="route.path === item.route 
              ? 'bg-blue-50 text-blue-700 font-bold border-blue-100' 
              : 'text-gray-600'"
          >
            <component 
              :is="item.icon" 
              :size="20" 
              :class="route.path === item.route ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'" 
            />
            {{ item.label }}
          </a>

        </div>
      </nav>

      <div class="p-4 border-t border-gray-100 bg-gray-50">
         <p class="text-center text-[10px] text-gray-400 uppercase tracking-widest font-bold">
           PedidoFácil
         </p>
      </div>
    </aside>
  </div>
</template>