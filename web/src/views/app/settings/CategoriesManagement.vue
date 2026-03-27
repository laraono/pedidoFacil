<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useMenuStore } from '@/stores/productsManagement.js';
import { useToast } from '@/composables/useToast';
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import ConfirmModal from '@/components/ui/ConfirmModal.vue';
import {
  ArrowLeft, PlusCircle, Edit, Image as ImageIcon,
  X, Archive, RotateCcw, Trash2,
} from 'lucide-vue-next';

const router = useRouter();
const menuStore = useMenuStore();
const { showToast } = useToast();

const showModal = ref(false);
const isEditing = ref(false);
const isLoading = ref(false);
const showDeleted = ref(false);

const displayedCategories = computed(() =>
  showDeleted.value ? menuStore.deletedCategories : menuStore.activeCategories
);

const errors = ref({});
const touched = ref({});

const form = ref({ id: null, name: '', image: null, imagePreview: null });

const confirmModal = ref({
  show: false, title: '', message: '', onConfirm: null, data: null, isError: false,
});

const showConfirm = (title, message, onConfirm, data = null, options = {}) => {
  confirmModal.value = { show: true, title, message, onConfirm, data, isError: options.isError || false };
};

const validateField = (field) => {
  if (field === 'name') {
    errors.value.name = !form.value.name.trim() ? 'O nome da categoria é obrigatório.' : '';
    if (!errors.value.name) delete errors.value.name;
  }
};

const touchField = (field) => {
  touched.value[field] = true;
  validateField(field);
};

const openAddModal = () => {
  isEditing.value = false;
  form.value = { id: null, name: '', image: null, imagePreview: null };
  errors.value = {};
  touched.value = {};
  showModal.value = true;
};

const openEditModal = (category) => {
  isEditing.value = true;
  form.value = { id: category.id, name: category.name, image: category.image, imagePreview: category.image };
  errors.value = {};
  touched.value = {};
  showModal.value = true;
};

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    form.value.imagePreview = URL.createObjectURL(file);
    form.value.image = form.value.imagePreview;
  }
};

const saveCategory = () => {
  touchField('name');
  if (Object.keys(errors.value).length) return;

  isLoading.value = true;
  try {
    const payload = { id: form.value.id, name: form.value.name, image: form.value.image };
    if (isEditing.value) {
      menuStore.updateCategory(payload);
    } else {
      menuStore.addCategory(payload);
    }
    showToast(`Categoria "${form.value.name}" salva com sucesso!`, 'success');
    showModal.value = false;
  } catch {
    showToast('Erro ao salvar categoria.', 'error');
  } finally {
    isLoading.value = false;
  }
};

const handleDelete = (category) => {
  const hasProducts = menuStore.activeProducts?.some(p => String(p.categoryId) === String(category.id));
  if (hasProducts) {
    showConfirm(
      'Ação Bloqueada',
      `Não é possível arquivar "${category.name}" pois existem produtos vinculados. Remova ou altere a categoria dos produtos primeiro.`,
      null, null, { isError: true }
    );
    return;
  }
  showConfirm('Arquivar Categoria', `Deseja arquivar "${category.name}"?`, (cat) => {
    const result = menuStore.softDeleteCategory(cat.id);
    if (result && !result.success) showConfirm('Erro', result.message, null, null, { isError: true });
  }, category);
};

const handleRestore = (category) => {
  showConfirm('Restaurar Categoria', `Restaurar "${category.name}"?`, (cat) => menuStore.restoreCategory(cat.id), category);
};

const handlePermanentDelete = (category) => {
  showConfirm('Excluir Permanentemente', `Esta ação é irreversível! "${category.name}" será excluída.`, (cat) => menuStore.permanentlyDeleteCategory(cat.id), category);
};
</script>

<template>
  <main class="max-w-6xl mx-auto py-12 px-6 font-inter">
    
    <header class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-6">
      <div class="flex items-center gap-4">
        <button @click="router.back()" class="p-3 bg-white/5 border border-white/10 rounded-2xl text-gray-400 hover:text-white transition-colors">
          <ArrowLeft :size="20" />
        </button>
        <div>
          <h1 class="text-3xl font-black text-white">Gerenciar Categorias</h1>
          <p class="text-gray-400 text-sm">Controle de categorias de produtos do cardápio</p>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <button
          @click="showDeleted = !showDeleted"
          class="px-5 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all font-bold text-sm border w-full sm:w-auto"
          :class="showDeleted ? 'bg-white/10 text-white border-white/20' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'"
        >
          <Archive :size="18" />
          {{ showDeleted ? 'Ver Ativas' : 'Ver Arquivadas' }}
        </button>

        <BaseButton v-if="!showDeleted" @click="openAddModal" :icon="PlusCircle" class="w-full sm:w-auto">
          Nova Categoria
        </BaseButton>
      </div>
    </header>

    <div v-if="showDeleted" class="mb-8 p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center justify-between">
      <p class="text-orange-400 text-sm font-bold flex items-center gap-2">
        <Archive :size="18" /> Visualizando categorias arquivadas.
      </p>
      <button @click="showDeleted = false" class="text-orange-300 hover:text-orange-100 text-sm font-bold underline transition-colors">
        Voltar para ativas
      </button>
    </div>

    <div class="bg-dark-card border border-white/10 rounded-2xl overflow-x-auto shadow-2xl">
      <table class="w-full text-left border-collapse">
        <thead class="bg-black/20 text-gray-500 uppercase text-[10px] font-black tracking-widest">
          <tr>
            <th class="p-4 sm:p-6 border-b border-white/5 w-20">Ícone</th>
            <th class="p-4 sm:p-6 border-b border-white/5">Nome</th>
            <th class="p-4 sm:p-6 border-b border-white/5 whitespace-nowrap">Status</th>
            <th class="p-4 sm:p-6 border-b border-white/5 text-right whitespace-nowrap">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="displayedCategories.length === 0">
            <td colspan="4" class="p-12 text-center text-gray-600 text-sm font-bold">Nenhuma categoria encontrada.</td>
          </tr>
          <tr
            v-for="cat in displayedCategories"
            :key="cat.id"
            class="hover:bg-white/5 border-b border-white/5 last:border-0 transition-colors"
            :class="{ 'opacity-50 grayscale': cat.deletedAt }"
          >
            <td class="p-4 sm:p-6 w-20">
              <div class="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center overflow-hidden border border-white/10">
                <img v-if="cat.image" :src="cat.image" class="w-full h-full object-cover" />
                <ImageIcon v-else class="text-gray-500" :size="20" />
              </div>
            </td>
            <td class="p-4 sm:p-6 font-bold text-white text-sm sm:text-base truncate max-w-[150px] sm:max-w-none">{{ cat.name }}</td>
            <td class="p-4 sm:p-6 whitespace-nowrap">
              <span v-if="cat.deletedAt" class="px-3 py-1 bg-white/10 text-gray-400 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest">
                {{ new Date(cat.deletedAt).toLocaleDateString() }}
              </span>
              <span v-else class="px-3 py-1 bg-brand-green/10 text-brand-green border border-brand-green/20 rounded-full text-[10px] font-black uppercase tracking-widest">
                Ativa
              </span>
            </td>
            <td class="p-4 sm:p-6 text-right whitespace-nowrap">
              <div class="flex justify-end gap-2">
                <template v-if="!cat.deletedAt">
                  <button @click="openEditModal(cat)" class="p-2 text-gray-400 hover:text-white transition-colors" title="Editar">
                    <Edit :size="18" />
                  </button>
                  <button @click="handleDelete(cat)" class="p-2 text-gray-400 hover:text-orange-400 transition-colors" title="Arquivar">
                    <Archive :size="18" />
                  </button>
                </template>
                <template v-else>
                  <button @click="handleRestore(cat)" class="p-2 text-gray-400 hover:text-brand-green transition-colors" title="Restaurar">
                    <RotateCcw :size="18" />
                  </button>
                  <button @click="handlePermanentDelete(cat)" class="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Deletar permanentemente">
                    <Trash2 :size="18" />
                  </button>
                </template>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showModal" class="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div class="bg-dark-card border border-white/10 w-full max-w-md rounded-[2.5rem] flex flex-col shadow-2xl overflow-hidden">
            
            <header class="p-8 border-b border-white/5 flex justify-between items-center bg-black/20">
              <h2 class="text-2xl font-black text-white flex items-center gap-3">
                <Edit :size="24" class="text-brand-green" />
                {{ isEditing ? 'Editar Categoria' : 'Nova Categoria' }}
              </h2>
              <button @click="showModal = false" class="p-2 text-gray-400 hover:text-white transition-colors">
                <X :size="24" />
              </button>
            </header>

            <div class="p-8 space-y-6">
              <div class="flex justify-center">
                <label class="cursor-pointer group relative w-32 h-32 bg-white/5 rounded-full flex items-center justify-center overflow-hidden border-2 border-dashed border-white/20 hover:border-brand-green/50 transition-all">
                  <img v-if="form.imagePreview" :src="form.imagePreview" class="w-full h-full object-cover" />
                  <div v-else class="flex flex-col items-center text-gray-500">
                    <ImageIcon :size="32" />
                    <span class="text-[10px] font-black uppercase tracking-widest mt-2">Ícone</span>
                  </div>
                  <div class="absolute inset-0 bg-black/60 transition-all flex items-center justify-center text-white opacity-0 group-hover:opacity-100 font-bold text-xs uppercase tracking-wider backdrop-blur-sm">
                    Alterar
                  </div>
                  <input type="file" class="hidden" accept="image/*" @change="handleImageUpload" />
                </label>
              </div>

              <BaseInput
                v-model="form.name"
                label="Nome da Categoria"
                placeholder="Ex: Bebidas"
                :error="errors.name"
                @blur="touchField('name')"
                @input="() => { if (touched.name) validateField('name'); }"
              />
            </div>

            <footer class="p-8 border-t border-white/5 bg-black/20 flex justify-end gap-4">
              <button @click="showModal = false" class="px-6 py-3 rounded-2xl text-gray-400 font-bold hover:bg-white/5 hover:text-white transition-colors">
                Cancelar
              </button>
              <BaseButton @click="saveCategory" :isLoading="isLoading" class="px-8">
                {{ isEditing ? 'Salvar Alterações' : 'Criar Categoria' }}
              </BaseButton>
            </footer>
          </div>
        </div>
      </Transition>
    </Teleport>

    <ConfirmModal :confirmModal="confirmModal" @close="confirmModal.show = false" />
  </main>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
