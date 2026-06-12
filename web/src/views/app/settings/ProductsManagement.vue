<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { getImageUrl, validateImageFile } from "@/utils/imageUrl";
import { useMenuStore } from "@/stores/productsManagement";
import { useToast } from "@/composables/useToast";
import { useConfirm } from "@/composables/useConfirm";
import { applyPriceMask } from "@/composables/usePriceMask";
import BaseButton from "@/components/ui/BaseButton.vue";
import BaseInput from "@/components/ui/BaseInput.vue";
import BaseSelect from "@/components/ui/BaseSelect.vue";
import DataTable from "@/components/ui/DataTable.vue";
import FormModal from "@/components/ui/FormModal.vue";
import ConfirmModal from "@/components/ui/ConfirmModal.vue";
import PageHeader from "@/components/ui/PageHeader.vue";
import ToastMessage from "@/components/ui/ToastMessage.vue";
import {
  PlusCircle, Edit, EyeOff, Eye, Trash2, Image as ImageIcon,
  Layers, CheckSquare, Square, TrendingUp, TrendingDown, ToggleLeft,
  FolderInput, X, Search, ChevronLeft, ChevronRight
} from "lucide-vue-next";

const menuStore = useMenuStore();
const { showToast } = useToast();
const { confirmState, showConfirm } = useConfirm();

const showModal = ref(false);
const isEditing = ref(false);
const isLoading = ref(false);
const errors = ref({});
const form = ref({ id: null, name: "", description: "", price: "", categoryId: "", imageFile: null, imagePreview: null, available: true, sizes: [] });

const searchQuery = ref("");
const itemsPerPage = ref(8);

const fetchData = async (page = 1) => {
  isLoading.value = true;
  try {
    await menuStore.loadProducts(page, itemsPerPage.value, false, searchQuery.value);
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  await menuStore.loadCategories();
  await fetchData();
});

watch([searchQuery], () => {
  fetchData(1);
});

const displayedProducts = computed(() => menuStore.products);

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

const bulkMode = ref(false);
const sortMode = ref('none');
const selectedIds = ref([]);
const bulkAction = ref('');
const bulkPriceValue = ref('');
const bulkPriceType = ref('percent');
const bulkAvailability = ref(true);
const bulkCategoryId = ref('');

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

const onBulkPriceInput = (e) => { const v = applyPriceMask(e.target.value); e.target.value = v; bulkPriceValue.value = v; };

const applyBulk = () => {
  if (selectedIds.value.length === 0) { showToast('Selecione ao menos um produto.', 'error'); return; }
  if (!bulkAction.value) { showToast('Selecione uma ação.', 'error'); return; }
  const count = selectedIds.value.length;
  let message = '';
  if (bulkAction.value === 'price_increase' || bulkAction.value === 'price_decrease') {
    const val = parseFloat(String(bulkPriceValue.value).replace(',', '.'));
    if (!bulkPriceValue.value || isNaN(val) || val <= 0) { showToast('Informe um valor válido para o ajuste de preço.', 'error'); return; }
    const dir = bulkAction.value === 'price_increase' ? 'Aumentar' : 'Reduzir';
    message = `${dir} o preço de ${count} produto(s) em ${bulkPriceValue.value}${bulkPriceType.value === 'percent' ? '%' : ' R$'}?`;
  } else if (bulkAction.value === 'availability') {
    message = `Marcar ${count} produto(s) como ${bulkAvailability.value ? 'disponíveis' : 'indisponíveis'}?`;
  } else if (bulkAction.value === 'category') {
    if (!bulkCategoryId.value) { showToast('Selecione uma categoria.', 'error'); return; }
    const cat = categoryOptions.value.find(c => c.value === bulkCategoryId.value);
    message = `Mover ${count} produto(s) para a categoria "${cat?.label}"?`;
  } else if (bulkAction.value === 'delete') {
    message = `Inativar ${count} produto(s) selecionado(s)?`;
  }
  showConfirm({ title: 'Confirmar edição em lote', message, onConfirm: executeBulk });
};

const executeBulk = async () => {
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
      await menuStore.updateProduct({ ...p, price: newPrice });
    } else if (bulkAction.value === 'availability') {
      await menuStore.updateProduct({ ...p, available: bulkAvailability.value });
    } else if (bulkAction.value === 'category') {
      await menuStore.updateProduct({ ...p, categoryId: bulkCategoryId.value });
    } else if (bulkAction.value === 'delete') {
      await menuStore.updateProduct({ ...p, available: false });
    }
  }
  
  showToast(`${ids.length} produto(s) atualizado(s) com sucesso!`, 'success');
  selectedIds.value = [];
  bulkMode.value = false;
  fetchData(menuStore.currentPage);
};

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

const openAdd = () => { isEditing.value = false; form.value = { id: null, name: "", description: "", price: "", categoryId: "", imageFile: null, imagePreview: null, available: true, sizes: [] }; errors.value = {}; showModal.value = true; };
const openEdit = (p) => { 
  isEditing.value = true; 
  form.value = { 
    id: p.id, 
    name: p.name, 
    description: p.description || "", 
    price: p.price != null ? String(p.price).replace('.', ',') : "", 
    categoryId: p.categoryId, 
    imageFile: null, 
    imagePreview: getImageUrl(p.image), 
    available: p.available !== false, 
    sizes: p.sizes ? p.sizes.map(s => ({ name: s.name, price: String(s.price).replace('.', ',') })) : [] 
  }; 
  errors.value = {}; 
  showModal.value = true; 
};

const addSize = () => form.value.sizes.push({ name: '', price: '' });
const removeSize = (i) => form.value.sizes.splice(i, 1);

const handleImageUpload = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const error = validateImageFile(file);
  if (error) { showToast(error, "error"); e.target.value = ""; return; }
  form.value.imageFile = file;
  form.value.imagePreview = URL.createObjectURL(file);
};

const onPriceInput = (e) => { const v = applyPriceMask(e.target.value); e.target.value = v; form.value.price = v; };
const onSizePriceInput = (e, i) => { const v = applyPriceMask(e.target.value); e.target.value = v; form.value.sizes[i].price = v; };

const save = async () => {
  errors.value = {};
  if (!validate()) { showToast("Corrija os erros no formulário.", "error"); return; }
  isLoading.value = true;
  try {
    const parsedSizes = form.value.sizes
      .filter(s => s.name.trim())
      .map(s => ({ name: s.name.trim(), price: parseFloat(String(s.price).replace(',', '.')) || 0 }));
    const formData = new FormData();
    if (form.value.id) formData.append('id', form.value.id);
    formData.append('name', form.value.name);
    formData.append('description', form.value.description || "");
    formData.append('price', parseFloat(String(form.value.price).replace(",", ".")));
    formData.append('categoryId', form.value.categoryId);
    formData.append('available', form.value.available);
    formData.append('sizes', JSON.stringify(parsedSizes));
    if (form.value.imageFile) formData.append('imagem', form.value.imageFile);
    
    if (isEditing.value) await menuStore.updateProduct(formData); 
    else await menuStore.addProduct(formData);
    
    showToast(isEditing.value ? "Produto atualizado!" : "Produto criado!", "success");
    showModal.value = false;
    fetchData(menuStore.currentPage);
  } catch (error) { 
    const data = error.response?.data || error.data || error;
    if (data?.errors && Array.isArray(data.errors)) {
      data.errors.forEach((err) => {
        let field = err.campo.replace("body.", "");
        errors.value[field] = err.mensagem;
      });
      showToast("Verifique os campos destacados em vermelho.", "error");
    } else {
      showToast(data?.message || "Erro ao salvar produto.", "error");
    }
  } finally { isLoading.value = false; }
};

const handleDeactivate = (p) => showConfirm({ title: "Inativar Produto", message: "Inativar " + p.name + "?", onConfirm: async () => { await menuStore.updateProduct({ id: p.id, available: false }); showToast(p.name + " inativado.", "success"); fetchData(menuStore.currentPage); } });
const handleReactivate = (p) => showConfirm({ title: "Ativar Produto", message: "Ativar " + p.name + "?", onConfirm: async () => { await menuStore.updateProduct({ id: p.id, available: true }); showToast(p.name + " ativado.", "success"); fetchData(menuStore.currentPage); } });
const handleDelete = (p) => showConfirm({ title: "Excluir Produto", message: "Excluir " + p.name + " definitivamente?", onConfirm: async () => { await menuStore.softDeleteProduct(p.id); showToast(p.name + " excluído.", "success"); fetchData(menuStore.currentPage); } });

const tableColumns = computed(() => {
  const base = [ { key: "image", label: "Foto" }, { key: "name", label: "Produto", sortable: true }, { key: "category", label: "Categoria" }, { key: "price", label: "Preço" }, { key: "status", label: "Status" } ];
  if (bulkMode.value) return [{ key: 'select', label: '' }, ...base];
  return base;
});

const tableActions = computed(() => bulkMode.value ? [] : [
  { icon: Edit, tooltip: "Editar", handler: openEdit, condition: () => true },
  { icon: EyeOff, tooltip: "Inativar", handler: handleDeactivate, condition: (p) => p.available !== false, class: "text-[#757575] hover:text-orange-400 hover:bg-orange-500/10 p-2 rounded transition-all" },
  { icon: Eye, tooltip: "Ativar", handler: handleReactivate, condition: (p) => p.available === false, class: "text-[#757575] hover:text-accent hover:bg-primary-dark/10 p-2 rounded transition-all" },
  { icon: Trash2, tooltip: "Excluir", handler: handleDelete, condition: (p) => p.available === false, class: "text-[#757575] hover:text-red-500 hover:bg-red-500/10 p-2 rounded transition-all" },
]);
</script>

<template>
  <main class="max-w-6xl mx-auto py-12 px-6 font-inter">
    <ToastMessage />
    <PageHeader title="Gerenciar Produtos" subtitle="Controle do cardápio">
      <template #actions>
        <button
          @click="toggleBulkMode"
          class="px-5 py-3 rounded flex items-center gap-2 font-bold text-sm border transition-all"
          :class="bulkMode ? 'bg-accent-light text-accent border-accent/40' : 'bg-white text-[#757575] border-[#E0E0E0] hover:bg-gray-100 hover:text-[#212121]'"
        >
          <Layers :size="18" /> {{ bulkMode ? 'Cancelar Lote' : 'Edição em Lote' }}
        </button>
        <BaseButton v-if="!bulkMode" @click="openAdd" :icon="PlusCircle">Novo Produto</BaseButton>
      </template>
    </PageHeader>

    <div class="mb-6 relative">
      <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search :size="18" class="text-[#757575]" />
      </div>
      <input 
        v-model="searchQuery"
        type="text"
        placeholder="Buscar por nome, descrição ou categoria..."
        class="w-full py-3.5 pl-12 pr-4 rounded-2xl border bg-white border-[#E0E0E0] text-[#212121] focus:outline-none focus:border-accent/50 transition-all shadow-sm"
      />
    </div>

    <div v-if="bulkMode" class="mb-5 bg-white border border-accent/30 rounded p-5 flex flex-col gap-4">
      <div class="flex items-center justify-between flex-wrap gap-3">
        <div class="flex items-center gap-3">
          <button @click="toggleSelectAll" class="flex items-center gap-2 text-sm font-bold transition-colors" :class="allSelected ? 'text-accent' : 'text-[#757575] hover:text-[#212121]'">
            <component :is="allSelected ? CheckSquare : Square" :size="18" />
            {{ allSelected ? 'Desmarcar todos' : 'Selecionar todos' }}
          </button>
          <span v-if="selectedIds.length > 0" class="px-3 py-1 bg-accent-light text-accent border border-accent/30 rounded text-xs font-black">
            {{ selectedIds.length }} selecionado(s)
          </span>
        </div>
        <button @click="toggleBulkMode" class="flex items-center gap-1.5 text-xs text-[#757575] hover:text-[#212121] transition-colors">
          <X :size="14" /> Cancelar
        </button>
      </div>
      <div class="flex flex-wrap gap-2">
        <button v-for="opt in [
          { key: 'price_increase', icon: TrendingUp, label: 'Aumentar Preço' },
          { key: 'price_decrease', icon: TrendingDown, label: 'Reduzir Preço' },
          { key: 'availability', icon: ToggleLeft, label: 'Disponibilidade' },
          { key: 'category', icon: FolderInput, label: 'Categoria' },
          { key: 'delete', icon: EyeOff, label: 'Inativar' },
        ]" :key="opt.key"
          @click="bulkAction = opt.key"
          class="flex items-center gap-2 px-4 py-2 rounded text-sm font-bold border transition-all"
          :class="bulkAction === opt.key ? 'bg-accent-light text-accent border-accent/40' : 'bg-gray-50 text-[#757575] border-[#E0E0E0] hover:bg-white/8 hover:text-[#212121]'"
        >
          <component :is="opt.icon" :size="15" />
          {{ opt.label }}
        </button>
      </div>
      <div v-if="bulkAction === 'price_increase' || bulkAction === 'price_decrease'" class="flex items-end gap-3 flex-wrap">
        <div class="flex flex-col gap-1">
          <label class="text-xs font-black text-[#757575] uppercase tracking-widest ml-1">Tipo</label>
          <select v-model="bulkPriceType" class="py-2.5 px-3 rounded border bg-gray-50 border-[#E0E0E0] text-[#212121] text-sm focus:outline-none focus:border-primary/50 transition-all appearance-none">
            <option value="percent" class="bg-white">Percentual (%)</option>
            <option value="fixed" class="bg-white">Valor fixo (R$)</option>
          </select>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-black text-[#757575] uppercase tracking-widest ml-1">
            {{ bulkAction === 'price_increase' ? 'Acréscimo' : 'Decréscimo' }}
          </label>
          <div class="relative">
            <input :value="bulkPriceValue" @input="onBulkPriceInput" inputmode="numeric" :placeholder="bulkPriceType === 'percent' ? '0' : '0,00'" class="py-2.5 px-4 pr-10 rounded border bg-gray-50 border-[#E0E0E0] text-[#212121] text-sm focus:outline-none focus:border-primary/50 transition-all w-32" />
            <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-[#757575]">
              {{ bulkPriceType === 'percent' ? '%' : 'R$' }}
            </span>
          </div>
        </div>
        <button @click="applyBulk" class="py-2.5 px-6 bg-primary text-white font-black text-sm rounded hover:opacity-90 transition-opacity">Aplicar</button>
      </div>
      <div v-else-if="bulkAction === 'availability'" class="flex items-center gap-4 flex-wrap">
        <div class="flex gap-2">
          <button @click="bulkAvailability = true" class="px-4 py-2 rounded text-sm font-bold border transition-all" :class="bulkAvailability ? 'bg-accent-light text-accent border-accent/40' : 'bg-gray-50 text-[#757575] border-[#E0E0E0]'">Disponível</button>
          <button @click="bulkAvailability = false" class="px-4 py-2 rounded text-sm font-bold border transition-all" :class="!bulkAvailability ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-gray-50 text-[#757575] border-[#E0E0E0]'">Indisponível</button>
        </div>
        <button @click="applyBulk" class="py-2.5 px-6 bg-primary text-white font-black text-sm rounded hover:opacity-90 transition-opacity">Aplicar</button>
      </div>
      <div v-else-if="bulkAction === 'category'" class="flex items-end gap-3 flex-wrap">
        <div class="flex flex-col gap-1">
          <label class="text-xs font-black text-[#757575] uppercase tracking-widest ml-1">Nova categoria</label>
          <select v-model="bulkCategoryId" class="py-2.5 px-3 rounded border bg-gray-50 border-[#E0E0E0] text-[#212121] text-sm focus:outline-none focus:border-primary/50 transition-all appearance-none">
            <option value="" disabled class="bg-white">Selecione...</option>
            <option v-for="opt in categoryOptions" :key="opt.value" :value="opt.value" class="bg-white">{{ opt.label }}</option>
          </select>
        </div>
        <button @click="applyBulk" class="py-2.5 px-6 bg-primary text-white font-black text-sm rounded hover:opacity-90 transition-opacity">Aplicar</button>
      </div>
      <div v-else-if="bulkAction === 'delete'" class="flex items-center gap-3">
        <p class="text-sm text-[#757575]">Os produtos selecionados serão inativados.</p>
        <button @click="applyBulk" class="py-2.5 px-6 bg-orange-500 text-[#212121] font-black text-sm rounded hover:bg-orange-400 transition-colors">Inativar Selecionados</button>
      </div>
    </div>

    <div class="flex items-center gap-2 mb-4 flex-wrap">
      <span class="text-xs font-black text-[#757575] uppercase tracking-widest mr-1">Ordenar:</span>
      <button v-for="opt in [{ v: 'none', l: 'Padrão' }, { v: 'alpha', l: 'A → Z' }, { v: 'category-alpha', l: 'Categoria' }]"
        :key="opt.v" @click="sortMode = opt.v"
        class="px-3 py-1.5 rounded text-xs font-bold border transition-all"
        :class="sortMode === opt.v ? 'bg-accent-light text-accent border-accent/40' : 'bg-white text-[#757575] border-[#E0E0E0] hover:text-[#212121] hover:border-[#E0E0E0]'"
      >{{ opt.l }}</button>
    </div>

    <DataTable :columns="tableColumns" :data="sortedProducts" :actions="tableActions" :isLoading="isLoading" emptyMessage="Nenhum produto encontrado.">
      <template #cell-select="{ item }">
        <button @click="toggleSelect(item.id)" class="flex items-center justify-center w-8 h-8 rounded transition-colors hover:bg-gray-50">
          <component :is="isSelected(item.id) ? CheckSquare : Square" :size="18" :class="isSelected(item.id) ? 'text-accent' : 'text-[#757575]'" />
        </button>
      </template>
      <template #cell-category="{ item }">
        <span class="text-[#757575] text-xs font-bold">{{ menuStore.getCategoryName(item.categoryId) }}</span>
      </template>
      <template #cell-image="{ item }">
        <div class="w-12 h-12 bg-gray-50 rounded flex items-center justify-center overflow-hidden border border-[#E0E0E0]">
          <img v-if="item.image" :src="getImageUrl(item.image)" class="w-full h-full object-cover" />
          <ImageIcon v-else class="text-[#757575]" :size="18" />
        </div>
      </template>
      <template #cell-name="{ item }">
        <span class="font-bold text-[#212121]" :class="{ 'opacity-50': item.available === false }">{{ item.name }}</span>
        <p v-if="item.description" class="text-[#757575] text-xs mt-0.5 truncate max-w-[200px]">{{ item.description }}</p>
      </template>
      <template #cell-price="{ item }">
        <span class="text-accent font-black">R$ {{ Number(item.price ?? item.sizes?.[0]?.price ?? 0).toFixed(2) }}</span>
      </template>
      <template #cell-status="{ item }">
        <span v-if="item.available === false" class="px-3 py-1 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded text-[10px] font-black uppercase tracking-widest">Inativo</span>
        <span v-else class="px-3 py-1 bg-accent-light text-accent border border-accent/30 rounded text-[10px] font-black uppercase tracking-widest">Ativo</span>
      </template>
    </DataTable>

    <div v-if="menuStore.totalPages > 1" class="mt-8 flex items-center justify-center gap-2">
      <button @click="fetchData(menuStore.currentPage - 1)" :disabled="menuStore.currentPage === 1" class="p-2.5 rounded-xl border border-[#E0E0E0] hover:bg-gray-50 disabled:opacity-20 transition-all">
        <ChevronLeft :size="20" />
      </button>
      <div class="flex items-center gap-1">
        <button v-for="page in menuStore.totalPages" :key="page" @click="fetchData(page)" class="w-11 h-11 rounded-xl border text-sm font-bold transition-all shadow-sm" :class="menuStore.currentPage === page ? 'bg-accent text-white border-accent' : 'bg-white text-[#757575] border-[#E0E0E0]'">
          {{ page }}
        </button>
      </div>
      <button @click="fetchData(menuStore.currentPage + 1)" :disabled="menuStore.currentPage === menuStore.totalPages" class="p-2.5 rounded-xl border border-[#E0E0E0] hover:bg-gray-50 disabled:opacity-20 transition-all">
        <ChevronRight :size="20" />
      </button>
    </div>

    <FormModal :show="showModal" :title="isEditing ? 'Editar Produto' : 'Novo Produto'" :isLoading="isLoading" :saveLabel="isEditing ? 'Salvar Alterações' : 'Criar Produto'" size="md" @close="showModal = false" @save="save">
      <div class="flex flex-col gap-5">
        <div class="flex justify-center">
          <label class="cursor-pointer group relative w-32 h-32 bg-gray-50 rounded flex items-center justify-center overflow-hidden border-2 border-dashed border-[#E0E0E0] hover:border-accent/50 transition-all">
            <img v-if="form.imagePreview" :src="form.imagePreview" class="w-full h-full object-cover" />
            <div v-else class="flex flex-col items-center text-[#757575] gap-1"><ImageIcon :size="30" /><span class="text-[10px] font-black uppercase tracking-widest">Foto</span></div>
            <div class="absolute inset-0 bg-gray-100 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[#212121] text-xs font-black uppercase tracking-wider">Alterar</div>
            <input type="file" class="hidden" accept="image/*" @change="handleImageUpload" />
          </label>
        </div>
        <BaseInput v-model="form.name" label="Nome do Produto" placeholder="Ex: X-Burguer Especial" :maxlength="60" :error="errors.name" />
        <BaseInput v-model="form.description" label="Descrição (opcional)" placeholder="Ingredientes, detalhes..." :maxlength="120" :error="errors.description" />
        <div class="flex flex-col gap-1">
          <label class="text-xs font-black text-[#757575] uppercase tracking-widest ml-2">Preço base (R$)</label>
          <input :value="form.price" @input="onPriceInput" inputmode="numeric" placeholder="0,00" class="w-full py-3.5 px-4 rounded border bg-gray-50 border-[#E0E0E0] text-[#212121] focus:outline-none focus:border-primary/50 transition-all" :class="errors.price ? '!border-red-500' : ''" />
          <p v-if="errors.price" class="text-danger text-[11px] font-bold mt-0.5 ml-2">{{ errors.price }}</p>
        </div>
        <BaseSelect
          v-model="form.categoryId"
          label="Categoria"
          :options="categoryOptions"
          :error="errors.categoryId"
          placeholder="Selecione uma categoria"
        />
        <div class="flex items-center justify-between p-4 bg-gray-50 rounded border border-[#E0E0E0]">
          <div><p class="text-sm font-bold text-[#212121]">Disponível no cardápio</p><p class="text-xs text-[#757575]">Clientes poderão pedir este produto</p></div>
          <button type="button" @click="form.available = !form.available" class="relative inline-flex h-7 w-12 items-center rounded transition-colors duration-300" :class="form.available ? 'bg-accent' : 'bg-gray-600'">
            <span class="inline-block h-5 w-5 transform rounded bg-white transition-transform duration-300" :class="form.available ? 'translate-x-6' : 'translate-x-1'" />
          </button>
        </div>
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-bold text-[#212121]">Tamanhos / Variações</p>
              <p class="text-xs text-[#757575]">Substituem o preço base no cardápio</p>
            </div>
            <button type="button" @click="addSize" class="flex items-center gap-1.5 px-3 py-2 bg-accent-light text-accent border border-accent/30 rounded text-xs font-black hover:bg-primary-dark/20 transition-colors">
              <PlusCircle :size="14" /> Adicionar
            </button>
          </div>
          <div v-for="(size, i) in form.sizes" :key="i" class="flex gap-2 items-center">
            <input v-model="size.name" placeholder="Nome" class="flex-1 py-2.5 px-3 rounded border bg-gray-50 border-[#E0E0E0] text-[#212121] text-sm focus:outline-none focus:border-primary/50 transition-all" />
            <input :value="size.price" @input="onSizePriceInput($event, i)" inputmode="numeric" placeholder="0,00" class="w-24 py-2.5 px-3 rounded border bg-gray-50 border-[#E0E0E0] text-[#212121] text-sm text-right focus:outline-none focus:border-primary/50 transition-all" />
            <button type="button" @click="removeSize(i)" class="p-2 text-[#757575] hover:text-danger hover:bg-danger-light rounded transition-all">
              <Trash2 :size="16" />
            </button>
          </div>
        </div>
      </div>
    </FormModal>
    <ConfirmModal :confirmModal="confirmState" @close="confirmState.show = false" />
  </main>
</template>