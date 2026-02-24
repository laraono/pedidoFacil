<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useMenuStore } from '@/stores/productsManagement.js';
import {
  ArrowLeft, PlusCircle, Edit,
  Image as ImageIcon, X, Archive,
  RotateCcw, Trash2
} from 'lucide-vue-next';

const router = useRouter();
const menuStore = useMenuStore();

const showDeleted = ref(false);

const displayedCategories = computed(() =>
  showDeleted.value ? menuStore.deletedCategories : menuStore.activeCategories
);

const showModal = ref(false);
const isEditing = ref(false);

const errors = ref({});
const touched = ref({});

const form = ref({
  id: null,
  name: '',
  image: null,
  imagePreview: null
});

const confirmModal = ref({
  show: false,
  title: '',
  message: '',
  onConfirm: null,
  data: null,
  isError: false
});

const showConfirm = (title, message, onConfirm, data = null, options = {}) => {
  confirmModal.value = {
    show: true,
    title,
    message,
    onConfirm,
    data,
    isError: options.isError || false
  };
};

const closeConfirm = () => {
  confirmModal.value.show = false;
};

const handleConfirm = () => {
  if (confirmModal.value.onConfirm) {
    confirmModal.value.onConfirm(confirmModal.value.data);
  }
    closeConfirm();
};

const validateField = (field) => {
  if (field === 'name') {
    if (!form.value.name.trim()) {
      errors.value.name = 'O nome da categoria é obrigatório.';
    } else {
      delete errors.value.name;
    }
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
  form.value = {
    id: category.id,
    name: category.name,
    image: category.image,
    imagePreview: category.image
  };
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

  if (Object.keys(errors.value).length) {
    document.querySelector('[name="name"]')?.focus();
    return;
  }

  const payload = {
    id: form.value.id,
    name: form.value.name,
    image: form.value.image
  };

  if (isEditing.value) {
    menuStore.updateCategory(payload);
  } else {
    menuStore.addCategory(payload);
  }
  showModal.value = false;
};

const handleDelete = (category) => {
  const hasProducts = menuStore.activeProducts?.some(p => String(p.categoryId) === String(category.id));
  
  if (hasProducts) {
    showConfirm(
      'Ação Bloqueada', 
      `Não é possível arquivar a categoria "${category.name}" pois existem produtos vinculados a ela. Remova ou altere a categoria dos produtos primeiro.`, 
      null, 
      null, 
      { isError: true }
    );
    return;
  }

  showConfirm(
    'Arquivar Categoria',
    `Deseja arquivar a categoria "${category.name}"?`,
    (cat) => {
      const result = menuStore.softDeleteCategory(cat.id);
      if (result && !result.success) {
        showConfirm('Erro', result.message, null, null, { isError: true });
      }
    },
    category
  );
};

const handleRestore = (category) => {
  showConfirm(
    'Restaurar Categoria',
    `Restaurar categoria "${category.name}"?`,
    (cat) => {
      menuStore.restoreCategory(cat.id);
    },
    category
  );
};

const handlePermanentDelete = (category) => {
  showConfirm(
    'Excluir Permanentemente',
    `Tem certeza? Esta ação é irreversível! A categoria "${category.name}" será excluída permanentemente.`,
    (cat) => {
      menuStore.permanentlyDeleteCategory(cat.id);
    },
    category
  );
};
</script>

<template>
  <main class="max-w-6xl mx-auto py-12 px-4">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
      <div class="flex items-center">
        <button @click="router.back()" class="p-2 text-gray-500 hover:text-gray-800 mr-4">
          <ArrowLeft :size="30" />
        </button>
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">Gerenciar Categorias</h1>
      </div>

      <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <button @click="showDeleted = !showDeleted"
          class="px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors w-full sm:w-auto" :class="showDeleted
            ? 'bg-gray-600 text-white hover:bg-gray-700'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'">
          <Archive :size="20" />
          {{ showDeleted ? 'Ver Ativas' : 'Ver Arquivadas' }}
        </button>

        <button v-if="!showDeleted" @click="openAddModal"
          class="bg-brand-green hover:bg-brand-green-hover text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 shadow-lg">
          <PlusCircle :size="20" />
          <span>Nova Categoria</span>
        </button>
      </div>
    </div>

    <div v-if="showDeleted" class="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <p class="text-yellow-800 flex items-center">
        <Archive class="mr-2" :size="20" />
        Você está visualizando categorias arquivadas.
        <button @click="showDeleted = false" class="ml-2 text-blue-600 hover:underline">
          Ver ativas
        </button>
      </p>
    </div>

    <div class="bg-white rounded-xl shadow-lg border border-gray-200 overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead class="bg-gray-50 text-gray-600 uppercase text-sm font-semibold">
          <tr>
            <th class="p-3 sm:p-4 border-b w-16">Ícone</th>
            <th class="p-3 sm:p-4 border-b">Nome</th>
            <th class="p-3 sm:p-4 border-b whitespace-nowrap">Status</th>
            <th class="p-3 sm:p-4 border-b text-right whitespace-nowrap">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="cat in displayedCategories" :key="cat.id"
            class="hover:bg-gray-50 border-b last:border-0 transition-colors"
            :class="{ 'opacity-60 bg-gray-50': cat.deletedAt }">
            <td class="p-3 sm:p-4 w-16">
              <div
                class="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border border-gray-200">
                <img v-if="cat.image" :src="cat.image" class="w-full h-full object-cover" />
                <ImageIcon v-else class="text-gray-400" :size="16" />
              </div>
            </td>
            <td class="p-3 sm:p-4 font-medium text-gray-800 text-sm sm:text-base truncate max-w-[150px] sm:max-w-none">
              {{ cat.name }}
            </td>
            <td class="p-3 sm:p-4 whitespace-nowrap">
              <span v-if="cat.deletedAt" class="px-2 py-1 bg-gray-200 text-gray-700 rounded-full text-xs">
                {{ new Date(cat.deletedAt).toLocaleDateString() }}
              </span>
              <span v-else class="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                Ativa
              </span>
            </td>
            <td class="p-3 sm:p-4 text-right whitespace-nowrap">
              <div class="flex justify-end gap-1 sm:gap-2">
                <template v-if="!cat.deletedAt">
                  <button @click="openEditModal(cat)"
                    class="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                    <Edit :size="18" class="sm:w-5 sm:h-5" />
                  </button>
                  <button @click="handleDelete(cat)"
                    class="p-1.5 sm:p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                    title="Arquivar">
                    <Archive :size="18" class="sm:w-5 sm:h-5" />
                  </button>
                </template>
                <template v-else>
                  <button @click="handleRestore(cat)"
                    class="p-1.5 sm:p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Restaurar">
                    <RotateCcw :size="18" class="sm:w-5 sm:h-5" />
                  </button>
                  <button @click="handlePermanentDelete(cat)"
                    class="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Deletar permanentemente">
                    <Trash2 :size="18" class="sm:w-5 sm:h-5" />
                  </button>
                </template>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div class="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 class="text-xl font-bold text-gray-800">{{ isEditing ? 'Editar Categoria' : 'Nova Categoria' }}</h2>
          <button @click="showModal = false" class="text-gray-400 hover:text-gray-600">
            <X :size="24" />
          </button>
        </div>

        <div class="p-6 space-y-4">
          <div class="flex justify-center">
            <label
              class="cursor-pointer group relative w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors">
              <img v-if="form.imagePreview" :src="form.imagePreview" class="w-full h-full object-cover" />
              <div v-else class="flex flex-col items-center text-gray-400">
                <ImageIcon :size="32" />
                <span class="text-xs mt-1">Ícone</span>
              </div>
              <div
                class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center text-white opacity-0 group-hover:opacity-100 font-bold text-xs">
                Alterar
              </div>
              <input type="file" class="hidden" accept="image/*" @change="handleImageUpload" />
            </label>
          </div>

          <div>
            <label class="block text-gray-600 font-semibold mb-2">Nome da Categoria <span
                class="text-red-500">*</span></label>
            <input type="text" v-model="form.name" name="name" maxlength="50" @blur="touchField('name')"
              @input="() => { if (touched.name) validateField('name'); }" :class="{ 'border-red-500': errors.name }"
              class="text-gray-900 w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: Bebidas" />
            <p v-if="errors.name" class="text-red-500 text-xs mt-1">{{ errors.name }}</p>
          </div>
        </div>

        <div class="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button @click="showModal = false"
            class="px-4 py-2 text-gray-600 font-semibold hover:bg-gray-200 rounded-lg transition-colors">Cancelar</button>
          <button @click="saveCategory"
            class="px-6 py-2 bg-brand-green text-white font-bold rounded-lg hover:bg-brand-green-hover transition-colors">
            {{ isEditing ? 'Salvar Alterações' : 'Criar Categoria' }}
          </button>
        </div>
      </div>
    </div>

     <div v-if="confirmModal.show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden border border-gray-200">
        <div class="p-5 bg-white">
          <h3 class="text-lg font-bold text-gray-900">
            {{ confirmModal.title }}
          </h3>
          <p class="text-sm mt-2 font-medium text-gray-800">
            {{ confirmModal.message }}
          </p>
        </div>
        <div class="px-5 py-3 bg-gray-50 flex justify-end gap-2 border-t border-gray-100">
          <button 
            v-if="!confirmModal.isError" 
            @click="closeConfirm" 
            class="px-4 py-2 text-sm text-gray-700 font-bold hover:bg-gray-200 rounded transition-colors"
          >
            Cancelar
          </button>
          <button 
            @click="handleConfirm" 
            class="px-4 py-2 text-sm text-white font-bold rounded transition-colors shadow-sm"
            :class="confirmModal.isError ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'"
          >
            {{ confirmModal.isError ? 'Entendi' : 'Confirmar' }}
          </button>
        </div>
      </div>
    </div>
  </main>
</template>