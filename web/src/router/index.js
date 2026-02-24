import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { PERMISSIONS } from '@/utils/permissions';

import LandingPage from '@/views/LandingPage.vue'; 
import Login from '@/views/Login.vue';
import RegisterManager from '@/views/RegisterManager.vue';

import EstabelecimentoName from '@/views/onboarding/EstabelecimentoName.vue'; 
import AtendimentoType from '@/views/onboarding/AtendimentoType.vue';

import ManagerLayout from '@/views/app/ManagerLayout.vue';

import ManagerDashboard from '@/views/app/ManagerDashboard.vue';
import EstablishmentInfo from '@/views/app/settings/EstablishmentInfo.vue';
import RolePermissions from '@/views/app/settings/RolePermissions.vue';
import MenuPersonalization from '@/views/app/settings/MenuPersonalization.vue';
import MenuProducts from '@/views/app/settings/ProductsManagement.vue';
import MenuCategories from '@/views/app/settings/CategoriesManagement.vue';
import CreateUsers from '@/views/app/settings/UsersConfig.vue'

import KitchenTerminal from '@/views/app/kitchen/KitchenTerminal.vue'; 

const routes = [
  { path: '/', name: 'landing', component: LandingPage },
  { path: '/login', name: 'login', component: Login },
  { path: '/register', name: 'register', component: RegisterManager },
  { path: '/onboarding/name', name: 'OnboardingName', component: EstabelecimentoName },
  { path: '/onboarding/type', name: 'OnboardingType', component: AtendimentoType }, 

  {
    path: '/app',
    component: ManagerLayout,
    meta: { requiresAuth: true },
    children: [
      { path: 'dashboard', name: 'dashboard', component: ManagerDashboard },
      { path: 'settings/establishment', name: 'establishment-settings', component: EstablishmentInfo, meta: { permission: PERMISSIONS.CONFIGURACAO } },
      { path: 'settings/roles', component: RolePermissions, meta: { permission: PERMISSIONS.CONFIGURACAO } },
      { path: 'settings/menu', component: MenuPersonalization, meta: { permission: PERMISSIONS.CONFIGURACAO } },
      { path: '', redirect: 'dashboard'},
      { path: 'settings/categories', component: MenuCategories, meta: { permission: PERMISSIONS.CONFIGURACAO }},
      { path: 'settings/products', component: MenuProducts, meta: { permission: PERMISSIONS.CONFIGURACAO }},
      { path: 'settings/users', name: 'users-settings', component: CreateUsers, meta: { permission: PERMISSIONS.CONFIGURACAO } },
      { path: '/app/kitchen', name: 'kitchen', component: KitchenTerminal, meta: { requiresAuth: true, permission: PERMISSIONS.COZINHA } },
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore();
  auth.loadSession();

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return next('/login');
  }

  if (to.meta.permission && !auth.hasPermission(to.meta.permission)) {
    return next('/app/dashboard');
  }

  next();
});

export default router;
