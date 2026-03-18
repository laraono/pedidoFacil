<script setup>
import { ref } from 'vue';
import { useCouponStore } from '@/stores/coupons';
import { useToast } from '@/composables/useToast';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import FormModal from '@/components/ui/FormModal.vue';
import PageHeader from '@/components/ui/PageHeader.vue';
import ToastMessage from '@/components/ui/ToastMessage.vue';
import { PlusCircle, Edit, Trash2, Tag, Power, Calendar, BadgePercent, DollarSign } from 'lucide-vue-next';

const store = useCouponStore();
const { showToast } = useToast();

const showModal = ref(false);
const isEditing = ref(false);
const isLoading = ref(false);
const errors = ref({});
const confirmDelete = ref(null);

const emptyForm = () => ({ id: null, code: '', description: '', type: 'percent', value: '', expiresAt: '', active: true });
const form = ref(emptyForm());

const applyValueMask = (raw) => {
  let val = String(raw).replace(/[^\d,]/g, '');
  const commaIdx = val.indexOf(',');
  if (commaIdx !== -1) {
    val = val.slice(0, commaIdx + 1) + val.slice(commaIdx + 1).replace(/,/g, '');
    val = val.slice(0, commaIdx + 3);
  }
  const parts = val.split(',');
  parts[0] = parts[0].replace(/^0+(\d)/, '$1');
  return parts.join(',');
};

const onValueInput = (e) => {
  if (form.value.type === 'percent') {
    const digits = e.target.value.replace(/\D/g, '');
    const num = Math.min(100, parseInt(digits, 10) || 0);
    form.value.value = num === 0 ? '' : String(num);
  } else {
    form.value.value = applyValueMask(e.target.value);
  }
};

const validate = () => {
  const e = {};
  if (!form.value.code?.trim()) e.code = 'Código do cupom é obrigatório.';
  const parsed = parseFloat(String(form.value.value).replace(',', '.'));
  if (!form.value.value || isNaN(parsed) || parsed <= 0) e.value = 'Valor do desconto inválido.';
  if (form.value.type === 'percent' && parsed > 100) e.value = 'Percentual não pode exceder 100%.';
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
    active: c.active !== false,
  };
  errors.value = {};
  showModal.value = true;
};

const save = () => {
  if (!validate()) { showToast('Corrija os erros no formulário.', 'error'); return; }
  isLoading.value = true;
  try {
    const parsed = parseFloat(String(form.value.value).replace(',', '.'));
    const payload = {
      id: form.value.id,
      code: form.value.code.trim().toUpperCase(),
      description: form.value.description,
      type: form.value.type,
      value: parsed,
      expiresAt: form.value.expiresAt || null,
      active: form.value.active,
    };
    if (isEditing.value) store.updateCoupon(payload); else store.addCoupon(payload);
    showToast(isEditing.value ? 'Cupom atualizado!' : 'Cupom criado!', 'success');
    showModal.value = false;
  } catch { showToast('Erro ao salvar cupom.', 'error'); } finally { isLoading.value = false; }
};

const toggleActive = (c) => {
  store.updateCoupon({ ...c, active: !c.active });
  showToast(c.active !== false ? `${c.code} desativado.` : `${c.code} ativado.`, 'success');
};

const doDelete = () => {
  if (!confirmDelete.value) return;
  store.removeCoupon(confirmDelete.value.id);
  showToast(`Cupom ${confirmDelete.value.code} excluído.`, 'success');
  confirmDelete.value = null;
};

const isExpired = (c) => c.expiresAt && new Date(c.expiresAt) < new Date();

const statusOf = (c) => {
  if (isExpired(c)) return { label: 'Vencido', cls: 'bg-red-500/10 text-red-400 border-red-500/20' };
  if (c.active === false) return { label: 'Inativo', cls: 'bg-white/10 text-gray-400 border-white/10' };
  return { label: 'Ativo', cls: 'bg-brand-green/10 text-brand-green border-brand-green/20' };
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

    <div v-if="store.coupons.length === 0" class="flex flex-col items-center justify-center py-20 text-gray-600">
      <Tag :size="48" class="mb-4 opacity-20" />
      <p class="font-black uppercase tracking-widest text-sm opacity-40">Nenhum cupom cadastrado</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      <div
        v-for="coupon in store.coupons"
        :key="coupon.id"
        class="bg-dark-card border border-white/10 rounded-[2rem] p-6 flex flex-col gap-4 transition-all hover:border-white/20"
      >
        <div class="flex items-start justify-between gap-2">
          <div class="flex items-center gap-3 min-w-0">
            <div class="p-2.5 bg-brand-green/10 border border-brand-green/20 rounded-2xl shrink-0">
              <Tag :size="18" class="text-brand-green" />
            </div>
            <div class="min-w-0">
              <p class="font-black text-white text-base tracking-widest font-mono truncate">{{ coupon.code }}</p>
              <p v-if="coupon.description" class="text-gray-500 text-xs mt-0.5 truncate">{{ coupon.description }}</p>
            </div>
          </div>
          <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shrink-0" :class="statusOf(coupon).cls">
            {{ statusOf(coupon).label }}
          </span>
        </div>

        <div class="flex items-center gap-2 p-3 bg-white/[0.03] rounded-2xl border border-white/5">
          <component :is="coupon.type === 'percent' ? BadgePercent : DollarSign" :size="16" class="text-brand-green shrink-0" />
          <span class="text-brand-green font-black text-xl">
            {{ coupon.type === 'percent' ? coupon.value + '%' : 'R$ ' + Number(coupon.value).toFixed(2) }}
          </span>
          <span class="text-gray-500 text-xs ml-1">{{ coupon.type === 'percent' ? 'de desconto' : 'fixo' }}</span>
        </div>

        <div class="flex items-center gap-2 text-xs" :class="isExpired(coupon) ? 'text-red-400' : 'text-gray-500'">
          <Calendar :size="13" />
          <span v-if="!coupon.expiresAt">Sem data de validade</span>
          <span v-else-if="isExpired(coupon)">Vencido em {{ new Date(coupon.expiresAt).toLocaleDateString('pt-BR') }}</span>
          <span v-else>Válido até {{ new Date(coupon.expiresAt).toLocaleDateString('pt-BR') }}</span>
        </div>

        <div class="flex items-center justify-between pt-3 border-t border-white/5 mt-auto">
          <button
            @click="toggleActive(coupon)"
            class="flex items-center gap-1.5 text-xs font-bold transition-colors"
            :class="coupon.active !== false ? 'text-brand-green hover:opacity-70' : 'text-gray-500 hover:text-gray-300'"
          >
            <Power :size="13" />
            {{ coupon.active !== false ? 'Ativo' : 'Inativo' }}
          </button>
          <div class="flex gap-1">
            <button @click="openEdit(coupon)" class="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all" title="Editar">
              <Edit :size="16" />
            </button>
            <button @click="confirmDelete = coupon" class="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all" title="Excluir">
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
          <div class="flex-1 flex flex-col gap-1">
            <label class="text-xs font-black text-gray-300 uppercase tracking-widest ml-2">Tipo</label>
            <select
              v-model="form.type"
              @change="form.value = ''"
              class="w-full py-3.5 px-4 rounded-2xl border bg-white/5 border-white/15 text-white focus:outline-none focus:border-brand-green/50 transition-all appearance-none"
            >
              <option value="percent" class="bg-zinc-900">Percentual (%)</option>
              <option value="fixed" class="bg-zinc-900">Valor fixo (R$)</option>
            </select>
          </div>
          <div class="flex-1 flex flex-col gap-1">
            <label class="text-xs font-black text-gray-300 uppercase tracking-widest ml-2">
              {{ form.type === 'percent' ? 'Desconto (%)' : 'Desconto (R$)' }}
            </label>
            <div class="relative">
              <input
                :value="form.value"
                @input="onValueInput"
                inputmode="numeric"
                :placeholder="form.type === 'percent' ? '0' : '0,00'"
                class="w-full py-3.5 px-4 rounded-2xl border bg-white/5 border-white/15 text-white focus:outline-none focus:border-brand-green/50 transition-all pr-10"
                :class="errors.value ? '!border-red-500' : ''"
              />
              <span class="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-gray-500 pointer-events-none">
                {{ form.type === 'percent' ? '%' : 'R$' }}
              </span>
            </div>
            <p v-if="errors.value" class="text-red-400 text-[11px] font-bold mt-0.5 ml-2">{{ errors.value }}</p>
          </div>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-black text-gray-300 uppercase tracking-widest ml-2">Data de Validade (opcional)</label>
          <input
            v-model="form.expiresAt"
            type="date"
            class="w-full py-3.5 px-4 rounded-2xl border bg-white/5 border-white/15 text-white focus:outline-none focus:border-brand-green/50 transition-all"
          />
          <p class="text-gray-500 text-[10px] ml-2">Deixe em branco para cupom sem validade.</p>
        </div>
        <div class="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
          <div>
            <p class="text-sm font-bold text-white">Cupom ativo</p>
            <p class="text-xs text-gray-500">Cupons inativos não podem ser usados no caixa</p>
          </div>
          <button
            type="button"
            @click="form.active = !form.active"
            class="relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300"
            :class="form.active ? 'bg-brand-green' : 'bg-gray-600'"
          >
            <span class="inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300" :class="form.active ? 'translate-x-6' : 'translate-x-1'" />
          </button>
        </div>
      </div>
    </FormModal>

    <Teleport to="body">
      <Transition name="fade">
        <div v-if="confirmDelete" class="fixed inset-0 bg-black/80 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <div class="bg-dark-card border border-white/10 w-full max-w-sm rounded-[2rem] p-8 shadow-2xl">
            <div class="flex items-start gap-4 mb-6">
              <div class="p-3 bg-red-500/10 rounded-2xl border border-red-500/20 shrink-0">
                <Trash2 :size="20" class="text-red-400" />
              </div>
              <div>
                <p class="text-white font-black text-base">Excluir cupom?</p>
                <p class="text-gray-400 text-sm mt-1">O cupom <span class="text-white font-bold font-mono">{{ confirmDelete.code }}</span> será removido permanentemente.</p>
              </div>
            </div>
            <div class="flex gap-3">
              <button @click="confirmDelete = null" class="flex-1 py-3 rounded-2xl text-gray-400 font-bold hover:bg-white/5 transition-colors border border-white/10">Cancelar</button>
              <button @click="doDelete" class="flex-1 py-3 rounded-2xl bg-red-500 text-white font-black hover:bg-red-400 transition-colors">Excluir</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </main>
</template>
