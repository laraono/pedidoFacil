import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { PERMISSIONS } from '@/utils/permissions';

import LandingPage from '@/views/LandingPage.vue';
import Login from '@/views/Login.vue';
import RegisterManager from '@/views/RegisterManager.vue';

import EstabelecimentoName from '@/views/onboarding/EstabelecimentoName.vue';
import AtendimentoType from '@/views/onboarding/AtendimentoType.vue';

import Header from '@/views/app/Header.vue';

import Dashboard from '@/views/app/Dashboard.vue';
import ManagerReports from '@/views/app/ManagerReports.vue';
import EstablishmentInfo from '@/views/app/settings/EstablishmentInfo.vue';
import RolePermissions from '@/views/app/settings/RolePermissions.vue';
import MenuProducts from '@/views/app/settings/ProductsManagement.vue';
import MenuCategories from '@/views/app/settings/CategoriesManagement.vue';
import Menu from '@/views/app/Menu.vue';
import CreateUsers from '@/views/app/settings/UsersConfig.vue'

import KitchenTerminal from '@/views/app/kitchen/KitchenTerminal.vue';

const routes = [
  { path: '/', name: 'landing', component: LandingPage },
  { path: '/login', name: 'login', component: Login },
  { path: '/forgot-password', name: 'forgot-password', component: () => import('@/views/ForgotPassword.vue') },
  { path: '/reset-password', name: 'reset-password', component: () => import('@/views/ResetPassword.vue') },
  { path: '/register', name: 'register', component: RegisterManager },
  { path: '/onboarding/name', name: 'OnboardingName', component: EstabelecimentoName },
  { path: '/onboarding/type', name: 'OnboardingType', component: AtendimentoType },

  {
    path: '/app',
    component: Header,
    meta: { requiresAuth: true },
    children: [
      { path: 'dashboard', name: 'dashboard', component: Dashboard },
      { path: 'settings/establishment', name: 'establishment-settings', component: EstablishmentInfo, meta: { permission: PERMISSIONS.CONFIGURACAO } },
      { path: 'settings/roles', component: RolePermissions, meta: { permission: PERMISSIONS.CONFIGURACAO } },
      { path: '', redirect: 'dashboard' },
      { path: 'settings/categories', component: MenuCategories, meta: { permission: PERMISSIONS.CONFIGURACAO } },
      { path: 'settings/products', component: MenuProducts, meta: { permission: PERMISSIONS.CONFIGURACAO } },
      { path: 'settings/users', name: 'users-settings', component: CreateUsers, meta: { permission: PERMISSIONS.CONFIGURACAO } },
      { path: '/app/kitchen', name: 'kitchen', component: KitchenTerminal, meta: { requiresAuth: true, permission: PERMISSIONS.COZINHA } },
      { path: 'menu', name: 'Menu', component: Menu, meta: { requiresAuth: true, permission: PERMISSIONS.CRIAR_PEDIDO } },
      { path: 'cashier', name: 'cashier', component: () => import('@/views/app/cashier/Cashier.vue'), meta: { requiresAuth: true, permission: PERMISSIONS.CAIXA } },
      { path: 'closed', name: 'closed', component: () => import('@/views/app/cashier/ClosedComandas.vue'), meta: { requiresAuth: true, permission: PERMISSIONS.COMANDAS_FINALIZADAS } },
      { path: 'reports', name: 'reports', component: ManagerReports, meta: { permission: PERMISSIONS.RELATORIOS } },

      // Subscription (managers with ASSINATURA permission)
      {
        path: 'subscription',
        name: 'subscription',
        component: () => import('@/views/app/subscription/ManagerSubscription.vue'),
        meta: { requiresAuth: true, permission: PERMISSIONS.ASSINATURA }
      },

      // Admin-only routes
      {
        path: 'admin/subscriptions',
        name: 'admin-subscriptions',
        component: () => import('@/views/app/admin/AdminSubscriptions.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'admin/reports',
        name: 'admin-reports',
        component: () => import('@/views/app/admin/AdminReports.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'admin/users',
        name: 'admin-users',
        component: () => import('@/views/app/admin/AdminUsers.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'settings/profile',
        name: 'manager-profile',
        component: () => import('@/views/app/settings/ManagerProfile.vue'),
        meta: { requiresAuth: true }
      },
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach(async (to, _from, next) => {
  const auth = useAuthStore();
  auth.loadSession();

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return next('/login');
  }

  if (to.meta.requiresAdmin && !auth.isAdmin) {
    return next({ name: 'dashboard' });
  }

  if (to.meta.permission && !auth.hasPermission(to.meta.permission)) {
    return next({ name: 'dashboard' });
  }

  next();
});


export default router;
