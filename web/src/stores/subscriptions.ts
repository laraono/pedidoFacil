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

  async function fetchSubscriptionStatus(): Promise<void> {
    try {
      const sub = await subscriptionApi.getEstablishmentSubscription();
      subscriptionStatus.value = (sub as any)?.status ?? null;
    } catch {
      subscriptionStatus.value = null;
    }
  }

  const isActive = computed(() => subscriptionStatus.value === 'Paga');

  // ── Admin: listagem de assinaturas ──────────────────────────────────────────

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

  // ── Admin: métricas por período ─────────────────────────────────────────────

  const adminMetrics = ref<any>(null);
  const adminMetricsLoading = ref(false);

  async function loadAdminMetrics(period = '12m'): Promise<void> {
    adminMetricsLoading.value = true;
    try {
      const end = new Date();
      const start = new Date();
      const months = period === '3m' ? 3 : period === '6m' ? 6 : 12;
      start.setMonth(start.getMonth() - months);
      const fmt = (d: Date) => d.toISOString().slice(0, 10);

      const raw = await adminMetricsApi.getSubscriptionMetrics(fmt(start), fmt(end)) as any;

      adminMetrics.value = {
        totalAtivas: raw.totalAtivos,
        receitaMensal: raw.mrr,
        receitaColetada: raw.receitaColetada,
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
