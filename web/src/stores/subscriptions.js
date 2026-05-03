import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

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
        status: 'ativo', // 'ativo' | 'expirado' | 'desativado'
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

  // Admin mock: all manager subscriptions
  const adminSubscriptions = [
    { id: 1, establishment: 'Burger Palace', manager: 'João Silva', email: 'joao.silva@burgerpalace.com', phone: '(11) 98765-4321', plan: 'anual', status: 'ativo', nextDueDate: '2026-10-15', amount: 49.90, users: 8 },
    { id: 2, establishment: 'Pizza Viva', manager: 'Maria Costa', email: 'maria.costa@pizzaviva.com', phone: '(21) 99887-6543', plan: 'mensal', status: 'ativo', nextDueDate: '2026-03-28', amount: 79.90, users: 5 },
    { id: 3, establishment: 'Tacos & Co', manager: 'Pedro Alves', email: 'pedro@tacosco.com', phone: '(31) 97654-3210', plan: 'mensal', status: 'expirado', nextDueDate: '2026-02-10', amount: 79.90, users: 3 },
    { id: 4, establishment: 'Sushi Express', manager: 'Ana Tanaka', email: 'ana.tanaka@sushiexpress.com', phone: '(11) 96543-2109', plan: 'anual', status: 'ativo', nextDueDate: '2026-11-05', amount: 49.90, users: 12 },
    { id: 5, establishment: 'Café Mooca', manager: 'Carlos Mendes', email: 'carlos@cafemooca.com', phone: '(11) 95432-1098', plan: 'mensal', status: 'desativado', nextDueDate: '2026-01-20', amount: 79.90, users: 2 },
    { id: 6, establishment: 'Churrasco do Rei', manager: 'Roberto Lima', email: 'roberto@churrascodrei.com', phone: '(41) 94321-0987', plan: 'anual', status: 'ativo', nextDueDate: '2026-08-22', amount: 49.90, users: 9 },
    { id: 7, establishment: 'Açaí Tropical', manager: 'Fernanda Rocha', email: 'fernanda@acaitropical.com', phone: '(85) 93210-9876', plan: 'mensal', status: 'ativo', nextDueDate: '2026-04-01', amount: 79.90, users: 4 },
    { id: 8, establishment: 'Cantina Italiana', manager: 'Giuseppe Ferri', email: 'giuseppe@cantina.com', phone: '(11) 92109-8765', plan: 'anual', status: 'expirado', nextDueDate: '2026-01-30', amount: 49.90, users: 6 },
  ];

  loadSubscription();

  return {
    subscription,
    isActive,
    daysUntilDue,
    planPrices,
    adminSubscriptions,
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
