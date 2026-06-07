<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useToast } from '@/composables/useToast';
import { useAsyncAction } from '@/composables/useAsyncAction';
import { useConfirm } from '@/composables/useConfirm';
import {
  ShieldAlert, Plus, Pencil, Trash2,
  CheckCircle2, Package, DollarSign
} from 'lucide-vue-next';
import { adminPlanApi, type Plan, type PlanForm } from '@/services/adminApi';
import { useUtils } from '@/composables/useUtils';
import { applyPriceMask } from '@/composables/usePriceMask';
import { PageHeader, StatusBadge, EmptyState, BaseButton, BaseInput, BaseTextArea, FormModal, ConfirmModal } from '@/components/ui';

const { showToast } = useToast();
const { formatCurrency } = useUtils();
const { loading: saving, run } = useAsyncAction();
const { confirmState, showConfirm, closeConfirm } = useConfirm();

const plans = ref<Plan[]>([]);
const loading = ref(false);
const loadError = ref(false);
const isModalOpen = ref(false);
const isEditing = ref(false);

const form = ref<PlanForm>({ id: null, name: '', price: '', frequency: 'mensal', features: '' });
const errors = ref<Record<string, string>>({});

async function load() {
  loading.value = true;
  loadError.value = false;
  try {
    plans.value = await adminPlanApi.list();
  } catch (e) {
    loadError.value = true;
  } finally {
    loading.value = false;
  }
}

onMounted(load);

function openCreate() {
  form.value = { id: null, name: '', price: '', frequency: 'mensal', features: '' };
  errors.value = {};
  isEditing.value = false;
  isModalOpen.value = true;
}

const FREQ_NORMALIZE: Record<string, string> = {
  months: 'mensal', month: 'mensal', monthly: 'mensal', '1': 'mensal',
  annual: 'anual', yearly: 'anual', '12': 'anual',
};

function normalizeFrequency(f?: string): string {
  if (!f) return 'mensal';
  const lower = f.toLowerCase();
  return FREQ_NORMALIZE[lower] ?? lower;
}

function openEdit(plan: Plan) {
  form.value = {
    id: plan.id,
    name: plan.name,
    price: String(plan.price).replace('.', ','),
    frequency: normalizeFrequency(plan.frequency),
    features: plan.features || '',
  };
  errors.value = {};
  isEditing.value = true;
  isModalOpen.value = true;
}

function validate(): boolean {
  const e: Record<string, string> = {};
  if (!form.value.name.trim()) e.name = 'Nome é obrigatório.';
  const price = parseFloat(String(form.value.price).replace(',', '.'));
  if (!form.value.price || isNaN(price) || price <= 0) e.price = 'Valor inválido.';
  errors.value = e;
  return Object.keys(e).length === 0;
}

async function save() {
  if (!validate()) return;
  const payload = {
    name: form.value.name.trim(),
    price: parseFloat(String(form.value.price).replace(',', '.')),
    frequency: form.value.frequency,
    billingDay: 1,
    features: form.value.features.split('\n').map(f => f.trim()).filter(Boolean).join('\n') || undefined,
  };
  await run(async () => {
    if (isEditing.value) {
      await adminPlanApi.update(form.value.id!, payload);
      showToast('Plano atualizado!', 'success');
    } else {
      await adminPlanApi.create(payload);
      showToast('Plano criado!', 'success');
    }
    isModalOpen.value = false;
    await load();
  }, 'Erro ao salvar plano.');
}

function askDelete(plan: Plan) {
  showConfirm({
    title: 'Deletar Plano?',
    message: `O plano "${plan.name}" e todas as assinaturas vinculadas serão removidos permanentemente.`,
    onConfirm: async () => {
      await run(async () => {
        await adminPlanApi.delete(plan.id);
        showToast(`Plano "${plan.name}" removido.`, 'success');
        await load();
      }, 'Erro ao remover plano.');
    }
  });
}

function onPriceInput(e: Event) {
  const target = e.target as HTMLInputElement;
  const v = applyPriceMask(target.value);
  target.value = v;
  form.value.price = v;
  delete errors.value.price;
}
</script>

<template>
  <main class="max-w-4xl mx-auto py-12 px-6 font-inter">
    <PageHeader
      title="Planos"
      subtitle="CRUD de planos — máximo de 2 planos ativos"
      back-to="/app/admin/subscriptions"
      :category-icon="ShieldAlert"
      category-label="Painel Admin"
    >
      <template #actions>
        <BaseButton variant="primary" :icon="Plus" @click="openCreate">
          Novo Plano
        </BaseButton>
      </template>
    </PageHeader>

    <div v-if="loading" class="py-20 text-center text-[#757575]">Carregando...</div>

    <div v-else-if="loadError" class="py-20 text-center">
      <ShieldAlert :size="40" class="mx-auto mb-4 text-red-400 opacity-60" />
      <p class="text-[#757575] font-bold mb-1">Erro ao carregar planos</p>
      <p class="text-[#757575] text-sm mb-4">Verifique sua conexão e tente novamente.</p>
      <BaseButton variant="secondary" @click="load">Tentar Novamente</BaseButton>
    </div>

    <div v-else-if="plans.length" class="grid sm:grid-cols-2 gap-6">
      <div v-for="plan in plans" :key="plan.id"
        class="bg-white border border-[#E0E0E0] rounded-xl p-6 flex flex-col gap-4 hover:border-primary/30 transition-colors">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-accent-light border border-accent/30 flex items-center justify-center">
              <Package :size="18" class="text-accent" />
            </div>
            <div>
              <h2 class="text-lg font-black text-[#212121]">{{ plan.name }}</h2>
              <StatusBadge :status="plan.frequency ?? 'mensal'" type="frequency" />
            </div>
          </div>
          <div class="flex gap-1">
            <button @click="openEdit(plan)" class="p-2 rounded text-[#757575] hover:text-[#212121] hover:bg-gray-100 transition-all">
              <Pencil :size="16" />
            </button>
            <button @click="askDelete(plan)" class="p-2 rounded text-[#757575] hover:text-red-500 hover:bg-red-50 transition-all">
              <Trash2 :size="16" />
            </button>
          </div>
        </div>
        <div class="flex items-end gap-1">
          <span class="text-3xl font-black text-[#212121]">{{ formatCurrency(plan.price) }}</span>
          <span class="text-[#757575] text-sm mb-1">{{ plan.frequency === 'anual' ? '/ano' : '/mês' }}</span>
        </div>
        <div v-if="plan.features" class="border-t border-[#E0E0E0] pt-4">
          <p class="text-xs font-black text-[#757575] uppercase tracking-widest mb-2">Funcionalidades</p>
          <ul class="space-y-1.5">
            <li v-for="(feature, i) in plan.features.split('\n').filter(Boolean)" :key="i"
              class="flex items-start gap-2 text-sm text-[#757575]">
              <CheckCircle2 :size="14" class="text-primary mt-0.5 shrink-0" />
              <span>{{ feature }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <EmptyState
      v-else
      :icon="Package"
      message="Nenhum plano cadastrado"
      action-label="Criar Primeiro Plano"
      @action="openCreate"
    />
  </main>

  <FormModal
    :show="isModalOpen"
    :title="isEditing ? 'Editar Plano' : 'Novo Plano'"
    size="sm"
    :is-loading="saving"
    :save-label="isEditing ? 'Salvar' : 'Criar Plano'"
    @close="isModalOpen = false"
    @save="save"
  >
    <div class="space-y-5">
      <BaseInput
        v-model="form.name"
        label="Nome do Plano"
        placeholder="Ex: Plano Profissional"
        :error="errors.name"
        @input="delete errors.name"
      />
      <BaseInput
        :modelValue="form.price"
        label="Valor (R$)"
        placeholder="79,90"
        :icon="DollarSign"
        :error="errors.price"
        @input="onPriceInput"
      />
      <div>
        <label class="text-xs font-black uppercase tracking-widest text-[#757575] ml-1 mb-2 block">Frequência</label>
        <div class="flex gap-3">
          <button v-for="opt in [{ v: 'mensal', l: 'Mensal' }, { v: 'anual', l: 'Anual' }, { v: 'diario', l: 'Diário (teste)' }]" :key="opt.v"
            @click="form.frequency = opt.v"
            :class="form.frequency === opt.v ? 'border-primary bg-primary/10 text-primary font-black' : 'border-[#E0E0E0] bg-gray-50 text-[#757575]'"
            class="flex-1 py-2.5 rounded-lg border text-sm font-bold transition-all">{{ opt.l }}</button>
        </div>
      </div>
      <BaseTextArea
        v-model="form.features"
        label="Funcionalidades (opcional) — uma por linha"
        :rows="5"
        placeholder="Ex: Até 3 usuários&#10;Relatórios mensais&#10;Suporte prioritário"
      />
    </div>
  </FormModal>

  <ConfirmModal :confirm-modal="confirmState" @close="closeConfirm" />
</template>
