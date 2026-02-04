<script setup>
import { ref, computed } from 'vue';
import { useRouter, RouterView } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

import {
  Menu,
  ArrowLeft,
  Settings,
  Briefcase,
  Utensils,
  LayoutList,
  Users,
  DollarSign,
  ChevronRight,
  ChevronDown,
  X
} from 'lucide-vue-next';

const authStore = useAuthStore();
const router = useRouter();

const isDrawerOpen = ref(false);
const activeDropdown = ref(null);

const userName = computed(() => {
  return authStore.user?.name || authStore.user?.nome || 'Gerente';
});

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};

const menuItems = [
  { name: 'Relatórios', icon: LayoutList, route: '/app/dashboard/reports' },
  { name: 'Pedidos', icon: Utensils, route: '/app/orders/queue' },
  {
    name: 'Estoque',
    icon: Briefcase,
    dropdown: [
      { name: 'Controle de Estoque', route: '/app/inventory/control' },
      { name: 'Histórico de Estoque', route: '/app/inventory/history' }
    ]
  },
  {
    name: 'Cardápio',
    icon: Menu,
    dropdown: [
      { name: 'Produtos', route: '/app/settings/menu' },
      { name: 'Categorias', route: '/app/settings/menu/categories' },
      { name: 'Cupons', route: '/app/settings/menu/coupons' }
    ]
  },
  {
    name: 'Funcionários',
    icon: Users,
    dropdown: [
      { name: 'Usuários', route: '/app/employees/users' },
      { name: 'Cargos e Permissões', route: '/app/settings/roles' }
    ]
  },
  {
    name: 'Configurações',
    icon: Settings,
    dropdown: [
      { name: 'Informações Gerais', route: '/app/settings/establishment' },
      { name: 'Personalização', route: '/app/settings/menu' },
      { name: 'Atendimento', route: '/app/settings/service' },
      { name: 'Pagamento', route: '/app/settings/payment' }
    ]
  },
  {
    name: 'Assinatura',
    icon: DollarSign,
    route: '/app/subscription'
  }
];

const toggleDropdown = (name) => {
  activeDropdown.value = activeDropdown.value === name ? null : name;
};

const handleNavigation = (route) => {
  if (route) {
    router.push(route);
    isDrawerOpen.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-100 font-inter">

    <header class="bg-blue-600 shadow-md text-white z-30 relative">
      <div class="flex items-center justify-between px-6 py-4">

        <div class="flex items-center gap-3">
          <button
            @click="handleLogout"
            title="Sair"
            class="p-2 rounded hover:bg-blue-700 transition"
          >
            <ArrowLeft :size="22" />
          </button>
          <h1 class="text-lg font-bold">{{ userName }}</h1>
        </div>

        <nav class="hidden lg:flex gap-6 text-sm font-semibold">
          <router-link to="/app/dashboard/reports" class="hover:underline">Relatórios</router-link>
          <router-link to="/app/orders/queue" class="hover:underline">Pedidos</router-link>
          <router-link to="/app/inventory/control" class="hover:underline">Estoque</router-link>
          <router-link to="/app/settings/establishment" class="hover:underline">Configurações</router-link>
        </nav>

        <button
          @click="isDrawerOpen = true"
          class="lg:hidden p-2 rounded hover:bg-blue-700"
        >
          <Menu :size="22" />
        </button>

      </div>
    </header>

    <main>
      <RouterView />
    </main>

    <div
      v-if="isDrawerOpen"
      class="fixed inset-0 z-40"
      @click.self="isDrawerOpen = false"
    >
      <div class="absolute inset-0 bg-black/50"></div>

      <aside class="absolute right-0 top-0 h-full w-64 bg-gray-900 text-white p-4 overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-bold text-blue-400">Menu</h2>
          <button @click="isDrawerOpen = false">
            <X :size="20" />
          </button>
        </div>

        <nav class="space-y-2">
          <div v-for="item in menuItems" :key="item.name">
            
            <div
              v-if="item.dropdown"
              @click="toggleDropdown(item.name)"
              class="flex justify-between items-center p-2 rounded hover:bg-gray-800 cursor-pointer"
            >
              <span class="flex items-center gap-2">
                <component :is="item.icon" :size="18" />
                {{ item.name }}
              </span>
              <component
                :is="activeDropdown === item.name ? ChevronDown : ChevronRight"
                :size="16"
              />
            </div>

            <div
              v-if="item.dropdown && activeDropdown === item.name"
              class="ml-6 mt-1 space-y-1"
            >
              <div
                v-for="sub in item.dropdown"
                :key="sub.name"
                @click="handleNavigation(sub.route)"
                class="p-2 text-sm rounded hover:bg-gray-700 cursor-pointer"
              >
                {{ sub.name }}
              </div>
            </div>

            <div
              v-else
              @click="handleNavigation(item.route)"
              class="flex items-center gap-2 p-2 rounded hover:bg-gray-800 cursor-pointer"
            >
              <component :is="item.icon" :size="18" />
              {{ item.name }}
            </div>

          </div>
        </nav>
      </aside>
    </div>

  </div>
</template>