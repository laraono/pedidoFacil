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

import { PERMISSIONS } from '@/utils/permissions';

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
      { path: 'dashboard', component: ManagerDashboard },
      { path: 'settings/establishment', name: 'establishment-settings', component: EstablishmentInfo, meta: { permission: PERMISSIONS.CONFIGURACAO } },
      { path: 'settings/roles', component: RolePermissions, meta: { permission: PERMISSIONS.CONFIGURACAO } },
      { path: 'settings/menu', component: MenuPersonalization, meta: { permission: PERMISSIONS.CONFIGURACAO } },
      { path: '', redirect: 'dashboard' }
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

  next();
});

export default router;
