import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { PERMISSIONS } from "@/utils/permissions";

import LandingPage from "@/views/LandingPage.vue";
import Login from "@/views/Login.vue";
import RegisterManager from "@/views/RegisterManager.vue";

import EstablishmentName from "@/views/onboarding/EstablishmentName.vue";
import ServiceType from "@/views/onboarding/ServiceType.vue";

import Header from "@/views/app/Header.vue";

import Dashboard from "@/views/app/Dashboard.vue";
import ManagerReports from "@/views/app/ManagerReports.vue";
import EstablishmentInfo from "@/views/app/settings/EstablishmentInfo.vue";
import RolePermissions from "@/views/app/settings/RolePermissions.vue";
import MenuProducts from "@/views/app/settings/ProductsManagement.vue";
import MenuCategories from "@/views/app/settings/CategoriesManagement.vue";
import Menu from "@/views/app/Menu.vue";
import CreateUsers from "@/views/app/settings/UsersConfig.vue";

import KitchenTerminal from "@/views/app/kitchen/KitchenTerminal.vue";

const routes = [
  { path: "/", name: "landing", component: LandingPage },
  { path: "/login", name: "login", component: Login },
  {
    path: "/forgot-password",
    name: "forgot-password",
    component: () => import("@/views/ForgotPassword.vue"),
  },
  {
    path: "/reset-password",
    name: "reset-password",
    component: () => import("@/views/ResetPassword.vue"),
  },
  { path: "/register", name: "register", component: RegisterManager },
  {
    path: "/onboarding/name",
    name: "OnboardingName",
    component: EstablishmentName,
  },
  { path: "/onboarding/type", name: "OnboardingType", component: ServiceType },

  {
    path: "/app",
    component: Header,
    meta: { requiresAuth: true },
    children: [
      { path: "dashboard", name: "dashboard", component: Dashboard },
      {
        path: "settings/establishment",
        name: "establishment-settings",
        component: EstablishmentInfo,
        meta: { permission: PERMISSIONS.CONFIGURACAO },
      },
      {
        path: "settings/roles",
        component: RolePermissions,
        meta: { permission: PERMISSIONS.CONFIGURACAO },
      },
      { path: "", redirect: "dashboard" },
      {
        path: "settings/categories",
        component: MenuCategories,
        meta: { permission: PERMISSIONS.CONFIGURACAO },
      },
      {
        path: "settings/products",
        component: MenuProducts,
        meta: { permission: PERMISSIONS.CONFIGURACAO },
      },
      {
        path: "settings/users",
        name: "users-settings",
        component: CreateUsers,
        meta: { permission: PERMISSIONS.CONFIGURACAO },
      },
      {
        path: "settings/coupons",
        name: "coupons-settings",
        component: () => import("@/views/app/settings/CouponsManagement.vue"),
        meta: { permission: PERMISSIONS.CUPONS },
      },
      {
        path: "settings/nf",
        name: "nf-manager",
        component: () => import("@/views/app/settings/NFManager.vue"),
        meta: { permission: PERMISSIONS.NOTA_FISCAL },
      },
      {
        path: "/app/kitchen",
        name: "kitchen",
        component: KitchenTerminal,
        meta: { requiresAuth: true, permission: PERMISSIONS.COZINHA },
      },
      {
        path: "menu",
        name: "Menu",
        component: Menu,
        meta: { requiresAuth: true, permission: PERMISSIONS.CRIAR_PEDIDO },
      },
      {
        path: "cashier",
        name: "cashier",
        component: () => import("@/views/app/cashier/Cashier.vue"),
        meta: { requiresAuth: true, permission: PERMISSIONS.CAIXA },
      },
      {
        path: "closed",
        name: "closed",
        component: () => import("@/views/app/cashier/ClosedComandas.vue"),
        meta: {
          requiresAuth: true,
          permission: PERMISSIONS.COMANDAS_FINALIZADAS,
        },
      },
      {
        path: "reports",
        name: "reports",
        component: ManagerReports,
        meta: { permission: PERMISSIONS.RELATORIOS },
      },

      {
        path: "subscription",
        name: "subscription",
        component: () =>
          import("@/views/app/subscription/ManagerSubscription.vue"),
        meta: { requiresAuth: true, permission: PERMISSIONS.ASSINATURA },
      },

      {
        path: "admin/subscriptions",
        name: "admin-subscriptions",
        component: () => import("@/views/app/admin/AdminSubscriptions.vue"),
        meta: { requiresAuth: true, requiresAdmin: true },
      },
      {
        path: "admin/reports",
        name: "admin-reports",
        component: () => import("@/views/app/admin/AdminReports.vue"),
        meta: { requiresAuth: true, requiresAdmin: true },
      },
      {
        path: "admin/users",
        name: "admin-users",
        component: () => import("@/views/app/admin/AdminUsers.vue"),
        meta: { requiresAuth: true, requiresAdmin: true },
      },
      {
        path: "settings/profile",
        name: "manager-profile",
        component: () => import("@/views/app/settings/ManagerProfile.vue"),
        meta: { requiresAuth: true },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition;
    if (to.hash) {
      return new Promise((resolve) => {
        setTimeout(() => resolve({ el: to.hash, behavior: "smooth" }), 300);
      });
    }
    return { top: 0, behavior: "instant" };
  },
});

const ESTABLISHMENT_PREFIXES = [
  "/app/settings",
  "/app/kitchen",
  "/app/menu",
  "/app/cashier",
  "/app/closed",
  "/app/reports",
  "/app/subscription",
];

router.beforeEach(async (to, _from) => {
  const auth = useAuthStore();
  auth.loadSession();

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { path: "/login" };
  }

  const onboardingStep = auth.user?.onboardingStep;
  if (
    auth.isAuthenticated &&
    onboardingStep &&
    onboardingStep !== "COMPLETED"
  ) {
    if (onboardingStep === "NAME" && to.path !== "/onboarding/name") {
      return { path: "/onboarding/name" };
    }
    if (onboardingStep === "TYPE" && to.path !== "/onboarding/type") {
      return { path: "/onboarding/type" };
    }
  }

  if (
    auth.isAdmin &&
    ESTABLISHMENT_PREFIXES.some((p) => to.path.startsWith(p))
  ) {
    return { name: "admin-subscriptions" };
  }

  if (to.meta.requiresAdmin && !auth.isAdmin) {
    return { name: "dashboard" };
  }

  if (to.meta.permission && !auth.hasPermission(to.meta.permission)) {
    return { name: "dashboard" };
  }

  return true;
});

export default router;
