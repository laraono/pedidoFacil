import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { adminSubscriptionApi, adminMetricsApi } from '@/services/adminApi';
import { subscriptionApi } from '@/services/subscriptionApi';

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
  const planPrices = ref<PlanPrices>({ monthly: 79.90, annual: 49.90 });

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

      adminSubscriptions.value = (subs || []).map((s: any) => ({
        id: s.id,
        establishment: s.establishment?.name ?? '—',
        manager: s.establishment?.manager?.name ?? '—',
        plan: s.plan?.name ?? '—',
        planFrequency: s.plan?.frequency ?? '—',
        status: s.status,
        nextDueDate: s.expirationDate,
        amount: Number(s.plan?.price ?? 0),
        users: (s.establishment?.roles ?? []).reduce((sum: number, r: any) => sum + (r.users?.length ?? 0), 0),
      }));

      adminMetrics.value = metrics;
    } catch (e) {
      console.error('Erro ao carregar dados admin:', e);
    } finally {
      adminDataLoading.value = false;
    }
  }

  return {
    planPrices,
    subscriptionStatus,
    fetchSubscriptionStatus,
    isActive,
    adminSubscriptions,
    adminMetrics,
    adminDataLoading,
    loadAdminData,
  };
});
