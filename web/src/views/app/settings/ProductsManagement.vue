<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useMenuStore } from '@/stores/productsManagement.js';
import {
  ArrowLeft, PlusCircle, Edit,
  Image as ImageIcon, X, Plus, Trash2, Search,
  Archive, RotateCcw
} from 'lucide-vue-next';
import { ConfirmModal } from '@/components/ui/';
// IMPORTANTE: Certifique-se de importar o seu ProductsModal aqui
// import ProductsModal from '@/components/ProductsModal.vue'; 

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

const currentProductData = ref({ ...defaultForm });

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

const openAddModal = () => {
  isEditing.value = false;
  currentProductData.value = JSON.parse(JSON.stringify(defaultForm));
  currentProductData.value.categoryId = menuStore.categories?.length ? menuStore.categories[0].id : '';
  showModal.value = true;
};

const openEditModal = (product) => {
  isEditing.value = true;
  currentProductData.value = JSON.parse(JSON.stringify(product));
  currentProductData.value.imagePreview = product.image;
  showModal.value = true;
};

const handleSaveProduct = (formData) => {
  if (isEditing.value) {
    menuStore.updateProduct(formData);
  } else {
    menuStore.addProduct(formData);
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
  <main class="max-w-6xl mx-auto py-12 px-6 font-inter">
    
    <header class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-6">
      <div class="flex items-center gap-4">
        <button @click="router.back()" class="p-3 bg-white/5 border border-white/10 rounded-2xl text-gray-400 hover:text-white transition-colors">
          <ArrowLeft :size="20" />
        </button>
        <div>
          <h1 class="text-3xl font-black text-white">Gerenciar Produtos</h1>
          <p class="text-gray-400 text-sm">Controle de itens do cardápio e disponibilidade</p>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <button @click="showDeleted = !showDeleted"
          class="px-5 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all font-bold text-sm border w-full sm:w-auto" 
          :class="showDeleted
            ? 'bg-white/10 text-white border-white/20'
            : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'">
          <Archive :size="18" />
          {{ showDeleted ? 'Ver Ativos' : 'Ver Arquivados' }}
        </button>

        <button v-if="!showDeleted" @click="openAddModal" class="btn-primary-admin w-full sm:w-auto flex items-center justify-center gap-2">
          <PlusCircle :size="20" /> Novo Produto
        </button>
      </div>
    </header>

    <div class="flex flex-col sm:flex-row gap-4 mb-8">
      <div class="flex-1 relative">
        <Search class="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" :size="20" />
        <input type="text" v-model="searchQuery" placeholder="Buscar por nome ou descrição..."
          class="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-brand-green/50 text-white placeholder-gray-500 transition-all" />
      </div>

      <select v-model="filterCategory"
        class="w-full sm:w-64 px-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-brand-green/50 text-white appearance-none cursor-pointer transition-all">
        <option value="" class="bg-zinc-900 text-white">Todas as categorias</option>
        <option v-for="cat in menuStore.activeCategories" :key="cat.id" :value="String(cat.id)" class="bg-zinc-900 text-white">
          {{ cat.name }}
        </option>
      </select>
    </div>

    <div v-if="showDeleted" class="mb-8 p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center justify-between">
      <p class="text-orange-400 text-sm font-bold flex items-center gap-2">
        <Archive :size="18" />
        Visualizando produtos arquivados.
      </p>
      <button @click="showDeleted = false" class="text-orange-300 hover:text-orange-100 text-sm font-bold underline transition-colors">
        Voltar para ativos
      </button>
    </div>

    <div class="bg-dark-card border border-white/10 rounded-2xl overflow-x-auto shadow-2xl">
      <table class="w-full text-left border-collapse min-w-[740px]">
        <thead class="bg-black/20 text-gray-500 uppercase text-[10px] font-black tracking-widest border-b border-white/5">
          <tr>
            <th class="p-4 sm:p-6 border-b border-white/5 w-20">Imagem</th>
            <th class="p-4 sm:p-6 border-b border-white/5">Produto</th>
            <th class="p-4 sm:p-6 border-b border-white/5 whitespace-nowrap">Categoria</th>
            <th class="p-4 sm:p-6 border-b border-white/5 whitespace-nowrap">Preço (Base)</th>
            <th class="p-4 sm:p-6 border-b border-white/5 text-center whitespace-nowrap">Disponível</th>
            <th class="p-4 sm:p-6 border-b border-white/5 whitespace-nowrap">Status</th>
            <th class="p-4 sm:p-6 border-b border-white/5 text-right whitespace-nowrap">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="prod in filteredProducts" :key="prod.id"
            class="hover:bg-white/5 border-b border-white/5 last:border-0 transition-colors"
            :class="{ 'opacity-50 grayscale': prod.deletedAt }">
            <td class="p-4 sm:p-6 w-20">
              <div class="w-12 h-12 sm:w-16 sm:h-16 bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex items-center justify-center">
                <img v-if="prod.image" :src="prod.image" class="w-full h-full object-cover" />
                <ImageIcon v-else class="text-gray-500" :size="24" />
              </div>
            </td>
            <td class="p-4 sm:p-6">
              <p class="font-bold text-white text-sm sm:text-base truncate max-w-[120px] sm:max-w-none">{{ prod.name }}</p>
              <p class="text-xs text-gray-400 truncate max-w-[120px] sm:max-w-[200px] mt-1">{{ prod.description }}</p>
            </td>
            <td class="p-4 sm:p-6 whitespace-nowrap">
              <span class="px-3 py-1 bg-white/10 text-gray-400 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest">
                {{ menuStore.getCategoryName(prod.categoryId) }}
              </span>
            </td>
            <td class="p-4 sm:p-6 font-mono text-sm text-brand-green font-bold whitespace-nowrap">
              {{ formatCurrency(prod.sizes[0]?.price || 0) }}
              <span v-if="prod.sizes.length > 1" class="text-[10px] text-gray-500 ml-1">(+{{ prod.sizes.length - 1 }})</span>
            </td>
            <td class="p-4 sm:p-6 text-center whitespace-nowrap">
              <div class="flex flex-col items-center">
                <button @click="menuStore.toggleAvailability(prod.id)"
                  class="relative inline-block w-10 align-middle select-none transition duration-200 ease-in focus:outline-none"
                  :disabled="prod.deletedAt">
                  <div
                    :class="`w-10 h-5 rounded-full p-1 duration-300 ease-in-out border border-white/10 ${prod.isAvailable ? 'bg-brand-green border-brand-green/50' : 'bg-white/5'} ${prod.deletedAt ? 'opacity-50 cursor-not-allowed' : ''}`">
                    <div
                      :class="`bg-white w-3 h-3 rounded-full shadow-md transform duration-300 ease-in-out ${prod.isAvailable ? 'translate-x-5' : 'translate-x-0 bg-gray-500'}`">
                    </div>
                  </div>
                </button>
                <span class="text-[8px] mt-2 font-black tracking-widest uppercase"
                  :class="prod.isAvailable ? 'text-brand-green' : 'text-gray-500'">
                  {{ prod.isAvailable ? 'Ativo' : 'Inativo' }}
                </span>
              </div>
            </td>
            <td class="p-4 sm:p-6 whitespace-nowrap">
              <span v-if="prod.deletedAt" class="px-3 py-1 bg-white/10 text-gray-400 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest">
                Arquivado
              </span>
              <span v-else class="px-3 py-1 bg-brand-green/10 text-brand-green border border-brand-green/20 rounded-full text-[10px] font-black uppercase tracking-widest">
                Ativo
              </span>
            </td>
            <td class="p-4 sm:p-6 text-right whitespace-nowrap">
              <div class="flex justify-end gap-2">
                <template v-if="!prod.deletedAt">
                  <button @click="openEditModal(prod)" class="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all" title="Editar">
                    <Edit :size="18" />
                  </button>
                  <button @click="handleSoftDelete(prod)" class="p-2 text-gray-400 hover:text-orange-400 hover:bg-orange-500/10 rounded-xl transition-all" title="Arquivar">
                    <Archive :size="18" />
                  </button>
                </template>
                <template v-else>
                  <button @click="handleRestore(prod)" class="p-2 text-gray-400 hover:text-brand-green hover:bg-brand-green/10 rounded-xl transition-all" title="Restaurar">
                    <RotateCcw :size="18" />
                  </button>
                  <button @click="handlePermanentDelete(prod)" class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all" title="Deletar permanentemente">
                    <Trash2 :size="18" />
                  </button>
                </template>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <ProductsModal v-if="showModal" :show="showModal" :isEditing="isEditing" :initialData="currentProductData"
      :categories="menuStore.activeCategories" @close="showModal = false" @save="handleSaveProduct" />

    <ConfirmModal :confirmModal="confirmModal" :showModal="confirmModal.show" />
  </main>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.02);
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>