<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAsyncAction } from '@/composables/useAsyncAction';
import { useUtils } from '@/composables/useUtils';
import { Building2, User, CreditCard, History } from 'lucide-vue-next';
import { adminEstablishmentApi } from '@/services/adminApi';
import { PageHeader, StatusBadge, DataTable, EmptyState } from '@/components/ui';

const route = useRoute();

const { loading, run: runLoad } = useAsyncAction();
const { formatCurrency } = useUtils();

const detail = ref(null);

onMounted(async () => {
  detail.value = await runLoad(
    () => adminEstablishmentApi.getDetail(Number(route.params.id)),
    'Erro ao carregar estabelecimento.'
  ) ?? detail.value;
});

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const managerFields = computed(() => {
  const m = detail.value?.manager;
  if (!m) return [];
  return [
    { label: 'Nome',      value: m.name, span: 1 },
    { label: 'E-mail',    value: m.email, span: 1 },
    { label: 'CPF',       value: m.cpf, span: 1 },
    { label: 'Telefone',  value: m.phone, span: 1 },
    { label: 'Endereço',  value: [m.address, m.city, m.state].filter(Boolean).join(', ') || null, span: 2 },
  ];
});

const establishmentFields = computed(() => {
  const e = detail.value;
  if (!e) return [];
  return [
    { label: 'Nome',     value: e.name, bold: true, span: 1 },
    { label: 'CNPJ',     value: e.cnpj, span: 1 },
    { label: 'Telefone', value: e.phone, span: 1 },
    { label: 'Endereço', value: e.address, span: 2 },
  ];
});

const paymentColumns = [
  { key: 'date',   label: 'Data' },
  { key: 'amount', label: 'Valor' },
  { key: 'status', label: 'Status' },
  { key: 'name',   label: 'Plano' },
];
</script>

<template>
  <main class="max-w-5xl mx-auto py-12 px-6 font-inter">

    <PageHeader
      :title="detail?.name || 'Estabelecimento'"
      :subtitle="detail?.cnpj || ''"
      :category-icon="Building2"
      category-label="Painel Admin"
    >
    </PageHeader>

    <div v-if="loading" class="py-20 text-center testablishments/ext-[#757575]">Carregando...</div>

    <div v-else-if="detail" class="space-y-6">

      <div class="bg-white border border-[#E0E0E0] rounded-xl p-6">
        <div class="flex items-center gap-2 mb-4">
          <User :size="16" class="text-[#757575]" />
          <h2 class="text-[10px] font-black uppercase tracking-widest text-[#757575]">Gerente Responsável</h2>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="f in managerFields" :key="f.label" class="min-w-0" :class="f.span === 2 ? 'sm:col-span-2' : ''">
            <p class="text-[10px] font-black uppercase tracking-widest text-[#757575] mb-1">{{ f.label }}</p>
            <p class="text-sm text-[#212121] break-all" :class="f.bold ? 'font-bold' : ''">{{ f.value || '—' }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white border border-[#E0E0E0] rounded-xl p-6">
        <div class="flex items-center gap-2 mb-4">
          <Building2 :size="16" class="text-[#757575]" />
          <h2 class="text-[10px] font-black uppercase tracking-widest text-[#757575]">Dados do Estabelecimento</h2>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="f in establishmentFields" :key="f.label" class="min-w-0" :class="f.span === 2 ? 'sm:col-span-2' : ''">
            <p class="text-[10px] font-black uppercase tracking-widest text-[#757575] mb-1">{{ f.label }}</p>
            <p class="text-sm text-[#212121] break-all" :class="f.bold ? 'font-bold' : ''">{{ f.value || '—' }}</p>
          </div>
          <div>
            <p class="text-[10px] font-black uppercase tracking-widest text-[#757575] mb-1">Autoatendimento</p>
            <p class="text-sm font-bold" :class="detail.selfServiceEnabled ? 'text-accent' : 'text-[#757575]'">
              {{ detail.selfServiceEnabled ? 'Ativo' : 'Inativo' }}
            </p>
            <p v-if="detail.selfServiceEnabled && detail.selfServiceCode" class="text-xs text-[#757575] mt-0.5 font-mono">
              {{ detail.selfServiceCode }}
            </p>
          </div>
        </div>
      </div>

      <div class="bg-white border border-[#E0E0E0] rounded-xl p-6">
        <div class="flex items-center gap-2 mb-4">
          <CreditCard :size="16" class="text-[#757575]" />
          <h2 class="text-[10px] font-black uppercase tracking-widest text-[#757575]">Assinatura / Plano</h2>
        </div>
        <div v-if="detail.subscription" class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p class="text-[10px] font-black uppercase tracking-widest text-[#757575] mb-1">Plano</p>
            <p class="text-sm font-bold text-[#212121]">{{ detail.subscription.plan?.name || '—' }}</p>
          </div>
          <div>
            <p class="text-[10px] font-black uppercase tracking-widest text-[#757575] mb-1">Frequência</p>
            <StatusBadge v-if="detail.subscription.plan?.frequency" :status="detail.subscription.plan.frequency" type="frequency" />
            <span v-else class="text-sm text-[#757575]">—</span>
          </div>
          <div>
            <p class="text-[10px] font-black uppercase tracking-widest text-[#757575] mb-1">Status</p>
            <StatusBadge :status="detail.subscription.status" type="subscription" />
          </div>
          <div>
            <p class="text-[10px] font-black uppercase tracking-widest text-[#757575] mb-1">Início</p>
            <p class="text-sm text-[#212121]">{{ formatDate(detail.subscription.initialDate) }}</p>
          </div>
        </div>
        <p v-else class="text-sm text-[#757575]">Sem assinatura ativa.</p>
      </div>

      <div class="bg-white border border-[#E0E0E0] rounded-xl p-6">
        <div class="flex items-center gap-2 mb-4">
          <History :size="16" class="text-[#757575]" />
          <h2 class="text-[10px] font-black uppercase tracking-widest text-[#757575]">Histórico de Pagamentos</h2>
        </div>

        <DataTable v-if="detail.paymentHistory?.length" :columns="paymentColumns" :data="detail.paymentHistory">
          <template #cell-date="{ item }">{{ formatDate(item.date) }}</template>
          <template #cell-amount="{ item }">
            <span class="font-bold text-[#212121]">{{ formatCurrency(item.amount) }}</span>
          </template>
          <template #cell-status="{ item }">
            <span class="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded border"
              :class="item.status === 'Aprovado'  ? 'text-accent bg-accent-light border-accent/25'
                    : item.status === 'Cancelado' ? 'text-red-400 bg-red-500/10 border-red-500/20'
                    : 'text-amber-400 bg-amber-500/10 border-amber-500/25'">
              {{ item.status }}
            </span>
          </template>
          <template #cell-name="{ item }">
            <span class="text-[#757575]">{{ item.name || '—' }}</span>
          </template>
        </DataTable>

        <EmptyState v-else :icon="History" message="Nenhum pagamento encontrado" />
      </div>

    </div>
  </main>
</template>