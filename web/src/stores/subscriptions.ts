import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { adminSubscriptionApi, adminMetricsApi } from '@/services/adminApi';
import { subscriptionApi } from '@/services/subscriptionApi';

export type SubscriptionStatus = 'Paga' | 'Pendente' | 'Expirada' | 'Cancelada';

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
  const subscriptionStatus = ref<SubscriptionStatus | null>(null);
  const subscriptionExpirationDate = ref<string | null>(null);

  async function fetchSubscriptionStatus(): Promise<void> {
    try {
      const sub = await subscriptionApi.getEstablishmentSubscription();
      subscriptionStatus.value = (sub as any)?.status?.nome ?? (sub as any)?.status ?? null;
      subscriptionExpirationDate.value = (sub as any)?.expirationDate ?? null;
    } catch {
      subscriptionStatus.value = null;
      subscriptionExpirationDate.value = null;
    }
  }

  const isActive = computed(() => {
    if (subscriptionStatus.value === 'Paga') return true;
    if (subscriptionStatus.value === 'Cancelada' && subscriptionExpirationDate.value) {
      return new Date(subscriptionExpirationDate.value) > new Date();
    }
    return false;
  });

  const adminSubscriptions = ref<AdminSubscription[]>([]);
  const adminSubscriptionsLoading = ref(false);

  async function loadAdminSubscriptions(): Promise<void> {
    adminSubscriptionsLoading.value = true;
    try {
      const subs = await adminSubscriptionApi.list();
      adminSubscriptions.value = (subs || []).map((s: any) => ({
        id: s.id,
        establishment: s.establishment?.name ?? '—',
        manager: s.establishment?.manager?.name ?? '—',
        plan: s.plan?.name ?? '—',
        planFrequency: s.plan?.frequency ?? '—',
        status: s.status,
        nextDueDate: s.expirationDate,
        amount: Number(s.plan?.price ?? 0),
        users: (s.establishment?.roles ?? []).reduce(
          (sum: number, r: any) => sum + (r.users?.length ?? 0), 0
        ),
      }));
    } finally {
      adminSubscriptionsLoading.value = false;
    }
  }

  const adminMetrics = ref<any>(null);
  const adminMetricsLoading = ref(false);

  async function loadAdminMetrics(period: '3m' | '6m' | '12m' | 'all' = '12m'): Promise<void> {
    adminMetricsLoading.value = true;
    try {
      const raw = await adminMetricsApi.getSubscriptionMetrics(period) as any;
      adminMetrics.value = {
        totalAtivas: raw.totalAtivas,
        receitaMensal: raw.receitaMensal,
        inadimplentes: raw.inadimplentes,
        canceladas: raw.canceladas,
        totalGeral: raw.totalGeral,
        porPlano: raw.porPlano,
        novosPorMes: raw.novosPorMes,
        receitaPorMes: raw.receitaPorMes,
      };
    } finally {
      adminMetricsLoading.value = false;
    }
  }

  const adminDataLoading = computed(
    () => adminSubscriptionsLoading.value || adminMetricsLoading.value
  );

  return {
    subscriptionStatus,
    fetchSubscriptionStatus,
    isActive,
    adminSubscriptions,
    adminSubscriptionsLoading,
    loadAdminSubscriptions,
    adminMetrics,
    adminMetricsLoading,
    loadAdminMetrics,
    adminDataLoading,
  };
});
