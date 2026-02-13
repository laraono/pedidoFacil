<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useMenuStore } from '@/stores/productsManagement.js';
import { ArrowLeft, PlusCircle, Edit, Trash, Image as ImageIcon, X } from 'lucide-vue-next';

const router = useRouter();
const menuStore = useMenuStore();

const showModal = ref(false);
const isEditing = ref(false);

const form = ref({
  id: null,
  name: '',
  image: null,
  imagePreview: null
});

const openAddModal = () => {
  isEditing.value = false;
  form.value = { id: null, name: '', image: null, imagePreview: null };
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
  if (!form.value.name) return alert('Nome é obrigatório');

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
</script>

<template>
  <main class="max-w-6xl mx-auto py-12 px-4">
    <div class="flex items-center justify-between mb-8">
      <div class="flex items-center">
        <button @click="router.back()" class="p-2 text-gray-500 hover:text-gray-800 mr-4">
          <ArrowLeft :size="30" />
        </button>
        <h1 class="text-3xl font-bold text-gray-800">Gerenciar Categorias</h1>
      </div>
      
      <button @click="openAddModal" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg flex items-center shadow-lg transition-transform hover:scale-105">
        <PlusCircle class="mr-2" :size="24" />
        Nova Categoria
      </button>
    </div>

    <div class="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <table class="w-full text-left border-collapse">
        <thead class="bg-gray-50 text-gray-600 uppercase text-sm font-semibold">
          <tr>
            <th class="p-4 border-b">Ícone</th>
            <th class="p-4 border-b">Nome</th>
            <th class="p-4 border-b text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="cat in menuStore.categories" :key="cat.id" class="hover:bg-gray-50 border-b last:border-0 transition-colors">
            <td class="p-4">
              <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border border-gray-200">
                <img v-if="cat.image" :src="cat.image" class="w-full h-full object-cover" />
                <ImageIcon v-else class="text-gray-400" :size="20" />
              </div>
            </td>
            <td class="p-4 font-medium text-gray-800 text-lg">{{ cat.name }}</td>
            <td class="p-4 text-right space-x-2">
              <button @click="openEditModal(cat)" class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                <Edit :size="20" />
              </button>
              <button @click="menuStore.removeCategory(cat.id)" class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Excluir">
                <Trash :size="20" />
              </button>
            </td>
          </tr>
          <tr v-if="menuStore.categories.length === 0">
            <td colspan="3" class="p-8 text-center text-gray-500">Nenhuma categoria cadastrada.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div class="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 class="text-xl font-bold text-gray-800">{{ isEditing ? 'Editar Categoria' : 'Nova Categoria' }}</h2>
          <button @click="showModal = false" class="text-gray-400 hover:text-gray-600"><X :size="24" /></button>
        </div>
        
        <div class="p-6 space-y-4">
          <div class="flex justify-center">
             <label class="cursor-pointer group relative w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors">
                <img v-if="form.imagePreview" :src="form.imagePreview" class="w-full h-full object-cover" />
                <div v-else class="flex flex-col items-center text-gray-400">
                  <ImageIcon :size="32" />
                  <span class="text-xs mt-1">Ícone</span>
                </div>
                <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center text-white opacity-0 group-hover:opacity-100 font-bold text-xs">
                  Alterar
                </div>
                <input type="file" class="hidden" accept="image/*" @change="handleImageUpload" />
             </label>
          </div>

          <div>
            <label class="block text-gray-600 font-semibold mb-2">Nome da Categoria <span class="text-red-500">*</span></label>
            <input type="text" v-model="form.name" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Ex: Bebidas" />
          </div>
        </div>

        <div class="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button @click="showModal = false" class="px-4 py-2 text-gray-600 font-semibold hover:bg-gray-200 rounded-lg transition-colors">Cancelar</button>
          <button @click="saveCategory" class="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors">
            {{ isEditing ? 'Salvar Alterações' : 'Criar Categoria' }}
          </button>
        </div>
      </div>
    </div>
  </main>
</template>