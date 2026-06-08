<script setup>
import { ref, onMounted } from 'vue';
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

onMounted(() => {
  store.loadData();
});

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
    const num = Math.min(99, parseInt(digits, 10) || 0);
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
  
  if (form.value.type === 'percent' && parsed >= 100) {
    e.value = 'O percentual de desconto deve ser de no máximo 99%.';
  }
  
  if (form.value.expiresAt) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(`${form.value.expiresAt}T12:00:00`);
    if (selectedDate < today) {
      e.expiresAt = 'A data não pode ser anterior a hoje.';
    }
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
    active: c.active !== false,
  };
  errors.value = {};
  showModal.value = true;
};

const save = async () => {
  errors.value = {};

  if (!validate()) { 
    const firstErrorMsg = Object.values(errors.value)[0];
    showToast(firstErrorMsg || 'Corrija os erros no formulário.', 'error'); 
    return; 
  }
  
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
    
    if (isEditing.value) await store.updateCoupon(payload); 
    else await store.addCoupon(payload);
    
    showToast(isEditing.value ? 'Cupom atualizado!' : 'Cupom criado!', 'success');
    showModal.value = false;
  } catch (error) { 
    const data = error.response?.data || error.data || error;
    
    if (data?.errors && Array.isArray(data.errors)) {
      data.errors.forEach((err) => {
        let field = err.campo.replace("body.", "");
        errors.value[field] = err.mensagem;
      });
      showToast("Verifique os campos destacados em vermelho.", "error"); 
    } else {
      showToast(data?.message || "Erro ao salvar cupom.", "error"); 
    }
  } finally { 
    isLoading.value = false; 
  }
};

const toggleActive = (c) => {
  store.updateCoupon({ ...c, active: !c.active });
  showToast(c.active !== false ? `${c.code} desativado.` : `${c.code} ativado.`, 'success');
};

const doDelete = async () => {
  if (!confirmDelete.value) return;
  await store.removeCoupon(confirmDelete.value.id);
  showToast(`Cupom ${confirmDelete.value.code} excluído.`, 'success');
  confirmDelete.value = null;
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('T')[0].split('-');
  return `${day}/${month}/${year}`;
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

    <div v-if="store.coupons.length === 0" class="flex flex-col items-center justify-center py-20 text-[#757575]">
      <Tag :size="48" class="mb-4 opacity-20" />
      <p class="font-black uppercase tracking-widest text-sm opacity-40">Nenhum cupom cadastrado</p>
    </div>

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
            {{ coupon.type === 'percent' ? coupon.value + '%' : 'R$ ' + Number(coupon.value).toFixed(2) }}
          </span>
          <span class="text-[#757575] text-xs ml-1">{{ coupon.type === 'percent' ? 'de desconto' : 'fixo' }}</span>
        </div>

        <div class="flex items-center gap-2 text-xs" :class="isExpired(coupon) ? 'text-danger' : 'text-[#757575]'">
          <Calendar :size="13" />
          <span v-if="!coupon.expiresAt">Sem data de validade</span>
          <span v-else-if="isExpired(coupon)">Vencido em {{ formatDate(coupon.expiresAt) }}</span>
          <span v-else>Válido até {{ formatDate(coupon.expiresAt) }}</span>
        </div>

        <div class="flex items-center justify-between pt-3 border-t border-[#E0E0E0] mt-auto">
          <button
            @click="toggleActive(coupon)"
            class="flex items-center gap-1.5 text-xs font-bold transition-colors"
            :class="coupon.active !== false ? 'text-accent hover:opacity-70' : 'text-[#757575] hover:text-[#757575]'"
          >
            <Power :size="13" />
            {{ coupon.active !== false ? 'Ativo' : 'Inativo' }}
          </button>
          <div class="flex gap-1">
            <button @click="openEdit(coupon)" class="p-2 text-[#757575] hover:text-[#212121] hover:bg-gray-50 rounded transition-all" title="Editar">
              <Edit :size="16" />
            </button>
            <button @click="confirmDelete = coupon" class="p-2 text-[#757575] hover:text-danger hover:bg-danger-light rounded transition-all" title="Excluir">
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
            <label class="text-xs font-black text-[#757575] uppercase tracking-widest ml-2">Tipo</label>
            <select
              v-model="form.type"
              @change="form.value = ''"
              class="w-full py-3.5 px-4 rounded border bg-gray-50 border-[#E0E0E0] text-[#212121] focus:outline-none focus:border-primary/50 transition-all appearance-none"
            >
              <option value="percent" class="bg-white">Percentual (%)</option>
              <option value="fixed" class="bg-white">Valor fixo (R$)</option>
            </select>
          </div>
          <div class="flex-1 flex flex-col gap-1">
            <label class="text-xs font-black text-[#757575] uppercase tracking-widest ml-2">
              {{ form.type === 'percent' ? 'Desconto (%)' : 'Desconto (R$)' }}
            </label>
            <div class="relative">
              <input
                :value="form.value"
                @input="onValueInput"
                inputmode="numeric"
                :placeholder="form.type === 'percent' ? '0' : '0,00'"
                class="w-full py-3.5 px-4 rounded border bg-gray-50 border-[#E0E0E0] text-[#212121] focus:outline-none focus:border-primary/50 transition-all pr-10"
                :class="errors.value ? '!border-red-500' : ''"
              />
              <span class="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-[#757575] pointer-events-none">
                {{ form.type === 'percent' ? '%' : 'R$' }}
              </span>
            </div>
            <p v-if="errors.value" class="text-danger text-[11px] font-bold mt-0.5 ml-2">{{ errors.value }}</p>
          </div>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-black text-[#757575] uppercase tracking-widest ml-2">Data de Validade (opcional)</label>
          <input
            v-model="form.expiresAt"
            type="date"
            class="w-full py-3.5 px-4 rounded border bg-gray-50 border-[#E0E0E0] text-[#212121] focus:outline-none focus:border-primary/50 transition-all"
            :class="errors.expiresAt ? '!border-red-500' : ''"
          />
          <p v-if="errors.expiresAt" class="text-danger text-[11px] font-bold mt-0.5 ml-2">{{ errors.expiresAt }}</p>
          <p v-else class="text-[#757575] text-[10px] ml-2">Deixe em branco para cupom sem validade.</p>
        </div>
        <div class="flex items-center justify-between p-4 bg-gray-50 rounded border border-[#E0E0E0]">
          <div>
            <p class="text-sm font-bold text-[#212121]">Cupom ativo</p>
            <p class="text-xs text-[#757575]">Cupons inativos não podem ser usados no caixa</p>
          </div>
          <button
            type="button"
            @click="form.active = !form.active"
            class="relative inline-flex h-7 w-12 items-center rounded transition-colors duration-300"
            :class="form.active ? 'bg-accent' : 'bg-gray-600'"
          >
            <span class="inline-block h-5 w-5 transform rounded bg-white transition-transform duration-300" :class="form.active ? 'translate-x-6' : 'translate-x-1'" />
          </button>
        </div>
      </div>
    </FormModal>

    <Teleport to="body">
      <Transition name="fade">
        <div v-if="confirmDelete" class="fixed inset-0 bg-black/50  z-[110] flex items-center justify-center p-4">
          <div class="bg-white border border-[#E0E0E0] w-full max-w-sm rounded p-8 shadow-2xl">
            <div class="flex items-start gap-4 mb-6">
              <div class="p-3 bg-danger-light rounded border border-danger shrink-0">
                <Trash2 :size="20" class="text-danger" />
              </div>
              <div>
                <p class="text-[#212121] font-black text-base">Excluir cupom?</p>
                <p class="text-[#757575] text-sm mt-1">O cupom <span class="text-[#212121] font-bold font-mono">{{ confirmDelete.code }}</span> será removido permanentemente.</p>
              </div>
            </div>
            <div class="flex gap-3">
              <button @click="confirmDelete = null" class="flex-1 py-3 rounded text-[#757575] font-bold hover:bg-gray-50 transition-colors border border-[#E0E0E0]">Cancelar</button>
              <button @click="doDelete" class="flex-1 py-3 rounded bg-danger text-white font-black hover:bg-red-400 transition-colors">Excluir</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </main>
</template>

<style scoped>
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>