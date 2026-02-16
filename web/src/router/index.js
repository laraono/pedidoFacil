import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { PERMISSIONS } from '@/utils/permissions';

// Views Públicas
import LandingPage from '@/views/LandingPage.vue'; 
import Login from '@/views/Login.vue';
import RegisterManager from '@/views/RegisterManager.vue';

// Views de Onboarding
import EstabelecimentoName from '@/views/onboarding/EstabelecimentoName.vue'; 
import AtendimentoType from '@/views/onboarding/AtendimentoType.vue';

// Layout Principal
import ManagerLayout from '@/views/app/ManagerLayout.vue';

// Views do Painel
import ManagerDashboard from '@/views/app/ManagerDashboard.vue';
import EstablishmentInfo from '@/views/app/settings/EstablishmentInfo.vue';
import RolePermissions from '@/views/app/settings/RolePermissions.vue';
import MenuPersonalization from '@/views/app/settings/MenuPersonalization.vue';

// --- SUA PARTE: Import da Cozinha ---
import KitchenTerminal from '@/views/app/kitchen/KitchenTerminal.vue'; 

const routes = [
  // Rotas Públicas (Mantidas como seu amigo fez)
  { path: '/', name: 'landing', component: LandingPage },
  { path: '/login', name: 'login', component: Login },
  { path: '/register', name: 'register', component: RegisterManager },

  // Rotas de Onboarding
  { path: '/onboarding/name', name: 'OnboardingName', component: EstabelecimentoName },
  { path: '/onboarding/type', name: 'OnboardingType', component: AtendimentoType }, 

  // Rotas de Cozinha
  {
    path: '/app/kitchen',
    name: 'kitchen', 
    component: KitchenTerminal,
    meta: { 
      requiresAuth: true,
      permission: PERMISSIONS.COZINHA 
    }
  },

  // Rotas do Sistema (Gerente)
  {
    path: '/app',
    component: ManagerLayout,
    meta: { requiresAuth: true },
    children: [
      { path: 'dashboard', name: 'dashboard', component: ManagerDashboard },
      { path: 'settings/establishment', name: 'establishment-settings', component: EstablishmentInfo, meta: { permission: PERMISSIONS.CONFIGURACAO } },
      { path: 'settings/roles', name: 'roles-settings', component: RolePermissions, meta: { permission: PERMISSIONS.CONFIGURACAO } },
      { path: 'settings/menu', name: 'menu-settings', component: MenuPersonalization, meta: { permission: PERMISSIONS.CONFIGURACAO } },
      { path: '', redirect: { name: 'dashboard' } }
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