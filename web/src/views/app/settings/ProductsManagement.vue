<script setup>
import { ref, computed } from "vue";
import { useMenuStore } from "@/stores/productsManagement.js";
import { useToast } from "@/composables/useToast";
import { useConfirm } from "@/composables/useConfirm";
import BaseButton from "@/components/ui/BaseButton.vue";
import BaseInput from "@/components/ui/BaseInput.vue";
import DataTable from "@/components/ui/DataTable.vue";
import FormModal from "@/components/ui/FormModal.vue";
import ConfirmModal from "@/components/ui/ConfirmModal.vue";
import PageHeader from "@/components/ui/PageHeader.vue";
import ToastMessage from "@/components/ui/ToastMessage.vue";
import { PlusCircle, Edit, Archive, RotateCcw, Trash2, Image as ImageIcon, Layers, CheckSquare, Square, TrendingUp, TrendingDown, ToggleLeft, FolderInput, X } from "lucide-vue-next";

const menuStore = useMenuStore();
const { showToast } = useToast();
const { confirmState, showConfirm } = useConfirm();

const showDeleted = ref(false);
const showModal = ref(false);
const isEditing = ref(false);
const isLoading = ref(false);
const errors = ref({});
const form = ref({ id: null, name: "", description: "", price: "", categoryId: "", image: null, imagePreview: null, available: true, sizes: [] });

const displayedProducts = computed(() => showDeleted.value ? menuStore.deletedProducts : menuStore.activeProducts);
const sortedProducts = computed(() => {
  const list = [...displayedProducts.value];
  if (sortMode.value === 'alpha') return list.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  if (sortMode.value === 'category-alpha') return list.sort((a, b) => {
    const ca = menuStore.getCategoryName(a.categoryId);
    const cb = menuStore.getCategoryName(b.categoryId);
    if (ca !== cb) return ca.localeCompare(cb, 'pt-BR');
    return a.name.localeCompare(b.name, 'pt-BR');
  });
  return list;
});
const categoryOptions = computed(() => menuStore.activeCategories.map(c => ({ label: c.name, value: c.id })));

// ── Bulk edition ──────────────────────────────────────────────────────────────
const bulkMode = ref(false);
const sortMode = ref('none'); // 'none' | 'alpha' | 'category-alpha'
const selectedIds = ref([]);
const bulkAction = ref('');       // 'price_increase' | 'price_decrease' | 'availability' | 'category' | 'delete'
const bulkPriceValue = ref('');
const bulkPriceType = ref('percent');  // 'percent' | 'fixed'
const bulkAvailability = ref(true);
const bulkCategoryId = ref('');
const showBulkConfirm = ref(false);
const bulkConfirmMessage = ref('');

const allSelected = computed(() =>
  displayedProducts.value.length > 0 && displayedProducts.value.every(p => selectedIds.value.includes(p.id))
);

const toggleBulkMode = () => {
  bulkMode.value = !bulkMode.value;
  selectedIds.value = [];
  bulkAction.value = '';
  bulkPriceValue.value = '';
};

const toggleSelect = (id) => {
  const idx = selectedIds.value.indexOf(id);
  if (idx === -1) selectedIds.value.push(id);
  else selectedIds.value.splice(idx, 1);
};

const toggleSelectAll = () => {
  if (allSelected.value) selectedIds.value = [];
  else selectedIds.value = displayedProducts.value.map(p => p.id);
};

const isSelected = (id) => selectedIds.value.includes(id);

const applyBulkPriceMask = (raw) => {
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
const onBulkPriceInput = (e) => { bulkPriceValue.value = applyBulkPriceMask(e.target.value); };

const applyBulk = () => {
  if (selectedIds.value.length === 0) { showToast('Selecione ao menos um produto.', 'error'); return; }
  if (!bulkAction.value) { showToast('Selecione uma ação.', 'error'); return; }
  const count = selectedIds.value.length;
  if (bulkAction.value === 'price_increase' || bulkAction.value === 'price_decrease') {
    const val = parseFloat(String(bulkPriceValue.value).replace(',', '.'));
    if (!bulkPriceValue.value || isNaN(val) || val <= 0) { showToast('Informe um valor válido para o ajuste de preço.', 'error'); return; }
    const dir = bulkAction.value === 'price_increase' ? 'Aumentar' : 'Reduzir';
    bulkConfirmMessage.value = `${dir} o preço de ${count} produto(s) em ${bulkPriceValue.value}${bulkPriceType.value === 'percent' ? '%' : ' R$'}?`;
  } else if (bulkAction.value === 'availability') {
    bulkConfirmMessage.value = `Marcar ${count} produto(s) como ${bulkAvailability.value ? 'disponíveis' : 'indisponíveis'}?`;
  } else if (bulkAction.value === 'category') {
    if (!bulkCategoryId.value) { showToast('Selecione uma categoria.', 'error'); return; }
    const cat = categoryOptions.value.find(c => c.value === bulkCategoryId.value);
    bulkConfirmMessage.value = `Mover ${count} produto(s) para a categoria "${cat?.label}"?`;
  } else if (bulkAction.value === 'delete') {
    bulkConfirmMessage.value = `Arquivar ${count} produto(s) selecionado(s)? Eles poderão ser restaurados.`;
  }
  showBulkConfirm.value = true;
};

const executeBulk = () => {
  const ids = [...selectedIds.value];
  const prods = displayedProducts.value.filter(p => ids.includes(p.id));
  for (const p of prods) {
    if (bulkAction.value === 'price_increase' || bulkAction.value === 'price_decrease') {
      const val = parseFloat(String(bulkPriceValue.value).replace(',', '.')) || 0;
      const basePrice = p.price ?? (p.sizes?.[0]?.price ?? 0);
      let newPrice;
      if (bulkPriceType.value === 'percent') {
        newPrice = bulkAction.value === 'price_increase' ? basePrice * (1 + val / 100) : basePrice * (1 - val / 100);
      } else {
        newPrice = bulkAction.value === 'price_increase' ? basePrice + val : basePrice - val;
      }
      newPrice = Math.max(0, parseFloat(newPrice.toFixed(2)));
      menuStore.updateProduct({ ...p, price: newPrice });
    } else if (bulkAction.value === 'availability') {
      menuStore.updateProduct({ ...p, available: bulkAvailability.value });
    } else if (bulkAction.value === 'category') {
      menuStore.updateProduct({ ...p, categoryId: bulkCategoryId.value });
    } else if (bulkAction.value === 'delete') {
      menuStore.softDeleteProduct(p.id);
    }
  }
  showToast(`${ids.length} produto(s) atualizado(s) com sucesso!`, 'success');
  showBulkConfirm.value = false;
  selectedIds.value = [];
  bulkMode.value = false;
};

// ── Individual actions ────────────────────────────────────────────────────────
const validate = () => {
  const e = {};
  if (!form.value.name?.trim()) e.name = "Nome do produto é obrigatório.";
  const price = parseFloat(String(form.value.price).replace(",", "."));
  if (form.value.sizes.length === 0 && (!form.value.price || isNaN(price) || price <= 0)) e.price = "Preço inválido.";
  if (!form.value.categoryId) e.categoryId = "Selecione uma categoria.";
  const badSize = form.value.sizes.some(s => s.name.trim() && (isNaN(parseFloat(String(s.price).replace(',', '.'))) || parseFloat(String(s.price).replace(',', '.')) <= 0));
  if (badSize) e.sizes = "Informe um preço válido para cada tamanho.";
  errors.value = e;
  return Object.keys(e).length === 0;
};

const openAdd = () => { isEditing.value = false; form.value = { id: null, name: "", description: "", price: "", categoryId: "", image: null, imagePreview: null, available: true, sizes: [] }; errors.value = {}; showModal.value = true; };
const openEdit = (p) => { isEditing.value = true; form.value = { id: p.id, name: p.name, description: p.description || "", price: p.price != null ? String(p.price).replace('.', ',') : "", categoryId: p.categoryId, image: p.image, imagePreview: p.image, available: p.available !== false, sizes: p.sizes ? p.sizes.map(s => ({ name: s.name, price: String(s.price).replace('.', ',') })) : [] }; errors.value = {}; showModal.value = true; };

const addSize = () => form.value.sizes.push({ name: '', price: '' });
const removeSize = (i) => form.value.sizes.splice(i, 1);
const handleImageUpload = (e) => { const file = e.target.files[0]; if (!file) return; const url = URL.createObjectURL(file); form.value.imagePreview = url; form.value.image = url; };

const applyPriceMask = (raw) => {
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

const onPriceInput = (e) => { form.value.price = applyPriceMask(e.target.value); };
const onSizePriceInput = (e, i) => { form.value.sizes[i].price = applyPriceMask(e.target.value); };

const save = () => {
  if (!validate()) { showToast("Corrija os erros no formulário.", "error"); return; }
  isLoading.value = true;
  try {
    const parsedSizes = form.value.sizes
      .filter(s => s.name.trim())
      .map(s => ({ name: s.name.trim(), price: parseFloat(String(s.price).replace(',', '.')) || 0 }));
    const payload = { id: form.value.id, name: form.value.name, description: form.value.description, price: parseFloat(String(form.value.price).replace(",", ".")), categoryId: form.value.categoryId, image: form.value.image, available: form.value.available, sizes: parsedSizes };
    if (isEditing.value) menuStore.updateProduct(payload); else menuStore.addProduct(payload);
    showToast(isEditing.value ? "Produto atualizado!" : "Produto criado!", "success");
    showModal.value = false;
  } catch { showToast("Erro ao salvar produto.", "error"); } finally { isLoading.value = false; }
};

const handleDelete = (p) => showConfirm({ title: "Arquivar Produto", message: "Arquivar " + p.name + "?", onConfirm: () => { menuStore.softDeleteProduct(p.id); showToast(p.name + " arquivado.", "success"); } });
const handleRestore = (p) => showConfirm({ title: "Restaurar Produto", message: "Restaurar " + p.name + "?", onConfirm: () => { menuStore.restoreProduct(p.id); showToast(p.name + " restaurado.", "success"); } });
const handlePermanentDelete = (p) => showConfirm({ title: "Excluir Permanentemente", message: "Excluir " + p.name + " para sempre?", onConfirm: () => { menuStore.permanentlyDeleteProduct(p.id); showToast(p.name + " excluído.", "success"); } });

const tableColumns = computed(() => {
  const base = [ { key: "image", label: "Foto" }, { key: "name", label: "Produto", sortable: true }, { key: "category", label: "Categoria" }, { key: "price", label: "Preço" }, { key: "status", label: "Status" } ];
  if (bulkMode.value) return [{ key: 'select', label: '' }, ...base];
  return base;
});
const tableActions = computed(() => bulkMode.value ? [] : [
  { icon: Edit,    tooltip: "Editar",    handler: openEdit,             condition: (p) => !p.deletedAt },
  { icon: Archive, tooltip: "Arquivar",  handler: handleDelete,         condition: (p) => !p.deletedAt, class: "text-gray-400 hover:text-orange-400 hover:bg-orange-500/10 p-2 rounded-xl transition-all" },
  { icon: RotateCcw, tooltip: "Restaurar", handler: handleRestore,      condition: (p) =>  p.deletedAt, class: "text-gray-400 hover:text-brand-green hover:bg-brand-green/10 p-2 rounded-xl transition-all" },
  { icon: Trash2,  tooltip: "Excluir",   handler: handlePermanentDelete, condition: (p) => p.deletedAt, class: "text-gray-400 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-xl transition-all" },
]);
</script>

<template>
  <main class="max-w-6xl mx-auto py-12 px-6 font-inter">
    <ToastMessage />
    <PageHeader title="Gerenciar Produtos" subtitle="Controle do cardápio">
      <template #actions>
        <button @click="showDeleted = !showDeleted" class="px-5 py-3 rounded-2xl flex items-center gap-2 font-bold text-sm border transition-all" :class="showDeleted ? 'bg-white/10 text-white border-white/20' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'">
          <Archive :size="18" /> {{ showDeleted ? 'Ver Ativos' : 'Ver Arquivados' }}
        </button>
        <button
          v-if="!showDeleted"
          @click="toggleBulkMode"
          class="px-5 py-3 rounded-2xl flex items-center gap-2 font-bold text-sm border transition-all"
          :class="bulkMode ? 'bg-brand-green/10 text-brand-green border-brand-green/30' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'"
        >
          <Layers :size="18" /> {{ bulkMode ? 'Cancelar Lote' : 'Edição em Lote' }}
        </button>
        <BaseButton v-if="!showDeleted && !bulkMode" @click="openAdd" :icon="PlusCircle">Novo Produto</BaseButton>
      </template>
    </PageHeader>

    <div v-if="showDeleted" class="mb-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center justify-between">
      <p class="text-orange-400 text-sm font-bold flex items-center gap-2"><Archive :size="16" /> Visualizando produtos arquivados.</p>
      <button @click="showDeleted = false" class="text-orange-300 hover:text-orange-100 text-sm font-bold underline">Voltar para ativos</button>
    </div>

    <!-- Bulk action bar -->
    <div v-if="bulkMode" class="mb-5 bg-dark-card border border-brand-green/20 rounded-[2rem] p-5 flex flex-col gap-4">
      <!-- Selection controls -->
      <div class="flex items-center justify-between flex-wrap gap-3">
        <div class="flex items-center gap-3">
          <button @click="toggleSelectAll" class="flex items-center gap-2 text-sm font-bold transition-colors" :class="allSelected ? 'text-brand-green' : 'text-gray-400 hover:text-white'">
            <component :is="allSelected ? CheckSquare : Square" :size="18" />
            {{ allSelected ? 'Desmarcar todos' : 'Selecionar todos' }}
          </button>
          <span v-if="selectedIds.length > 0" class="px-3 py-1 bg-brand-green/10 text-brand-green border border-brand-green/20 rounded-full text-xs font-black">
            {{ selectedIds.length }} selecionado(s)
          </span>
        </div>
        <button @click="toggleBulkMode" class="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors">
          <X :size="14" /> Cancelar
        </button>
      </div>

      <!-- Action chooser -->
      <div class="flex flex-wrap gap-2">
        <button v-for="opt in [
          { key: 'price_increase', icon: TrendingUp, label: 'Aumentar Preço' },
          { key: 'price_decrease', icon: TrendingDown, label: 'Reduzir Preço' },
          { key: 'availability', icon: ToggleLeft, label: 'Disponibilidade' },
          { key: 'category', icon: FolderInput, label: 'Categoria' },
          { key: 'delete', icon: Archive, label: 'Arquivar' },
        ]" :key="opt.key"
          @click="bulkAction = opt.key"
          class="flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold border transition-all"
          :class="bulkAction === opt.key ? 'bg-brand-green/10 text-brand-green border-brand-green/30' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/8 hover:text-white'"
        >
          <component :is="opt.icon" :size="15" />
          {{ opt.label }}
        </button>
      </div>

      <!-- Action parameters -->
      <div v-if="bulkAction === 'price_increase' || bulkAction === 'price_decrease'" class="flex items-end gap-3 flex-wrap">
        <div class="flex flex-col gap-1">
          <label class="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Tipo</label>
          <select v-model="bulkPriceType" class="py-2.5 px-3 rounded-2xl border bg-white/5 border-white/15 text-white text-sm focus:outline-none focus:border-brand-green/50 transition-all appearance-none">
            <option value="percent" class="bg-zinc-900">Percentual (%)</option>
            <option value="fixed" class="bg-zinc-900">Valor fixo (R$)</option>
          </select>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
            {{ bulkAction === 'price_increase' ? 'Acréscimo' : 'Decréscimo' }}
          </label>
          <div class="relative">
            <input
              :value="bulkPriceValue"
              @input="onBulkPriceInput"
              inputmode="numeric"
              :placeholder="bulkPriceType === 'percent' ? '0' : '0,00'"
              class="py-2.5 px-4 pr-10 rounded-2xl border bg-white/5 border-white/15 text-white text-sm focus:outline-none focus:border-brand-green/50 transition-all w-32"
            />
            <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-gray-500 pointer-events-none">
              {{ bulkPriceType === 'percent' ? '%' : 'R$' }}
            </span>
          </div>
        </div>
        <button @click="applyBulk" class="py-2.5 px-6 bg-brand-green text-black font-black text-sm rounded-2xl hover:opacity-90 transition-opacity">
          Aplicar
        </button>
      </div>

      <div v-else-if="bulkAction === 'availability'" class="flex items-center gap-4 flex-wrap">
        <div class="flex gap-2">
          <button @click="bulkAvailability = true" class="px-4 py-2 rounded-2xl text-sm font-bold border transition-all" :class="bulkAvailability ? 'bg-brand-green/10 text-brand-green border-brand-green/30' : 'bg-white/5 text-gray-400 border-white/10'">Disponível</button>
          <button @click="bulkAvailability = false" class="px-4 py-2 rounded-2xl text-sm font-bold border transition-all" :class="!bulkAvailability ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-white/5 text-gray-400 border-white/10'">Indisponível</button>
        </div>
        <button @click="applyBulk" class="py-2.5 px-6 bg-brand-green text-black font-black text-sm rounded-2xl hover:opacity-90 transition-opacity">
          Aplicar
        </button>
      </div>

      <div v-else-if="bulkAction === 'category'" class="flex items-end gap-3 flex-wrap">
        <div class="flex flex-col gap-1">
          <label class="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Nova categoria</label>
          <select v-model="bulkCategoryId" class="py-2.5 px-3 rounded-2xl border bg-white/5 border-white/15 text-white text-sm focus:outline-none focus:border-brand-green/50 transition-all appearance-none">
            <option value="" disabled class="bg-zinc-900">Selecione...</option>
            <option v-for="opt in categoryOptions" :key="opt.value" :value="opt.value" class="bg-zinc-900">{{ opt.label }}</option>
          </select>
        </div>
        <button @click="applyBulk" class="py-2.5 px-6 bg-brand-green text-black font-black text-sm rounded-2xl hover:opacity-90 transition-opacity">
          Aplicar
        </button>
      </div>

      <div v-else-if="bulkAction === 'delete'" class="flex items-center gap-3">
        <p class="text-sm text-gray-400">Os produtos selecionados serão arquivados e poderão ser restaurados.</p>
        <button @click="applyBulk" class="py-2.5 px-6 bg-orange-500 text-white font-black text-sm rounded-2xl hover:bg-orange-400 transition-colors">
          Arquivar Selecionados
        </button>
      </div>
    </div>

    <!-- Sort controls -->
    <div class="flex items-center gap-2 mb-4 flex-wrap">
      <span class="text-xs font-black text-gray-500 uppercase tracking-widest mr-1">Ordenar:</span>
      <button v-for="opt in [{ v: 'none', l: 'Padrão' }, { v: 'alpha', l: 'A → Z' }, { v: 'category-alpha', l: 'Categoria + A → Z' }]"
        :key="opt.v" @click="sortMode = opt.v"
        class="px-3 py-1.5 rounded-xl text-xs font-bold border transition-all"
        :class="sortMode === opt.v ? 'bg-brand-green/10 text-brand-green border-brand-green/30' : 'bg-white/5 text-gray-500 border-white/10 hover:text-white hover:border-white/20'"
      >{{ opt.l }}</button>
    </div>

    <DataTable :columns="tableColumns" :data="sortedProducts" :actions="tableActions" emptyMessage="Nenhum produto encontrado.">
      <template #cell-select="{ item }">
        <button @click="toggleSelect(item.id)" class="flex items-center justify-center w-8 h-8 rounded-xl transition-colors hover:bg-white/5">
          <component :is="isSelected(item.id) ? CheckSquare : Square" :size="18" :class="isSelected(item.id) ? 'text-brand-green' : 'text-gray-500'" />
        </button>
      </template>
      <template #cell-category="{ item }">
        <span class="text-gray-400 text-xs font-bold">{{ menuStore.getCategoryName(item.categoryId) }}</span>
      </template>
      <template #cell-image="{ item }">
        <div class="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center overflow-hidden border border-white/10">
          <img v-if="item.image" :src="item.image" class="w-full h-full object-cover" />
          <ImageIcon v-else class="text-gray-500" :size="18" />
        </div>
      </template>
      <template #cell-name="{ item }">
        <span class="font-bold text-white" :class="{ 'opacity-50': item.deletedAt }">{{ item.name }}</span>
        <p v-if="item.description" class="text-gray-500 text-xs mt-0.5">{{ item.description }}</p>
      </template>
      <template #cell-price="{ item }">
        <span class="text-brand-green font-black">R$ {{ Number(item.price ?? item.sizes?.[0]?.price ?? 0).toFixed(2) }}</span>
      </template>
      <template #cell-status="{ item }">
        <span v-if="item.deletedAt" class="px-3 py-1 bg-white/10 text-gray-400 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest">Arquivado</span>
        <span v-else-if="item.available === false" class="px-3 py-1 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-full text-[10px] font-black uppercase tracking-widest">Indisponível</span>
        <span v-else class="px-3 py-1 bg-brand-green/10 text-brand-green border border-brand-green/20 rounded-full text-[10px] font-black uppercase tracking-widest">Disponível</span>
      </template>
    </DataTable>

    <FormModal :show="showModal" :title="isEditing ? 'Editar Produto' : 'Novo Produto'" :isLoading="isLoading" :saveLabel="isEditing ? 'Salvar Alterações' : 'Criar Produto'" size="md" @close="showModal = false" @save="save">
      <div class="flex flex-col gap-5">
        <div class="flex justify-center">
          <label class="cursor-pointer group relative w-32 h-32 bg-white/5 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-dashed border-white/20 hover:border-brand-green/50 transition-all">
            <img v-if="form.imagePreview" :src="form.imagePreview" class="w-full h-full object-cover" />
            <div v-else class="flex flex-col items-center text-gray-500 gap-1"><ImageIcon :size="30" /><span class="text-[10px] font-black uppercase tracking-widest">Foto</span></div>
            <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-black uppercase tracking-wider">Alterar</div>
            <input type="file" class="hidden" accept="image/*" @change="handleImageUpload" />
          </label>
        </div>
        <BaseInput v-model="form.name" label="Nome do Produto" placeholder="Ex: X-Burguer Especial" :maxlength="60" :error="errors.name" />
        <BaseInput v-model="form.description" label="Descrição (opcional)" placeholder="Ingredientes, detalhes..." :maxlength="120" />
        <div class="flex flex-col gap-1">
          <label class="text-xs font-black text-gray-300 uppercase tracking-widest ml-2">Preço base (R$)</label>
          <input
            :value="form.price"
            @input="onPriceInput"
            inputmode="numeric"
            placeholder="0,00"
            class="w-full py-3.5 px-4 rounded-2xl border bg-white/5 border-white/15 text-white focus:outline-none focus:border-brand-green/50 transition-all"
            :class="errors.price ? '!border-red-500' : ''"
          />
          <p v-if="errors.price" class="text-red-400 text-[11px] font-bold mt-0.5 ml-2">{{ errors.price }}</p>
          <p class="text-gray-500 text-[10px] ml-2">Usado quando não há tamanhos configurados.</p>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-black text-gray-300 uppercase tracking-widest ml-2">Categoria</label>
          <select v-model="form.categoryId" class="w-full py-3.5 px-4 rounded-2xl border bg-white/5 border-white/15 text-white focus:outline-none focus:border-brand-green/50 transition-all appearance-none" :class="errors.categoryId ? '!border-red-500' : ''">
            <option value="" disabled class="bg-zinc-900">Selecione uma categoria</option>
            <option v-for="opt in categoryOptions" :key="opt.value" :value="opt.value" class="bg-zinc-900">{{ opt.label }}</option>
          </select>
          <p v-if="errors.categoryId" class="text-red-400 text-[11px] font-bold mt-0.5 ml-2">{{ errors.categoryId }}</p>
        </div>
        <div class="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
          <div><p class="text-sm font-bold text-white">Disponível no cardápio</p><p class="text-xs text-gray-500">Clientes poderão pedir este produto</p></div>
          <button type="button" @click="form.available = !form.available" class="relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300" :class="form.available ? 'bg-brand-green' : 'bg-gray-600'">
            <span class="inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300" :class="form.available ? 'translate-x-6' : 'translate-x-1'" />
          </button>
        </div>

        <!-- Tamanhos / Variações -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-bold text-white">Tamanhos / Variações</p>
              <p class="text-xs text-gray-500">Se configurados, substituem o preço base no cardápio</p>
            </div>
            <button type="button" @click="addSize" class="flex items-center gap-1.5 px-3 py-2 bg-brand-green/10 text-brand-green border border-brand-green/20 rounded-xl text-xs font-black hover:bg-brand-green/20 transition-colors">
              <PlusCircle :size="14" /> Adicionar
            </button>
          </div>
          <div v-for="(size, i) in form.sizes" :key="i" class="flex gap-2 items-center">
            <input
              v-model="size.name"
              placeholder="Nome (ex: Grande)"
              class="flex-1 py-2.5 px-3 rounded-xl border bg-white/5 border-white/15 text-white text-sm focus:outline-none focus:border-brand-green/50 transition-all"
            />
            <input
              :value="size.price"
              @input="onSizePriceInput($event, i)"
              inputmode="numeric"
              placeholder="0,00"
              class="w-24 py-2.5 px-3 rounded-xl border bg-white/5 border-white/15 text-white text-sm text-right focus:outline-none focus:border-brand-green/50 transition-all"
            />
            <button type="button" @click="removeSize(i)" class="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all">
              <Trash2 :size="16" />
            </button>
          </div>
          <p v-if="errors.sizes" class="text-red-400 text-[11px] font-bold ml-1">{{ errors.sizes }}</p>
        </div>
      </div>
    </FormModal>

    <ConfirmModal :confirmModal="confirmState" @close="confirmState.show = false" />

    <!-- Bulk confirmation modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showBulkConfirm" class="fixed inset-0 bg-black/80 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <div class="bg-dark-card border border-white/10 w-full max-w-sm rounded-[2rem] p-8 shadow-2xl">
            <div class="flex items-start gap-4 mb-6">
              <div class="p-3 bg-brand-green/10 rounded-2xl border border-brand-green/20 shrink-0">
                <Layers :size="20" class="text-brand-green" />
              </div>
              <div>
                <p class="text-white font-black text-base">Confirmar edição em lote</p>
                <p class="text-gray-400 text-sm mt-1">{{ bulkConfirmMessage }}</p>
              </div>
            </div>
            <div class="flex gap-3">
              <button @click="showBulkConfirm = false" class="flex-1 py-3 rounded-2xl text-gray-400 font-bold hover:bg-white/5 transition-colors border border-white/10">Cancelar</button>
              <button @click="executeBulk" class="flex-1 py-3 rounded-2xl bg-brand-green text-black font-black hover:opacity-90 transition-opacity">Confirmar</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </main>
</template>
