<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAsyncAction } from '@/composables/useAsyncAction';
import { Search, Building2, BarChart3, Package, Settings } from 'lucide-vue-next';
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
      back-to="/app/dashboard"
      :category-icon="Building2"
      category-label="Painel Admin"
    >
      <template #actions>
        <button @click="router.push('/app/admin/subscriptions')" class="flex items-center gap-2 px-4 py-2.5 border border-[#E0E0E0] bg-white text-[#757575] font-black rounded text-sm hover:text-[#212121] hover:border-primary/30 transition-all">
          <Package :size="15" /> Assinaturas
        </button>
        <button @click="router.push('/app/admin/plans')" class="flex items-center gap-2 px-4 py-2.5 border border-[#E0E0E0] bg-white text-[#757575] font-black rounded text-sm hover:text-[#212121] hover:border-primary/30 transition-all">
          <Package :size="15" /> Planos
        </button>
        <button @click="router.push('/app/admin/users')" class="flex items-center gap-2 px-4 py-2.5 border border-[#E0E0E0] bg-white text-[#757575] font-black rounded text-sm hover:text-[#212121] hover:border-primary/30 transition-all">
          <Settings :size="15" /> Admins
        </button>
        <button @click="router.push('/app/admin/reports')" class="flex items-center gap-2 px-4 py-2.5 bg-primary text-white font-black rounded text-sm hover:bg-primary-dark transition-all">
          <BarChart3 :size="15" /> Métricas
        </button>
      </template>
    </PageHeader>

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
          <span v-if="item.plan" class="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded border text-blue-400 bg-blue-500/10 border-blue-500/20">
            {{ item.plan.name }}
          </span>
          <span v-else class="text-[#757575]">—</span>
        </template>
        <template #cell-status="{ item }">
          <StatusBadge v-if="item.subscription?.status" :status="item.subscription.status" type="subscription" />
          <span v-else class="text-[#757575] text-sm">—</span>
        </template>
      </DataTable>

      <EmptyState v-else :icon="Building2" message="Nenhum estabelecimento encontrado" />
    </template>
  </main>
</template>