<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from '@/composables/useToast';
import {
  ArrowLeft, ShieldAlert, Plus, Pencil, Trash2, X,
  CheckCircle2, Package, DollarSign, Zap
} from 'lucide-vue-next';
import { adminPlanApi } from '@/services/adminApi';
import { useUtils } from '@/composables/useUtils';

const router = useRouter();
const { showToast } = useToast();
const { formatCurrency } = useUtils();

const plans = ref([]);
const loading = ref(false);
const loadError = ref(false);
const saving = ref(false);
const isModalOpen = ref(false);
const isEditing = ref(false);
const deleteTarget = ref(null);
const confirmDelete = ref(false);

const form = ref({ id: null, name: '', price: '', frequency: 'months', features: '' });
const errors = ref({});

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
  form.value = { id: null, name: '', price: '', frequency: 'months', features: '' };
  errors.value = {};
  isEditing.value = false;
  isModalOpen.value = true;
}

function openEdit(plan) {
  form.value = {
    id: plan.id,
    name: plan.name,
    price: String(plan.price).replace('.', ','),
    frequency: plan.frequency || 'months',
    features: plan.features || '',
  };
  errors.value = {};
  isEditing.value = true;
  isModalOpen.value = true;
}

function validate() {
  const e = {};
  if (!form.value.name.trim()) e.name = 'Nome é obrigatório.';
  const price = parseFloat(String(form.value.price).replace(',', '.'));
  if (!form.value.price || isNaN(price) || price <= 0) e.price = 'Valor inválido.';
  errors.value = e;
  return Object.keys(e).length === 0;
}

async function save() {
  if (!validate()) return;
  saving.value = true;
  const payload = {
    name: form.value.name.trim(),
    price: parseFloat(String(form.value.price).replace(',', '.')),
    frequency: form.value.frequency,
    billingDay: 1,
    features: form.value.features.trim() || undefined,
  };
  try {
    if (isEditing.value) {
      await adminPlanApi.update(form.value.id, payload);
      showToast('Plano atualizado!', 'success');
    } else {
      await adminPlanApi.create(payload);
      showToast('Plano criado!', 'success');
    }
    isModalOpen.value = false;
    await load();
  } catch (e) {
    showToast(e?.message || 'Erro ao salvar plano.', 'error');
  } finally {
    saving.value = false;
  }
}

function askDelete(plan) {
  deleteTarget.value = plan;
  confirmDelete.value = true;
}

async function doDelete() {
  if (!deleteTarget.value) return;
  try {
    await adminPlanApi.delete(deleteTarget.value.id);
    showToast(`Plano "${deleteTarget.value.name}" removido.`, 'success');
    await load();
  } catch (e) {
    showToast('Erro ao remover plano.', 'error');
  } finally {
    confirmDelete.value = false;
    deleteTarget.value = null;
  }
}

const freqLabel = (f) => f === 'anual' ? 'Anual' : 'Mensal';
const freqColor = (f) => f === 'anual'
  ? 'text-purple-400 bg-purple-500/10 border-purple-500/20'
  : 'text-blue-400 bg-blue-500/10 border-blue-500/20';
</script>

<template>
  <main class="max-w-4xl mx-auto py-12 px-6 font-inter">
    <header class="flex items-center justify-between gap-4 mb-10">
      <div class="flex items-center gap-4">
        <button @click="router.push('/app/admin/subscriptions')" class="p-3 bg-gray-50 border border-[#E0E0E0] rounded text-[#757575] hover:text-[#212121] transition-colors">
          <ArrowLeft :size="20" />
        </button>
        <div>
          <div class="flex items-center gap-2 mb-1">
            <ShieldAlert :size="16" class="text-accent" />
            <span class="text-xs font-black text-accent uppercase tracking-widest">Painel Admin</span>
          </div>
          <h1 class="text-3xl font-black text-[#212121]">Planos</h1>
          <p class="text-[#757575] text-sm">CRUD de planos — máximo de 2 planos ativos</p>
        </div>
      </div>
      <button @click="openCreate"
        class="flex items-center gap-2 px-5 py-3 bg-primary text-white font-black rounded hover:bg-primary-dark transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed">
        <Plus :size="16" /> Novo Plano
      </button>
    </header>

    <div v-if="loading" class="py-20 text-center text-[#757575]">Carregando...</div>

    <div v-else-if="loadError" class="py-20 text-center">
      <ShieldAlert :size="40" class="mx-auto mb-4 text-red-400 opacity-60" />
      <p class="text-[#757575] font-bold mb-1">Erro ao carregar planos</p>
      <p class="text-[#757575] text-sm mb-4">Verifique sua conexão e tente novamente.</p>
      <button @click="load" class="px-5 py-2.5 bg-gray-100 border border-[#E0E0E0] text-[#212121] font-black rounded text-sm hover:bg-gray-200 transition-all">
        Tentar Novamente
      </button>
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
              <span class="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border" :class="freqColor(plan.frequency)">
                {{ freqLabel(plan.frequency) }}
              </span>
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
          <span class="text-[#757575] text-sm mb-1">/mês</span>
        </div>
        <div v-if="plan.features" class="border-t border-[#E0E0E0] pt-4">
          <p class="text-xs font-black text-[#757575] uppercase tracking-widest mb-2">Funcionalidades</p>
          <p class="text-sm text-[#757575]">{{ plan.features }}</p>
        </div>
      </div>
    </div>

    <div v-else class="py-20 text-center">
      <Package :size="40" class="mx-auto mb-4 text-[#757575] opacity-30" />
      <p class="text-[#757575] font-bold">Nenhum plano cadastrado</p>
      <button @click="openCreate" class="mt-4 px-5 py-2.5 bg-primary text-white font-black rounded text-sm hover:bg-primary-dark transition-all">
        Criar Primeiro Plano
      </button>
    </div>
  </main>

  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isModalOpen" class="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
        <div class="bg-white border border-[#E0E0E0] w-full max-w-md rounded-xl shadow-2xl">
          <div class="p-6 border-b border-[#E0E0E0] flex justify-between items-center bg-gray-50">
            <h2 class="text-xl font-black text-[#212121] flex items-center gap-3">
              <Package :size="20" class="text-accent" />
              {{ isEditing ? 'Editar Plano' : 'Novo Plano' }}
            </h2>
            <button @click="isModalOpen = false" class="p-2 text-[#757575] hover:text-[#212121]"><X :size="20" /></button>
          </div>
          <div class="p-6 space-y-5">
            <div>
              <label class="text-xs font-black uppercase tracking-widest text-[#757575] ml-1 mb-2 block">Nome do Plano</label>
              <input v-model="form.name" type="text" placeholder="Ex: Plano Profissional"
                class="w-full bg-gray-50 border rounded-lg px-4 py-3 text-sm text-[#212121] outline-none placeholder:text-[#757575] transition-colors"
                :class="errors.name ? 'border-red-400' : 'border-[#E0E0E0] focus:border-primary/40'"
                @input="delete errors.name" />
              <p v-if="errors.name" class="text-red-500 text-xs font-bold mt-1 ml-1">{{ errors.name }}</p>
            </div>
            <div>
              <label class="text-xs font-black uppercase tracking-widest text-[#757575] ml-1 mb-2 block">Valor (R$)</label>
              <div class="relative">
                <DollarSign :size="15" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#757575]" />
                <input v-model="form.price" type="text" inputmode="decimal" placeholder="79,90"
                  class="w-full bg-gray-50 border rounded-lg pl-9 pr-4 py-3 text-sm text-[#212121] outline-none placeholder:text-[#757575] transition-colors"
                  :class="errors.price ? 'border-red-400' : 'border-[#E0E0E0] focus:border-primary/40'"
                  @input="delete errors.price" />
              </div>
              <p v-if="errors.price" class="text-red-500 text-xs font-bold mt-1 ml-1">{{ errors.price }}</p>
            </div>
            <div>
              <label class="text-xs font-black uppercase tracking-widest text-[#757575] ml-1 mb-2 block">Frequência</label>
              <div class="flex gap-3">
                <button v-for="opt in [{ v: 'months', l: 'Mensal' }, { v: 'anual', l: 'Anual' }]" :key="opt.v"
                  @click="form.frequency = opt.v"
                  :class="form.frequency === opt.v ? 'border-primary bg-primary/10 text-primary font-black' : 'border-[#E0E0E0] bg-gray-50 text-[#757575]'"
                  class="flex-1 py-2.5 rounded-lg border text-sm font-bold transition-all">{{ opt.l }}</button>
              </div>
            </div>
            <div>
              <label class="text-xs font-black uppercase tracking-widest text-[#757575] ml-1 mb-2 block">Funcionalidades (opcional)</label>
              <textarea v-model="form.features" rows="3" placeholder="Liste as funcionalidades incluídas..."
                class="w-full bg-gray-50 border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm text-[#212121] outline-none placeholder:text-[#757575] focus:border-primary/40 transition-colors resize-none" />
            </div>
          </div>
          <div class="p-6 pt-0 flex gap-3">
            <button @click="isModalOpen = false" class="flex-1 py-3 rounded-lg text-[#757575] font-bold hover:bg-gray-50 transition-colors">Cancelar</button>
            <button @click="save" :disabled="saving"
              class="flex-1 py-3 rounded-lg bg-primary text-white font-black hover:bg-primary-dark transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              <CheckCircle2 v-if="!saving" :size="16" />
              {{ saving ? 'Salvando...' : (isEditing ? 'Salvar' : 'Criar Plano') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <Teleport to="body">
    <Transition name="fade">
      <div v-if="confirmDelete" class="fixed inset-0 bg-black/50 z-[110] flex items-center justify-center p-4">
        <div class="bg-white border border-[#E0E0E0] w-full max-w-sm rounded-xl shadow-2xl p-8 text-center">
          <div class="w-14 h-14 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-5">
            <Trash2 :size="24" class="text-red-500" />
          </div>
          <h3 class="text-xl font-black text-[#212121] mb-2">Deletar Plano?</h3>
          <p class="text-[#757575] text-sm mb-6">
            O plano <strong>"{{ deleteTarget?.name }}"</strong> e todas as assinaturas vinculadas serão removidos permanentemente.
          </p>
          <div class="flex gap-3">
            <button @click="confirmDelete = false; deleteTarget = null" class="flex-1 py-3 rounded-lg font-bold text-[#757575] border border-[#E0E0E0] hover:bg-gray-50 transition-colors">Cancelar</button>
            <button @click="doDelete" class="flex-1 py-3 rounded-lg bg-red-500 text-white font-black hover:bg-red-600 transition-all">Deletar</button>
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