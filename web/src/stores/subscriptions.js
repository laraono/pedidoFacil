import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { adminSubscriptionApi, adminMetricsApi } from '@/services/adminApi';

const SUBSCRIPTION_KEY = 'subscription';
const PLAN_KEY = 'plan';

export const useSubscriptionStore = defineStore('subscription', () => {
  const subscription = ref(null);

  const planPrices = ref(
    JSON.parse(localStorage.getItem('planPrices') || 'null') || { monthly: 79.90, annual: 49.90 }
  );

  function updatePlanPrices(prices) {
    planPrices.value = { ...prices };
    localStorage.setItem('planPrices', JSON.stringify(planPrices.value));
  }

  function loadSubscription() {
    const saved = localStorage.getItem(SUBSCRIPTION_KEY);
    if (saved) {
      subscription.value = JSON.parse(saved);
    } else {
      const mock = {
        plan: 'mensal',
        status: 'ativo',
        nextDueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 12).toISOString(),
        paymentMethod: 'Cartão de Crédito',
        history: [
          { id: 1, date: '2026-02-13', amount: 79.90, method: 'Cartão de Crédito', status: 'pago' },
          { id: 2, date: '2026-01-13', amount: 79.90, method: 'Cartão de Crédito', status: 'pago' },
          { id: 3, date: '2025-12-13', amount: 79.90, method: 'Pix', status: 'pago' },
          { id: 4, date: '2025-11-13', amount: 79.90, method: 'Pix', status: 'pago' },
          { id: 5, date: '2025-10-13', amount: 79.90, method: 'Boleto', status: 'pago' },
        ]
      };
      subscription.value = mock;
      localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(mock));
    }
  }

  function updateStatus(newStatus) {
    if (subscription.value) {
      subscription.value.status = newStatus;
      localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(subscription.value));
    }
  }

  function setPlanToBeSubscribed(id) {
    localStorage.setItem(PLAN_KEY, JSON.stringify(id))
  }

  function getPlanToBeSubscribed() {
    return localStorage.getItem(PLAN_KEY)
  }

  function updatePaymentMethod(method) {
    if (subscription.value) {
      subscription.value.paymentMethod = method;
      localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(subscription.value));
    }
  }

  function updatePlan(plan) {
    if (subscription.value) {
      subscription.value.plan = plan;
      localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(subscription.value));
    }
  }

  function setPendingPlan(plan) {
    if (subscription.value) {
      subscription.value.pendingPlan = plan || undefined;
      if (!plan) delete subscription.value.pendingPlan;
      localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(subscription.value));
    }
  }

  function recordPayment(method) {
    if (!subscription.value) return;
    const today = new Date().toISOString().split('T')[0];
    const amount = subscription.value.plan === 'anual' ? planPrices.value.annual : planPrices.value.monthly;

    subscription.value.history.unshift({
      id: Date.now(),
      date: today,
      amount,
      method,
      status: 'pago'
    });

    const daysToAdd = subscription.value.plan === 'anual' ? 365 : 30;
    subscription.value.nextDueDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * daysToAdd).toISOString();
    subscription.value.status = 'ativo';
    subscription.value.paymentMethod = method;

    localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(subscription.value));
  }

  const isActive = computed(() => subscription.value?.status === 'ativo');

  const daysUntilDue = computed(() => {
    if (!subscription.value?.nextDueDate) return null;
    const diff = new Date(subscription.value.nextDueDate) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  });

  const adminSubscriptions = ref([]);
  const adminMetrics = ref(null);
  const adminDataLoading = ref(false);

  async function loadAdminData() {
    adminDataLoading.value = true;
    try {
      const [subs, metrics] = await Promise.all([
        adminSubscriptionApi.list(),
        adminMetricsApi.getSubscriptionMetrics(),
      ]);

      adminSubscriptions.value = (subs || []).map((s) => {
        const managerUser = s.establishment?.users?.find(
          (u) => u.role?.name?.toLowerCase().includes('gerente') || u.role?.name?.toLowerCase().includes('manager')
        ) ?? s.establishment?.users?.[0];

        return {
          id: s.id,
          establishment: s.establishment?.name ?? '—',
          manager: managerUser?.name ?? '—',
          plan: s.plan?.name ?? '—',
          planFrequency: s.plan?.frequency ?? '—',
          status: normalizeStatus(s.status),
          nextDueDate: s.expirationDate,
          amount: Number(s.plan?.price ?? 0),
          users: s.establishment?.users?.length ?? 0,
        };
      });

      adminMetrics.value = metrics;
    } catch (e) {
      console.error('Erro ao carregar dados admin:', e);
    } finally {
      adminDataLoading.value = false;
    }
  }

  function normalizeStatus(status) {
    const s = String(status ?? '').toLowerCase();
    if (s === 'paga' || s === 'ativo' || s === 'ativa') return 'ativo';
    if (s === 'cancelada' || s === 'cancelado') return 'cancelado';
    if (s === 'expirada' || s === 'expirado') return 'expirado';
    if (s === 'pendente') return 'pendente';
    return s;
  }

  loadSubscription();

  return {
    subscription,
    isActive,
    daysUntilDue,
    planPrices,
    adminSubscriptions,
    adminMetrics,
    adminDataLoading,
    loadAdminData,
    loadSubscription,
    updateStatus,
    updatePaymentMethod,
    updatePlan,
    setPendingPlan,
    setPlanToBeSubscribed,
    getPlanToBeSubscribed,
    updatePlanPrices,
    recordPayment
  };
});
