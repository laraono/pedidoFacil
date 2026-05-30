import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { adminSubscriptionApi, adminMetricsApi } from '@/services/adminApi';
import { subscriptionApi } from '@/services/subscriptionApi';

const PLAN_KEY = 'plan';

export type SubscriptionStatus = 'Paga' | 'Pendente' | 'Expirada' | 'Cancelada';

export interface PlanPrices {
  monthly: number;
  annual: number;
}

export interface AdminSubscription {
  id: number;
  establishment: string;
  manager: string;
  plan: string;
  planFrequency: string;
  status: SubscriptionStatus;
  nextDueDate: string;
  amount: number;
  users: number;
}

export const useSubscriptionStore = defineStore('subscription', () => {
  const planPrices = ref<PlanPrices>(
    JSON.parse(localStorage.getItem('planPrices') || 'null') || { monthly: 79.90, annual: 49.90 }
  );

  function updatePlanPrices(prices: PlanPrices): void {
    planPrices.value = { ...prices };
    localStorage.setItem('planPrices', JSON.stringify(planPrices.value));
  }

  function setPlanToBeSubscribed(id: number): void {
    localStorage.setItem(PLAN_KEY, JSON.stringify(id));
  }

  function getPlanToBeSubscribed(): string | null {
    return localStorage.getItem(PLAN_KEY);
  }

  const subscriptionStatus = ref<SubscriptionStatus | null>(null);

  async function fetchSubscriptionStatus(): Promise<void> {
    try {
      const sub = await subscriptionApi.getEstablishmentSubscription();
      subscriptionStatus.value = (sub as any)?.status ?? null;
    } catch {
      subscriptionStatus.value = null;
    }
  }

  const isActive = computed(() => subscriptionStatus.value === 'Paga');

  const adminSubscriptions = ref<AdminSubscription[]>([]);
  const adminMetrics = ref<any>(null);
  const adminDataLoading = ref(false);

  async function loadAdminData(): Promise<void> {
    adminDataLoading.value = true;
    try {
      const [subs, metrics] = await Promise.all([
        adminSubscriptionApi.list(),
        adminMetricsApi.getSubscriptionMetrics(),
      ]);

      adminSubscriptions.value = (subs || []).map((s: any) => {
        const managerUser = s.establishment?.users?.find(
          (u: any) => u.role?.name?.toLowerCase().includes('gerente') || u.role?.name?.toLowerCase().includes('manager')
        ) ?? s.establishment?.users?.[0];

        return {
          id: s.id,
          establishment: s.establishment?.name ?? '—',
          manager: managerUser?.name ?? '—',
          plan: s.plan?.name ?? '—',
          planFrequency: s.plan?.frequency ?? '—',
          status: s.status,
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

  return {
    planPrices,
    updatePlanPrices,
    setPlanToBeSubscribed,
    getPlanToBeSubscribed,
    subscriptionStatus,
    fetchSubscriptionStatus,
    isActive,
    adminSubscriptions,
    adminMetrics,
    adminDataLoading,
    loadAdminData,
  };
});
