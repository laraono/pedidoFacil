<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAsyncAction } from '@/composables/useAsyncAction';
import { Search, Building2 } from 'lucide-vue-next';
import { adminEstablishmentApi } from '@/services/adminApi';
import { PageHeader, StatusBadge, DataTable, EmptyState, BaseInput } from '@/components/ui';

const router = useRouter();
const { loading, run: runLoad } = useAsyncAction();

const establishments = ref([]);
const search = ref('');

async function load() {
  establishments.value = await runLoad(() => adminEstablishmentApi.list(), 'Erro ao carregar estabelecimentos.') ?? establishments.value;
}

onMounted(load);

const filtered = computed(() =>
  establishments.value.filter(e =>
    !search.value ||
    e.name?.toLowerCase().includes(search.value.toLowerCase()) ||
    e.manager?.name?.toLowerCase().includes(search.value.toLowerCase())
  )
);

const columns = [
  { key: 'name', label: 'Estabelecimento', sortable: true },
  { key: 'manager', label: 'Gerente' },
  { key: 'plan', label: 'Plano' },
  { key: 'status', label: 'Status' },
];

const actions = [
  {
    icon: Search,
    tooltip: 'Ver detalhes',
    handler: (e) => router.push(`/app/admin/establishments/${e.id}`),
    class: 'text-[#757575] hover:text-accent hover:bg-primary-dark/10',
  },
];
</script>

<template>
  <main class="max-w-7xl mx-auto py-12 px-6 font-inter">

    <PageHeader
      title="Estabelecimentos"
      subtitle="Controle de todos os estabelecimentos cadastrados"
      :category-icon="Building2"
      category-label="Painel Admin"
    />

    <div class="mb-6">
      <BaseInput
        v-model="search"
        placeholder="Buscar por estabelecimento ou gerente..."
        :icon="Search"
        :dark="false"
      />
    </div>

    <div v-if="loading" class="py-20 text-center text-[#757575]">Carregando...</div>

    <template v-else>
      <DataTable v-if="filtered.length" :columns="columns" :data="filtered" :actions="actions">
        <template #cell-name="{ item }">
          <span class="font-bold text-[#212121]">{{ item.name }}</span>
          <p class="text-[11px] text-[#757575] mt-0.5">{{ item.cnpj }}</p>
        </template>
        <template #cell-manager="{ item }">
          <span class="text-[#757575]">{{ item.manager?.name || '—' }}</span>
        </template>
        <template #cell-plan="{ item }">
          <span v-if="item.plan" class="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded border text-blue-700 bg-blue-100 border-blue-700/30">
            {{ item.plan.name }}
          </span>
          <span v-else class="text-[#757575]">—</span>
        </template>
        <template #cell-status="{ item }">
          <StatusBadge v-if="item.subscription?.status" :status="item.subscription.status?.nome" type="subscription" />
          <span v-else class="text-[#757575] text-sm">—</span>
        </template>
      </DataTable>

      <EmptyState v-else :icon="Building2" message="Nenhum estabelecimento encontrado" />
    </template>
  </main>
</template>