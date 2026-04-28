<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  ArrowLeft, ShieldAlert, Users, CheckCircle2, AlertTriangle, Edit,
  XCircle, Search, Calendar, CreditCard, UserCircle, X, Mail, Phone, MapPin, DollarSign, Save
} from 'lucide-vue-next';
import { subscriptionApi } from "@/services/subscriptionApi";
import { planApi } from "@/services/planApi";

const router = useRouter();

const plans = ref([])
const subscriptions = ref([])
const chosenPlan = ref({})

const form = ref({
  id: 0,
  name: '',
  frequency: 'months',
  repetitions: 0,
  billingDay: 0,
  billingDayProportional: true,
  price: 0,
})

onMounted(async () => {
  plans.value = await planApi.list()
  subscriptionApi.value = await subscriptionApi.list()
})

const editingPrices = ref(false);
const priceForm = ref();

const frequencies = ['days', 'months', 'anual']
const frequenciesTranslation = ['Dias', 'Meses', 'Anual']

const applyPriceMaskAdmin = (raw) => {
  let val = String(raw).replace(/[^\d,]/g, '');
  const ci = val.indexOf(',');
  if (ci !== -1) { val = val.slice(0, ci + 1) + val.slice(ci + 1).replace(/,/g, ''); val = val.slice(0, ci + 3); }
  const parts = val.split(','); parts[0] = parts[0].replace(/^0+(\d)/, '$1'); return parts.join(',');
};

const onPriceFormInput = (e) => { priceForm.value = applyPriceMaskAdmin(e.target.value); };

const editPlan = async (plan) => {
  editingPrices.value = true;
  form.value = plan
};

const savePlanPrices = () => {
   const price = parseFloat(String(priceForm.value).replace(',', '.'));
  if (isNaN(price) || price <= 0) return;
  chosenPlan.value.price = price
  await subscriptionApi.updateSubscription(chosenPlan.id, plan)
  editingPrices.value = false;
}

const search = ref('');
const filterStatus = ref('todos');

const selectedManager = ref(null);
const openManagerModal = (sub) => { selectedManager.value = sub; };
const closeManagerModal = () => { selectedManager.value = null; };

const allSubs = computed(() => {
  return subscriptions.value.map(sub => ({
    id: sub.id,
    status: sub.status,
    plan: sub.plan,
    establishment: sub.establishment,
    expirationDate: sub.expirationDate,
    manager: sub.establishment?.users?.find(u => u.role === 'Gerente')?.name || 'N/A',
    usersCount: sub.establishment?.users?.length || 0,
    price: sub.plan?.price || 0
  }));
});

const filtered = computed(() => {
  return allSubs.value.filter(s => {
    const matchSearch = !search.value ||
      s.establishment_name.toLowerCase().includes(search.value.toLowerCase()) ||
      s.manager.toLowerCase().includes(search.value.toLowerCase());
    const matchStatus = filterStatus.value === 'todos' || 
      (filterStatus.value === 'ativo' && (s.status === 'Pendente' || s.status === 'Paga')) ||
      (filterStatus.value === 'expirada' && s.status === 'Expirada') ||
      (filterStatus.value === 'cancelada' && s.status === 'Cancelada');
    return matchSearch && matchStatus;
  });
});

const counts = computed(() => ({
  total: subscriptions.value.length,
  ativo: subscriptions.value.filter(s => s.status === 'Pendente' || s.status === 'Paga').length,
  expirada: subscriptions.value.filter(s => s.status === 'Expirada').length,
  cancelada: subscriptions.value.filter(s => s.status === 'Cancelada').length,
  anual: subscriptions.value.filter(s => s.plan?.name === 'Anual').length,
  mensal: subscriptions.value.filter(s => s.plan?.name === 'months' || s.plan?.name === 'mensal').length,
}));

const statusConfig = (status) => {
  if (status === 'Pendente' || status === 'Paga') { 
    return { label: 'Ativa', icon: CheckCircle2, color: 'text-accent', bg: 'bg-accent-light border-accent/25' }; 
  }
  if (status === 'Expirada') { 
    return { label: 'Expirada', icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/25' }; 
  }
  return { label: 'Desativada', icon: XCircle, color: 'text-[#757575]', bg: 'bg-gray-200/20 border-[#E0E0E0]' };
};

const formatDate = (d) =>
  new Date(d + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
</script>

<template>
  <main class="max-w-7xl mx-auto py-12 px-6 font-inter">

    <!-- Header -->
    <header class="flex items-center gap-4 mb-10">
      <button @click="router.push('/app/dashboard')" class="p-3 bg-gray-50 border border-[#E0E0E0] rounded text-[#757575] hover:text-[#212121] transition-colors">
        <ArrowLeft :size="20" />
      </button>
      <div>
        <div class="flex items-center gap-2 mb-1">
          <ShieldAlert :size="16" class="text-accent" />
          <span class="text-xs font-black text-accent uppercase tracking-widest">Painel Admin</span>
        </div>
        <h1 class="text-3xl font-black text-[#212121]">Assinaturas</h1>
        <p class="text-[#757575] text-sm">Controle de todos os gerentes e seus planos</p>
      </div>
    </header>

    <!-- Plan price editor -->
    <div class="bg-white border border-[#E0E0E0] rounded p-6 mb-8">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-accent-light border border-accent/30 rounded">
            <DollarSign :size="16" class="text-accent" />
          </div>
          <div>
            <p class="text-[#212121] font-black text-sm">Preços dos Planos</p>
            <p class="text-[#757575] text-xs">Atualiza Landing Page e telas de assinatura dos gerentes</p>
          </div>
        </div>
      </div>
      <div class="flex flex-wrap gap-4">
        <template v-if="!editingPrices">
          <div v-for="plan in plans">
            <div  class="flex-1 min-w-[120px] bg-gray-50 rounded p-4 text-center border border-[#E0E0E0]">
              <p class="text-[10px] font-black uppercase tracking-widest text-[#757575] mb-1">{{plan.name}}</p>
              <p class="text-[8px] font-black lowercase tracking-widest text-[#757575] mb-1">Frequência: {{plan.frequency}}</p>
              <p class="text-[8px] font-black lowercase tracking-widest text-[#757575] mb-1">Dia de pagamento: {{plan.billingDay}}</p>
              <p class="text-[8px] font-black lowercase tracking-widest text-[#757575] mb-1">Repetições: {{plan.billingDay}}</p>
              <p class="text-2xl font-black text-[#212121]">R$ {{ plan.priceForm.toFixed(2).replace('.', ',') }}</p>
              <p class="text-[10px] text-[#757575] mt-0.5">/mês</p>
            </div>
            <div class="flex gap-2">
              <button @click="editPlan(plan)" class="py-2.5 px-5 rounded bg-primary text-white font-black text-sm hover:opacity-90 flex items-center gap-2">
                <Edit :size="14" /> Editar
              </button>
            </div>
            </div>
        </template>
        <template v-else>
          <div class="flex flex-wrap gap-3 flex-1 items-end">
            <div class="flex flex-col gap-1">
              <label class="text-xs font-black text-[#757575] uppercase tracking-widest ml-1">{{chosenPlan.name  }}</label>
              <input :value="priceForm" @input="onPriceFormInput($event)" inputmode="numeric"
                class="py-2.5 px-4 rounded border bg-gray-50 border-[#E0E0E0] text-[#212121] text-sm focus:outline-none focus:border-primary/50 w-36" />
            </div>
            <select v-model="form.billingDay" 
              class="py-2.5 px-4 rounded border bg-gray-50 border-[#E0E0E0] text-[#212121] text-sm focus:outline-none focus:border-primary/50">
              <option v-for="n in 10" :key="n" :value="n">{{ n }}</option>
            </select>
            <select
              v-model="form.frequency" 
              class="py-2.5 px-4 rounded border bg-gray-50 border-[#E0E0E0] text-[#212121] text-sm focus:outline-none focus:border-primary/50">
              <option v-for="(item, index) in frequenciesTranslation" :key="index" :value="frequencies[index]">{{ item }}</option>
            </select>
            <div class="flex gap-2">
              <button @click="editingPrices = false" class="py-2.5 px-4 rounded text-[#757575] font-bold text-sm border border-[#E0E0E0] hover:bg-gray-50 transition-colors">Cancelar</button>
              <button @click="savePlanPrices" class="py-2.5 px-5 rounded bg-primary text-white font-black text-sm hover:opacity-90 flex items-center gap-2">
                <Save :size="14" /> Salvar
              </button>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- KPI cards -->
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      <div class="bg-white border border-[#E0E0E0] rounded p-4 text-center">
        <p class="text-3xl font-black text-[#212121]">{{ counts.total }}</p>
        <p class="text-[10px] font-black text-[#757575] uppercase tracking-widest mt-1">Total</p>
      </div>
      <div class="bg-accent-light border border-accent/30 rounded p-4 text-center cursor-pointer hover:bg-primary-dark/10 transition-colors" @click="filterStatus = 'ativo'">
        <p class="text-3xl font-black text-accent">{{ counts.ativo }}</p>
        <p class="text-[10px] font-black text-accent/60 uppercase tracking-widest mt-1">Ativas</p>
      </div>
      <div class="bg-amber-500/5 border border-amber-500/20 rounded p-4 text-center cursor-pointer hover:bg-amber-500/10 transition-colors" @click="filterStatus = 'expirada'">
        <p class="text-3xl font-black text-amber-400">{{ counts.expirada }}</p>
        <p class="text-[10px] font-black text-amber-400/60 uppercase tracking-widest mt-1">Expiradas</p>
      </div>
      <div class="bg-gray-50/50 border border-[#E0E0E0]/30 rounded p-4 text-center cursor-pointer hover:bg-gray-200/30 transition-colors" @click="filterStatus = 'cancelada'">
        <p class="text-3xl font-black text-[#757575]">{{ counts.cancelada }}</p>
        <p class="text-[10px] font-black text-[#757575] uppercase tracking-widest mt-1">Desativadas</p>
      </div>
      <div class="bg-primary/5 border border-primary/20 rounded p-4 text-center">
        <p class="text-3xl font-black text-purple-400">{{ counts.anual }}</p>
        <p class="text-[10px] font-black text-purple-400/60 uppercase tracking-widest mt-1">Anuais</p>
      </div>
      <div class="bg-blue-500/5 border border-blue-500/20 rounded p-4 text-center">
        <p class="text-3xl font-black text-blue-400">{{ counts.mensal }}</p>
        <p class="text-[10px] font-black text-blue-400/60 uppercase tracking-widest mt-1">Mensais</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-col sm:flex-row gap-3 mb-6">
      <div class="relative flex-1">
        <Search :size="16" class="absolute left-4 top-1/2 -translate-y-1/2 text-[#757575]" />
        <input
          v-model="search"
          type="text"
          placeholder="Buscar por estabelecimento ou gerente..."
          class="w-full bg-white border border-[#E0E0E0] rounded pl-10 pr-4 py-3 text-sm text-[#212121] outline-none focus:border-primary/40 placeholder:text-[#757575]"
        />
      </div>
      <div class="flex gap-2">
        <button
          v-for="opt in [{ v: 'todos', l: 'Todos' }, { v: 'ativo', l: 'Ativas' }, { v: 'expirada', l: 'Expiradas' }, { v: 'cancelada', l: 'Desativadas' }]"
          :key="opt.v"
          @click="filterStatus = opt.v"
          :class="filterStatus === opt.v
            ? 'bg-primary text-[#212121] border-accent'
            : 'bg-gray-50 text-[#757575] border-[#E0E0E0] hover:border-[#E0E0E0]'"
          class="px-4 py-2 rounded border text-xs font-black uppercase tracking-wider transition-all"
        >
          {{ opt.l }}
        </button>priceForm
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white border border-[#E0E0E0] rounded overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="border-b border-[#E0E0E0] bg-gray-100">
            <th class="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#757575]">Estabelecimento</th>
            <th class="text-left px-4 py-4 text-[10px] font-black uppercase tracking-widest text-[#757575] hidden md:table-cell">Gerente</th>
            <th class="text-left px-4 py-4 text-[10px] font-black uppercase tracking-widest text-[#757575]">Plano</th>
            <th class="text-left px-4 py-4 text-[10px] font-black uppercase tracking-widest text-[#757575]">Status</th>
            <th class="text-left px-4 py-4 text-[10px] font-black uppercase tracking-widest text-[#757575] hidden lg:table-cell">Vencimento</th>
            <th class="text-right px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#757575] hidden sm:table-cell">Valor</th>
            <th class="text-right px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#757575] hidden lg:table-cell">Usuários</th>
            <th class="px-4 py-4"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-white/5">
          <tr v-for="sub in filtered" :key="sub.id" class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4">
              <span class="font-bold text-[#212121] text-sm">{{ sub.establishment.name }}</span>
            </td>
            <td class="px-4 py-4 hidden md:table-cell">
              <span class="text-[#757575] text-sm">{{ sub.manager }}</span>
            </td>
            <td class="px-4 py-4">
              <span
                class="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded border"
                :class="sub.plan.name === 'anual'
                  ? 'text-purple-400 bg-primary/10 border-primary/20'
                  : 'text-blue-400 bg-blue-500/10 border-blue-500/20'"
              >
                {{ sub.plan.name }}
              </span>
            </td>
            <td class="px-4 py-4">
              <div
                class="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded border"
                :class="statusConfig(sub.status).bg + ' ' + statusConfig(sub.status).color"
              >
                <component :is="statusConfig(sub.status).icon" :size="10" />
                {{ statusConfig(sub.status).label }}
              </div>
            </td>
            <td class="px-4 py-4 hidden lg:table-cell">
              <div class="flex items-center gap-1.5 text-sm text-[#757575]">
                <Calendar :size="13" class="text-[#757575]" />
                {{ formatDate(sub.expirationDate) }}
              </div>
            </td>
            <td class="px-6 py-4 text-right hidden sm:table-cell">
              <span class="text-sm font-black text-[#212121]">
                {{ sub.plan.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
              </span>
              <span class="text-[10px] text-[#757575] block">/mês</span>
            </td>
            <td class="px-6 py-4 text-right hidden lg:table-cell">
              <div class="flex items-center justify-end gap-1.5 text-[#757575] text-sm">
                <Users :size="13" class="text-[#757575]" />
                {{ sub.usersCount }}
              </div>
            </td>
            <td class="px-4 py-4">
              <button
                @click="openManagerModal(sub)"
                class="p-2 rounded text-[#757575] hover:text-accent hover:bg-primary-dark/10 transition-all"
                title="Ver dados do gerente"
              >
                <UserCircle :size="18" />
              </button>
            </td>
          </tr>

          <tr v-if="filtered.length === 0">
            <td colspan="7" class="px-6 py-16 text-center">
              <CreditCard :size="32" class="mx-auto mb-3 text-[#757575]" />
              <p class="text-[#757575] text-sm font-bold">Nenhuma assinatura encontrada</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

  </main>

  <!-- Manager contact modal -->
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="selectedManager" class="fixed inset-0 bg-black/50  z-[100] flex items-center justify-center p-4">
        <div class="bg-white border border-[#E0E0E0] w-full max-w-md rounded shadow-2xl">
          <div class="p-8 border-b border-[#E0E0E0] flex justify-between items-center bg-gray-100">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded bg-accent-light border border-accent/30 flex items-center justify-center">
                <UserCircle :size="20" class="text-accent" />
              </div>
              <div>
                <h2 class="text-lg font-black text-[#212121]">Dados do Gerente</h2>
                <p class="text-xs text-[#757575]">{{ selectedManager.establishment }}</p>
              </div>
            </div>
            <button @click="closeManagerModal" class="p-2 text-[#757575] hover:text-[#212121] transition-colors">
              <X :size="20" />
            </button>
          </div>

          <div class="p-8 space-y-4">
            <div class="flex items-center gap-3 p-4 bg-gray-50 rounded">
              <UserCircle :size="16" class="text-[#757575] shrink-0" />
              <div>
                <p class="text-[10px] font-black uppercase tracking-widest text-[#757575] mb-0.5">Nome</p>
                <p class="text-sm font-bold text-[#212121]">{{ selectedManager.manager }}</p>
              </div>
            </div>

            <div class="flex items-center gap-3 p-4 bg-gray-50 rounded">
              <Mail :size="16" class="text-[#757575] shrink-0" />
              <div>
                <p class="text-[10px] font-black uppercase tracking-widest text-[#757575] mb-0.5">E-mail</p>
                <p class="text-sm font-bold text-[#212121]">{{ selectedManager.email || 'Não informado' }}</p>
              </div>
            </div>

            <div class="flex items-center gap-3 p-4 bg-gray-50 rounded">
              <Phone :size="16" class="text-[#757575] shrink-0" />
              <div>
                <p class="text-[10px] font-black uppercase tracking-widest text-[#757575] mb-0.5">Telefone</p>
                <p class="text-sm font-bold text-[#212121]">{{ selectedManager.phone || 'Não informado' }}</p>
              </div>
            </div>

            <div class="flex items-center gap-3 p-4 bg-gray-50 rounded">
              <CreditCard :size="16" class="text-[#757575] shrink-0" />
              <div>
                <p class="text-[10px] font-black uppercase tracking-widest text-[#757575] mb-0.5">Plano / Valor</p>
                <p class="text-sm font-bold text-[#212121] capitalize">
                  {{ selectedManager.plan }} —
                  {{ selectedManager.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}/mês
                </p>
              </div>
            </div>

            <div class="flex items-center gap-3 p-4 bg-gray-50 rounded">
              <Calendar :size="16" class="text-[#757575] shrink-0" />
              <div>
                <p class="text-[10px] font-black uppercase tracking-widest text-[#757575] mb-0.5">Próximo Vencimento</p>
                <p class="text-sm font-bold text-[#212121]">{{ formatDate(selectedManager.nextDueDate) }}</p>
              </div>
            </div>
          </div>

          <div class="p-8 pt-0">
            <button @click="closeManagerModal"
              class="w-full py-3 rounded text-[#757575] font-bold hover:bg-gray-50 transition-colors">
              Fechar
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
