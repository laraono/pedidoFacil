import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

import LandingPage from '@/views/LandingPage.vue';
import Planos from '@/views/Planos.vue';
import RegisterManager from '@/views/RegisterManager.vue';
import Login from '@/views/Login.vue';

import ManagerLayout from '@/views/app/ManagerLayout.vue';

import EstabelecimentoName from '@/views/onboarding/EstabelecimentoName.vue'; 
import AtendimentoType from '@/views/onboarding/AtendimentoType.vue';

import ManagerDashboard from '@/views/app/ManagerDashboard.vue';
import EstablishmentInfo from '@/views/app/settings/EstablishmentInfo.vue';
import RolePermissions from '@/views/app/settings/RolePermissions.vue';
import MenuPersonalization from '@/views/app/settings/MenuPersonalization.vue';

const routes = [
  { path: '/', component: LandingPage },
  { path: '/planos', component: Planos },
  { path: '/login', component: Login },
  { path: '/register', component: RegisterManager },
  { path: '/onboarding/name', name: 'OnboardingName', component: EstabelecimentoName },
  { path: '/onboarding/type', name: 'OnboardingType', component: AtendimentoType }, 

  {
    path: '/app',
    component: ManagerLayout,
    meta: { requiresAuth: true },
    children: [
      { 
        path: 'dashboard', 
        name: 'Dashboard', 
        component: ManagerDashboard, 
      },
      { 
        path: 'settings/establishment', 
        name: 'EstablishmentInfo', 
        component: EstablishmentInfo, 
      },
      {
        path: 'settings',
        redirect: 'settings/establishment'
      },
      { 
        path: 'settings/roles', 
        name: 'RolePermissions', 
        component: RolePermissions, 
      },
      { 
        path: 'settings/menu', 
        name: 'MenuPersonalization', 
        component: MenuPersonalization, 
      },
      { 
        path: 'orders/queue', 
        name: 'OrderQueue', 
        component: { template: '<main class="max-w-7xl mx-auto py-12 px-4"><h1 class="text-3xl font-bold text-gray-800">Fila de Pedidos</h1></main>' }, 
      },
      { path: '', redirect: 'dashboard' } 
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const auth = useAuthStore();
  const requiresAuth = to.matched.some(r => r.meta.requiresAuth);

  if (requiresAuth && !auth.isAuthenticated) {
    next('/login');
  } 
  else if (
    auth.isAuthenticated &&
    (to.path === '/login' || to.path === '/register')
  ) {
    next('/app/dashboard');
  } 
  else {
    next();
  }
});

export default router;