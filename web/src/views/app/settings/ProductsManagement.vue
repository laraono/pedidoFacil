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
import { PlusCircle, Edit, Archive, RotateCcw, Trash2, Image as ImageIcon } from "lucide-vue-next";

const menuStore = useMenuStore();
const { showToast } = useToast();
const { confirmState, showConfirm } = useConfirm();

const showDeleted = ref(false);
const showModal = ref(false);
const isEditing = ref(false);
const isLoading = ref(false);
const errors = ref({});
const form = ref({ id: null, name: "", description: "", price: "", categoryId: "", image: null, imagePreview: null, available: true });

const displayedProducts = computed(() => showDeleted.value ? menuStore.deletedProducts : menuStore.activeProducts);
const categoryOptions = computed(() => menuStore.activeCategories.map(c => ({ label: c.name, value: c.id })));

const validate = () => {
  const e = {};
  if (!form.value.name?.trim()) e.name = "Nome do produto é obrigatório.";
  const price = parseFloat(String(form.value.price).replace(",", "."));
  if (!form.value.price || isNaN(price) || price <= 0) e.price = "Preço inválido.";
  if (!form.value.categoryId) e.categoryId = "Selecione uma categoria.";
  errors.value = e;
  return Object.keys(e).length === 0;
};

const openAdd = () => { isEditing.value = false; form.value = { id: null, name: "", description: "", price: "", categoryId: "", image: null, imagePreview: null, available: true }; errors.value = {}; showModal.value = true; };
const openEdit = (p) => { isEditing.value = true; form.value = { id: p.id, name: p.name, description: p.description || "", price: p.price, categoryId: p.categoryId, image: p.image, imagePreview: p.image, available: p.available !== false }; errors.value = {}; showModal.value = true; };
const handleImageUpload = (e) => { const file = e.target.files[0]; if (!file) return; const url = URL.createObjectURL(file); form.value.imagePreview = url; form.value.image = url; };

const save = () => {
  if (!validate()) { showToast("Corrija os erros no formulário.", "error"); return; }
  isLoading.value = true;
  try {
    const payload = { id: form.value.id, name: form.value.name, description: form.value.description, price: parseFloat(String(form.value.price).replace(",", ".")), categoryId: form.value.categoryId, image: form.value.image, available: form.value.available };
    if (isEditing.value) menuStore.updateProduct(payload); else menuStore.addProduct(payload);
    showToast(isEditing.value ? "Produto atualizado!" : "Produto criado!", "success");
    showModal.value = false;
  } catch { showToast("Erro ao salvar produto.", "error"); } finally { isLoading.value = false; }
};

const handleDelete = (p) => showConfirm({ title: "Arquivar Produto", message: "Arquivar " + p.name + "?", onConfirm: () => { menuStore.softDeleteProduct(p.id); showToast(p.name + " arquivado.", "success"); } });
const handleRestore = (p) => showConfirm({ title: "Restaurar Produto", message: "Restaurar " + p.name + "?", onConfirm: () => { menuStore.restoreProduct(p.id); showToast(p.name + " restaurado.", "success"); } });
const handlePermanentDelete = (p) => showConfirm({ title: "Excluir Permanentemente", message: "Excluir " + p.name + " para sempre?", onConfirm: () => { menuStore.permanentlyDeleteProduct(p.id); showToast(p.name + " excluído.", "success"); } });

const tableColumns = [ { key: "image", label: "Foto" }, { key: "name", label: "Produto", sortable: true }, { key: "price", label: "Preço" }, { key: "status", label: "Status" } ];
const tableActions = computed(() => [
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
        <BaseButton v-if="!showDeleted" @click="openAdd" :icon="PlusCircle">Novo Produto</BaseButton>
      </template>
    </PageHeader>
    <div v-if="showDeleted" class="mb-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center justify-between">
      <p class="text-orange-400 text-sm font-bold flex items-center gap-2"><Archive :size="16" /> Visualizando produtos arquivados.</p>
      <button @click="showDeleted = false" class="text-orange-300 hover:text-orange-100 text-sm font-bold underline">Voltar para ativos</button>
    </div>
    <DataTable :columns="tableColumns" :data="displayedProducts" :actions="tableActions" emptyMessage="Nenhum produto encontrado.">
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
        <span class="text-brand-green font-black">R$ {{ Number(item.price).toFixed(2) }}</span>
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
        <BaseInput v-model="form.price" label="Preço (R$)" placeholder="0.00" :error="errors.price" />
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
      </div>
    </FormModal>
    <ConfirmModal :confirmModal="confirmState" @close="confirmState.show = false" />
  </main>
</template>
