<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useMenuStore } from '@/stores/productsManagement.js';
import { 
  ArrowLeft, PlusCircle, Edit, 
  Image as ImageIcon, X, Plus, Trash2, Search,
  Archive, RotateCcw 
} from 'lucide-vue-next';

const router = useRouter();
const menuStore = useMenuStore();

const searchQuery = ref('');
const filterCategory = ref('');
const showDeleted = ref(false);

const errors = ref({});
const touched = ref({});

const showModal = ref(false);
const isEditing = ref(false);

const confirmModal = ref({
  show: false,
  title: '',
  message: '',
  onConfirm: null,
  data: null,
  isError: false
});

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const defaultForm = {
  id: null,
  name: '',
  description: '',
  categoryId: '',
  image: null,
  imagePreview: null,
  isAvailable: false,
  sizes: [{ name: 'Padrão', price: 0 }],
  addons: []
};

const form = ref({ ...defaultForm });

const filteredProducts = computed(() => {
  const source = showDeleted.value ? menuStore.deletedProducts : menuStore.activeProducts;
  const query = searchQuery.value.toLowerCase().trim();
  
  return source.filter(product => {
    const nameMatch = product.name.toLowerCase().includes(query);
    const descMatch = (product.description || '').toLowerCase().includes(query);
    const matchesSearch = query === '' || nameMatch || descMatch;
    
    const productCat = String(product.categoryId);
    const selectedCat = filterCategory.value;
    const matchesCategory = selectedCat === '' || productCat === selectedCat;
    
    return matchesSearch && matchesCategory;
  });
});

const formatCurrency = (value) => {
  return currencyFormatter.format(value);
};


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
      errors.value.name = 'O título do produto é obrigatório.';
    } else {
      delete errors.value.name;
    }
  }
  else if (field === 'categoryId') {
    if (!form.value.categoryId) {
      errors.value.categoryId = 'Selecione uma categoria.';
    } else {
      delete errors.value.categoryId;
    }
  }
  else if (field === 'image') {
    if (!isEditing.value && !form.value.image) {
      errors.value.image = 'A imagem é obrigatória para novos produtos.';
    } else {
      delete errors.value.image;
    }
  }
  else if (field === 'sizes') {
    const invalidSize = form.value.sizes.some(s => !s.name.trim() || s.price <= 0);
    if (invalidSize) {
      errors.value.sizes = 'Cada tamanho deve ter um nome e um preço maior que zero.';
    } else {
      delete errors.value.sizes;
    }
  }
};

const touchField = (field) => {
  touched.value[field] = true;
  validateField(field);
};

const updatePrice = (index, event, type = 'sizes') => {
  let rawValue = event.target.value.replace(/\D/g, '');
  if (rawValue === '') rawValue = '0';
  const floatValue = parseFloat(rawValue) / 100;
  
  if (type === 'sizes') {
    form.value.sizes[index].price = floatValue;
  } else {
    form.value.addons[index].price = floatValue;
  }
};

const openAddModal = () => {
  isEditing.value = false;
  form.value = JSON.parse(JSON.stringify(defaultForm));
  form.value.categoryId = menuStore.categories?.length ? menuStore.categories[0].id : '';
  errors.value = {};
  touched.value = {};
  showModal.value = true;
};

const openEditModal = (product) => {
  isEditing.value = true;
  form.value = JSON.parse(JSON.stringify(product));
  form.value.imagePreview = product.image;
  errors.value = {};
  touched.value = {};
  showModal.value = true;
};

const addSize = () => {
  form.value.sizes.push({ name: '', price: 0 });
};

const removeSize = (index) => {
  if (form.value.sizes.length > 1) {
    form.value.sizes.splice(index, 1);
    if (touched.value.sizes) validateField('sizes');
  } else {
    showConfirm('Aviso', 'O produto deve ter pelo menos um tamanho/preço.', null, null, { isError: true });
  }
};

const addAddon = () => {
  form.value.addons.push({ name: '', price: 0 });
};

const removeAddon = (index) => {
  form.value.addons.splice(index, 1);
};

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    form.value.imagePreview = URL.createObjectURL(file);
    form.value.image = form.value.imagePreview;
    if (touched.value.image) validateField('image');
  }
};

const saveProduct = () => {
  touchField('name');
  touchField('categoryId');
  touchField('image');
  touchField('sizes');

  if (Object.keys(errors.value).length) {
    const firstErrorField = Object.keys(errors.value)[0];
    document.querySelector(`[name="${firstErrorField}"]`)?.focus();
    return;
  }
  
  if (isEditing.value) {
    menuStore.updateProduct(form.value);
  } else {
    menuStore.addProduct(form.value);
  }
  showModal.value = false;
};

const handleSoftDelete = (product) => {
  showConfirm(
    'Arquivar Produto',
    `Deseja arquivar o produto "${product.name}"?`,
    (prod) => {
      menuStore.softDeleteProduct(prod.id);
    },
    product
  );
};

const handleRestore = (product) => {
  showConfirm(
    'Restaurar Produto',
    `Restaurar produto "${product.name}"?`,
    (prod) => {
      menuStore.restoreProduct(prod.id);
    },
    product
  );
};

const handlePermanentDelete = (product) => {
  showConfirm(
    'Excluir Permanentemente',
    `Tem certeza? Esta ação é irreversível! O produto "${product.name}" será excluído permanentemente.`,
    (prod) => {
      menuStore.permanentlyDeleteProduct(prod.id);
    },
    product
  );
};
</script>

<template>
   <main class="max-w-6xl mx-auto py-12 px-4">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
      <div class="flex items-center">
        <button @click="router.back()" class="p-2 text-gray-500 hover:text-gray-800 mr-2 sm:mr-4">
          <ArrowLeft :size="24" class="sm:w-[30px] sm:h-[30px]" />
        </button>
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">Gerenciar Produtos</h1>
      </div>
      
      <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <button 
          @click="showDeleted = !showDeleted"
          class="px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors w-full sm:w-auto"
          :class="showDeleted 
            ? 'bg-gray-600 text-white hover:bg-gray-700' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
        >
          <Archive :size="20" />
          {{ showDeleted ? 'Ver Ativos' : 'Ver Arquivados' }}
        </button>

        <button 
          v-if="!showDeleted"
          @click="openAddModal" 
          class="bg-brand-green hover:bg-brand-green-hover text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 shadow-lg"
        >
          <PlusCircle :size="20" />
          <span class="text-sm sm:text-base">Novo Produto</span>
        </button>
      </div>
    </div>

    <div class="flex flex-col sm:flex-row gap-4 mb-6">
      <div class="flex-1 relative">
        <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" :size="20" />
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Buscar por nome ou descrição..." 
          class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900"
        />
      </div>
      
      <select 
        v-model="filterCategory" 
        class="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
      >
        <option value="">Todas as categorias</option>
        <option v-for="cat in menuStore.activeCategories" :key="cat.id" :value="String(cat.id)">
          {{ cat.name }}
        </option>
      </select>
    </div>

    <div v-if="showDeleted" class="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <p class="text-yellow-800 flex items-center">
        <Archive class="mr-2" :size="20" />
        Você está visualizando produtos arquivados.
        <button @click="showDeleted = false" class="ml-2 text-blue-600 hover:underline">
          Ver ativos
        </button>
      </p>
    </div>

    <div class="bg-white rounded-xl shadow-lg border border-gray-200 overflow-x-auto">
      <table class="w-full text-left border-collapse min-w-[740px]">
        <thead class="bg-gray-50 text-gray-600 uppercase text-xs sm:text-sm font-semibold">
          <tr>
            <th class="p-2 sm:p-4 border-b w-16">Imagem</th>
            <th class="p-2 sm:p-4 border-b">Produto</th>
            <th class="p-2 sm:p-4 border-b whitespace-nowrap">Categoria</th>
            <th class="p-2 sm:p-4 border-b whitespace-nowrap">Preço (Base)</th>
            <th class="p-2 sm:p-4 border-b text-center whitespace-nowrap">Disponível</th>
            <th class="p-2 sm:p-4 border-b whitespace-nowrap">Status</th>
            <th class="p-2 sm:p-4 border-b text-right whitespace-nowrap">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="prod in filteredProducts" :key="prod.id" 
              class="hover:bg-gray-50 border-b last:border-0 transition-colors"
              :class="{ 'opacity-60 bg-gray-50': prod.deletedAt }">
            <td class="p-2 sm:p-4 w-16">
              <div class="w-10 h-10 sm:w-16 sm:h-16 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                <img v-if="prod.image" :src="prod.image" class="w-full h-full object-cover" />
                <ImageIcon v-else class="text-gray-400 w-full h-full p-2" />
              </div>
            </td>
            <td class="p-2 sm:p-4">
              <p class="font-bold text-gray-800 text-sm truncate max-w-[120px] sm:max-w-none">{{ prod.name }}</p>
              <p class="text-xs text-gray-500 truncate max-w-[120px] sm:max-w-[200px]">{{ prod.description }}</p>
            </td>
            <td class="p-2 sm:p-4 whitespace-nowrap">
              <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                {{ menuStore.getCategoryName(prod.categoryId) }}
              </span>
            </td>
            <td class="p-2 sm:p-4 text-gray-700 font-mono text-sm whitespace-nowrap">
              {{ formatCurrency(prod.sizes[0]?.price || 0) }}
              <span v-if="prod.sizes.length > 1" class="text-xs text-gray-500">(+{{ prod.sizes.length -1 }})</span>
            </td>
            <td class="p-2 sm:p-4 text-center whitespace-nowrap">
              <div class="flex flex-col items-center">
                <button 
                  @click="menuStore.toggleAvailability(prod.id)"
                  class="relative inline-block w-10 align-middle select-none transition duration-200 ease-in focus:outline-none"
                  :disabled="prod.deletedAt"
                >
                  <div :class="`w-10 h-5 rounded-full p-1 duration-300 ease-in-out ${prod.isAvailable ? 'bg-green-500' : 'bg-gray-300'} ${prod.deletedAt ? 'opacity-50 cursor-not-allowed' : ''}`">
                    <div :class="`bg-white w-3 h-3 rounded-full shadow-md transform duration-300 ease-in-out ${prod.isAvailable ? 'translate-x-5' : 'translate-x-0'}`"></div>
                  </div>
                </button>
                <span class="text-[8px] mt-1 font-semibold uppercase" :class="prod.isAvailable ? 'text-green-600' : 'text-gray-400'">
                  {{ prod.isAvailable ? 'Ativo' : 'Inativo' }}
                </span>
              </div>
            </td>
            <td class="p-2 sm:p-4 whitespace-nowrap">
              <span v-if="prod.deletedAt" class="px-2 py-1 bg-gray-200 text-gray-700 rounded-full text-xs">
                Arquivado
              </span>
              <span v-else class="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                Ativo
              </span>
            </td>
            <td class="p-2 sm:p-4 text-right whitespace-nowrap">
              <div class="flex justify-end gap-1 sm:gap-2">
                <template v-if="!prod.deletedAt">
                  <button @click="openEditModal(prod)" class="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Editar">
                    <Edit :size="16" class="sm:w-5 sm:h-5" />
                  </button>
                  <button @click="handleSoftDelete(prod)" class="p-1.5 sm:p-2 text-orange-600 hover:bg-orange-50 rounded-lg" title="Arquivar">
                    <Archive :size="16" class="sm:w-5 sm:h-5" />
                  </button>
                </template>
                <template v-else>
                  <button @click="handleRestore(prod)" class="p-1.5 sm:p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Restaurar">
                    <RotateCcw :size="16" class="sm:w-5 sm:h-5" />
                  </button>
                  <button @click="handlePermanentDelete(prod)" class="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Deletar permanentemente">
                    <Trash2 :size="16" class="sm:w-5 sm:h-5" />
                  </button>
                </template>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-3xl my-4 sm:my-8 overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh]">
        
        <div class="p-4 sm:p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 class="text-lg sm:text-xl font-bold text-gray-800">{{ isEditing ? 'Editar Produto' : 'Novo Produto' }}</h2>
          <button @click="showModal = false" class="text-gray-400 hover:text-gray-600"><X :size="20" class="sm:w-6 sm:h-6" /></button>
        </div>
        
        <div class="p-4 sm:p-8 overflow-y-auto custom-scrollbar">
          <div class="flex flex-col md:grid md:grid-cols-3 gap-6 md:gap-8">
            
            <div class="md:col-span-1">
              <label class="block text-gray-600 font-semibold mb-2 text-sm sm:text-base">
                Imagem <span v-if="!isEditing" class="text-red-500">*</span>
              </label>
              <div 
                class="relative w-full aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors flex items-center justify-center overflow-hidden cursor-pointer group"
                :class="{ 'border-red-500': errors.image }"
              >
                <img v-if="form.imagePreview" :src="form.imagePreview" class="w-full h-full object-cover" />
                <div v-else class="flex flex-col items-center text-gray-400">
                  <ImageIcon :size="32" class="sm:w-10 sm:h-10" />
                  <span class="text-xs sm:text-sm mt-2">Upload</span>
                </div>
                <input 
                  type="file" 
                  name="image"
                  class="absolute inset-0 opacity-0 cursor-pointer" 
                  accept="image/*" 
                  @change="handleImageUpload"
                />
              </div>
              <p v-if="errors.image" class="text-red-500 text-xs mt-1">{{ errors.image }}</p>

              <div class="mt-4 sm:mt-6">
                <label class="block text-gray-600 font-semibold mb-2 text-sm sm:text-base">Disponibilidade</label>
                <div class="flex items-center cursor-pointer" @click="form.isAvailable = !form.isAvailable">
                  <div :class="`w-12 sm:w-14 h-6 sm:h-7 rounded-full p-1 duration-300 ease-in-out ${form.isAvailable ? 'bg-green-500' : 'bg-gray-300'}`">
                      <div :class="`bg-white w-4 sm:w-5 h-4 sm:h-5 rounded-full shadow-md transform duration-300 ease-in-out ${form.isAvailable ? 'translate-x-6 sm:translate-x-7' : 'translate-x-0'}`"></div>
                  </div>
                  <span class="ml-2 sm:ml-3 text-xs sm:text-sm font-medium text-gray-700">{{ form.isAvailable ? 'Visível no menu' : 'Indisponível' }}</span>
                </div>
                <p v-if="!isEditing" class="text-xs text-gray-400 mt-1">Desativado por padrão na criação.</p>
              </div>
            </div>

            <div class="md:col-span-2 space-y-4 sm:space-y-5">
              
              <div>
                <label class="block text-gray-600 font-semibold mb-1 text-sm sm:text-base">
                  Título <span class="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  v-model="form.name" 
                  name="name"
                  maxlength="60"
                  @blur="touchField('name')"
                  @input="() => { if(touched.name) validateField('name'); }"
                  :class="{ 'border-red-500': errors.name }"
                  placeholder="Ex: X-Salada" 
                  class="text-gray-900 w-full p-2 text-sm sm:text-base border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500" 
                />
                <p v-if="errors.name" class="text-red-500 text-xs mt-1">{{ errors.name }}</p>
              </div>

              <div>
                <label class="block text-gray-600 font-semibold mb-1 text-sm sm:text-base">
                  Categoria <span class="text-red-500">*</span>
                </label>
                <select 
                  v-model="form.categoryId" 
                  name="categoryId"
                  @blur="touchField('categoryId')"
                  @change="() => { if(touched.categoryId) validateField('categoryId'); }"
                  :class="{ 'border-red-500': errors.categoryId }"
                  class="text-gray-900 w-full p-2 text-sm sm:text-base border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option disabled value="">Selecione...</option>
                  <option v-for="cat in menuStore.activeCategories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                </select>
                <p v-if="errors.categoryId" class="text-red-500 text-xs mt-1">{{ errors.categoryId }}</p>
              </div>

              <div>
                <label class="block text-gray-600 font-semibold mb-1 text-sm sm:text-base">Descrição</label>
                <textarea v-model="form.description" rows="3" maxlength="200" placeholder="Ingredientes e detalhes..." class="w-full p-2 text-sm sm:text-base border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-gray-900"></textarea>
              </div>

              <div class="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-100">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                  <label class="block text-blue-800 font-bold text-xs sm:text-sm">Preços e Tamanhos</label>
                  <button @click="addSize" type="button" class="text-xs text-blue-600 hover:underline flex items-center"><Plus :size="14" class="mr-1"/> Adicionar Tamanho</button>
                </div>
                <div v-for="(size, index) in form.sizes" :key="index" class="flex flex-col sm:flex-row gap-2 mb-2 items-start sm:items-center">
                  <input 
                    type="text" 
                    v-model="size.name" 
                    maxlength="30"
                    placeholder="Ex: Padrão, Grande..." 
                    class="text-gray-900 w-full sm:flex-1 p-2 text-sm border border-gray-300 rounded" 
                  />
                  <div class="relative w-full sm:w-32">
                    <span class="absolute left-2 top-2 text-gray-500 text-sm">R$</span>
                    <input 
                      type="text"
                      :value="currencyFormatter.format(size.price)"
                      @input="updatePrice(index, $event, 'sizes')"
                      @blur="touchField('sizes')"
                      class="text-gray-900 w-full pl-8 p-2 text-sm border border-gray-300 rounded" 
                      placeholder="0,00"
                    />
                  </div>
                  <button @click="removeSize(index)" type="button" class="text-red-400 hover:text-red-600 self-end sm:self-center" title="Remover tamanho"><Trash2 :size="16" /></button>
                </div>
                <p v-if="errors.sizes" class="text-red-500 text-xs mt-1">{{ errors.sizes }}</p>
              </div>

              <div class="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                  <label class="block text-gray-700 font-bold text-xs sm:text-sm">Adicionais (Opcional)</label>
                  <button @click="addAddon" type="button" class="text-xs text-blue-600 hover:underline flex items-center"><Plus :size="14" class="mr-1"/> Adicionar Item</button>
                </div>
                <div v-for="(addon, index) in form.addons" :key="index" class="flex flex-col sm:flex-row gap-2 mb-2 items-start sm:items-center">
                  <input 
                    type="text" 
                    v-model="addon.name" 
                    maxlength="30"
                    placeholder="Ex: Bacon Extra" 
                    class="text-gray-900 w-full sm:flex-1 p-2 text-sm border border-gray-300 rounded" 
                  />
                  <div class="relative w-full sm:w-32">
                    <span class="absolute left-2 top-2 text-gray-500 text-sm">R$</span>
                    <input 
                      type="text"
                      :value="currencyFormatter.format(addon.price)"
                      @input="updatePrice(index, $event, 'addons')"
                      class="text-gray-900 w-full pl-8 p-2 text-sm border border-gray-300 rounded" 
                      placeholder="0,00"
                    />
                  </div>
                  <button @click="removeAddon(index)" type="button" class="text-red-400 hover:text-red-600 self-end sm:self-center"><Trash2 :size="16" /></button>
                </div>
                <p v-if="form.addons.length === 0" class="text-xs text-gray-400 italic">Nenhum adicional configurado.</p>
              </div>

            </div>
          </div>
        </div>

        <div class="p-4 sm:p-6 border-t border-gray-100 bg-gray-50 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
          <button @click="showModal = false" class="w-full sm:w-auto px-4 sm:px-6 py-2 text-gray-600 font-semibold hover:bg-gray-200 rounded-lg transition-colors text-sm sm:text-base">Cancelar</button>
          <button @click="saveProduct" class="w-full sm:w-auto px-6 sm:px-8 py-2 bg-brand-green text-white font-bold rounded-lg hover:bg-brand-green-hover transition-colors shadow-md text-sm sm:text-base">
            {{ isEditing ? 'Salvar Alterações' : 'Criar Produto' }}
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

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>