<script setup>
import { ref, onMounted } from 'vue';
import { useCouponStore } from '@/stores/coupons';
import { useToast } from '@/composables/useToast';
import { useConfirm } from '@/composables/useConfirm';
import { useAsyncAction } from '@/composables/useAsyncAction';
import { useUtils } from '@/composables/useUtils';
import { applyPriceMask, applyPercentMask } from '@/composables/usePriceMask';
import {
  BaseButton, BaseInput, BaseSelect,
  ConfirmModal, EmptyState, FormModal, PageHeader, ToastMessage,
} from '@/components/ui';
import { PlusCircle, Edit, Trash2, Tag, Calendar, BadgePercent, DollarSign } from 'lucide-vue-next';

const store = useCouponStore();
const { showToast } = useToast();
const { confirmState, showConfirm, closeConfirm } = useConfirm();
const { loading: isLoading, run: runSave } = useAsyncAction();
const { run } = useAsyncAction();
const { formatCurrency } = useUtils();

const showModal = ref(false);
const isEditing = ref(false);
const errors = ref({});

onMounted(() => {
  store.loadData();
});

const typeOptions = [
  { value: 'percent', label: 'Percentual (%)' },
  { value: 'fixed',   label: 'Valor fixo (R$)' },
];

const emptyForm = () => ({ id: null, code: '', description: '', type: 'percent', value: '', expiresAt: '' });
const form = ref(emptyForm());

const onValueInput = (e) => {
  const v = form.value.type === 'percent' ? applyPercentMask(e.target.value) : applyPriceMask(e.target.value);
  e.target.value = v;
  form.value.value = v;
};

const validate = () => {
  const e = {};
  if (!form.value.code?.trim()) e.code = 'Código do cupom é obrigatório.';

  const parsed = parseFloat(String(form.value.value).replace(',', '.'));
  if (!form.value.value || isNaN(parsed) || parsed <= 0) e.value = 'Valor do desconto inválido.';
  if (form.value.type === 'percent' && parsed > 100) e.value = 'Percentual não pode exceder 100%.';

  if (form.value.expiresAt) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(`${form.value.expiresAt}T12:00:00`);
    if (selectedDate < today) e.expiresAt = 'A data não pode ser anterior a hoje.';
  }

  errors.value = e;
  return Object.keys(e).length === 0;
};

const openAdd = () => { isEditing.value = false; form.value = emptyForm(); errors.value = {}; showModal.value = true; };
const openEdit = (c) => {
  isEditing.value = true;
  form.value = {
    id: c.id,
    code: c.code,
    description: c.description || '',
    type: c.type,
    value: c.type === 'percent' ? String(c.value) : String(c.value).replace('.', ','),
    expiresAt: c.expiresAt || '',
  };
  errors.value = {};
  showModal.value = true;
};

const save = () => runSave(async () => {
  errors.value = {};
  if (!validate()) {
    showToast(Object.values(errors.value)[0] || 'Corrija os erros no formulário.', 'error');
    return;
  }

  const parsed = parseFloat(String(form.value.value).replace(',', '.'));
  const payload = {
    id: form.value.id,
    code: form.value.code.trim().toUpperCase(),
    description: form.value.description,
    type: form.value.type,
    value: parsed,
    expiresAt: form.value.expiresAt || null,
  };

  try {
    if (isEditing.value) await store.updateCoupon(payload);
    else await store.addCoupon(payload);
    showToast(isEditing.value ? 'Cupom atualizado!' : 'Cupom criado!', 'success');
    showModal.value = false;
  } catch (error) {
    const data = error.response?.data || error.data || error;
    if (data?.errors && Array.isArray(data.errors)) {
      data.errors.forEach((err) => {
        errors.value[err.campo.replace('body.', '')] = err.mensagem;
      });
      showToast('Verifique os campos destacados em vermelho.', 'error');
    } else {
      throw error;
    }
  }
});

const requestDelete = (coupon) => {
  showConfirm({
    title: 'Excluir cupom?',
    message: `O cupom ${coupon.code} será removido permanentemente.`,
    onConfirm: () => run(
      async () => {
        await store.removeCoupon(coupon.id);
        showToast(`Cupom ${coupon.code} excluído.`, 'success');
      },
      'Erro ao excluir cupom.'
    ),
  });
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Intl.DateTimeFormat('pt-BR').format(new Date(`${dateString.split('T')[0]}T12:00:00`));
};

const isExpired = (c) => {
  if (!c.expiresAt) return false;
  const expDate = new Date(`${c.expiresAt}T12:00:00`);
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  return expDate < today;
};

const statusOf = (c) => {
  if (isExpired(c)) return { label: 'Vencido', cls: 'bg-danger-light text-danger border-danger' };
  if (c.active === false) return { label: 'Inativo', cls: 'bg-gray-100 text-[#757575] border-[#E0E0E0]' };
  return { label: 'Ativo', cls: 'bg-accent-light text-accent border-accent/30' };
};
</script>

<template>
  <main class="max-w-6xl mx-auto py-12 px-6 font-inter">
    <ToastMessage />
    <PageHeader title="Cupons de Desconto" subtitle="Gerencie cupons promocionais">
      <template #actions>
        <BaseButton @click="openAdd" :icon="PlusCircle">Novo Cupom</BaseButton>
      </template>
    </PageHeader>

    <EmptyState v-if="store.coupons.length === 0" :icon="Tag" message="Nenhum cupom cadastrado" />

    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      <div
        v-for="coupon in store.coupons"
        :key="coupon.id"
        class="bg-white border border-[#E0E0E0] rounded p-6 flex flex-col gap-4 transition-all hover:border-[#E0E0E0]"
      >
        <div class="flex items-start justify-between gap-2">
          <div class="flex items-center gap-3 min-w-0">
            <div class="p-2.5 bg-accent-light border border-accent/30 rounded shrink-0">
              <Tag :size="18" class="text-accent" />
            </div>
            <div class="min-w-0">
              <p class="font-black text-[#212121] text-base tracking-widest font-mono truncate">{{ coupon.code }}</p>
              <p v-if="coupon.description" class="text-[#757575] text-xs mt-0.5 truncate">{{ coupon.description }}</p>
            </div>
          </div>
          <span class="px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest border shrink-0" :class="statusOf(coupon).cls">
            {{ statusOf(coupon).label }}
          </span>
        </div>

        <div class="flex items-center gap-2 p-3 bg-gray-50 rounded border border-[#E0E0E0]">
          <component :is="coupon.type === 'percent' ? BadgePercent : DollarSign" :size="16" class="text-accent shrink-0" />
          <span class="text-accent font-black text-xl">
            {{ coupon.type === 'percent' ? coupon.value + '%' : formatCurrency(coupon.value) }}
          </span>
          <span class="text-[#757575] text-xs ml-1">{{ coupon.type === 'percent' ? 'de desconto' : 'fixo' }}</span>
        </div>

        <div class="flex items-center gap-2 text-xs" :class="isExpired(coupon) ? 'text-danger' : 'text-[#757575]'">
          <Calendar :size="13" />
          <span v-if="!coupon.expiresAt">Sem data de validade</span>
          <span v-else-if="isExpired(coupon)">Vencido em {{ formatDate(coupon.expiresAt) }}</span>
          <span v-else>Válido até {{ formatDate(coupon.expiresAt) }}</span>
        </div>

        <div class="flex items-center justify-end pt-3 border-t border-[#E0E0E0] mt-auto">
          <div class="flex gap-1">
            <button @click="openEdit(coupon)" class="p-2 text-[#757575] hover:text-[#212121] hover:bg-gray-50 rounded transition-all" title="Editar">
              <Edit :size="16" />
            </button>
            <button @click="requestDelete(coupon)" class="p-2 text-[#757575] hover:text-danger hover:bg-danger-light rounded transition-all" title="Excluir">
              <Trash2 :size="16" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <FormModal
      :show="showModal"
      :title="isEditing ? 'Editar Cupom' : 'Novo Cupom'"
      :isLoading="isLoading"
      :saveLabel="isEditing ? 'Salvar Alterações' : 'Criar Cupom'"
      size="md"
      @close="showModal = false"
      @save="save"
    >
      <div class="flex flex-col gap-5">
        <BaseInput
          v-model="form.code"
          label="Código do Cupom"
          placeholder="Ex: BEMVINDO10"
          :maxlength="30"
          :error="errors.code"
          @input="form.code = form.code.toUpperCase()"
        />
        <BaseInput
          v-model="form.description"
          label="Descrição (opcional)"
          placeholder="Ex: Cupom de boas-vindas"
          :maxlength="80"
        />
        <div class="flex gap-4">
          <BaseSelect
            v-model="form.type"
            label="Tipo"
            :options="typeOptions"
            class="flex-1"
            @update:modelValue="form.value = ''"
          />
          <div class="flex-1">
            <BaseInput
              :modelValue="form.value"
              :label="form.type === 'percent' ? 'Desconto (%)' : 'Desconto (R$)'"
              :placeholder="form.type === 'percent' ? '0' : '0,00'"
              :error="errors.value"
              @input="onValueInput"
            >
              <template #suffix>
                <span class="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-[#757575] pointer-events-none">
                  {{ form.type === 'percent' ? '%' : 'R$' }}
                </span>
              </template>
            </BaseInput>
          </div>
        </div>
        <div class="flex flex-col gap-1">
          <BaseInput
            v-model="form.expiresAt"
            type="date"
            label="Data de Validade (opcional)"
            :error="errors.expiresAt"
          />
          <p v-if="!errors.expiresAt" class="text-[#757575] text-[10px] ml-2">Deixe em branco para cupom sem validade.</p>
        </div>
      </div>
    </FormModal>

    <ConfirmModal :confirm-modal="confirmState" @close="closeConfirm" />
  </main>
</template>