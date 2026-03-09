import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useMenuStore = defineStore('menu', () => {

  const categories = ref([
    { id: 1, name: 'Lanches', image: null, deletedAt: null },
    { id: 2, name: 'Bebidas', image: null, deletedAt: null },
    { id: 3, name: 'Sobremesas', image: null, deletedAt: null }
  ]);

  const products = ref([
    {
      id: 1,
      name: 'X-Bacon',
      description: 'Hambúrguer com muito bacon crocante.',
      image: null,
      categoryId: 1,
      isAvailable: true,
      deletedAt: null,
      sizes: [
        { name: 'Padrão', price: 25.00 }
      ],
      addons: [
        { name: 'Bacon Extra', price: 5.00 }
      ]
    }
  ]);

  const activeCategories = computed(() => 
    categories.value.filter(c => !c.deletedAt)
  );

  const activeProducts = computed(() => 
    products.value.filter(p => !p.deletedAt)
  );

  const deletedCategories = computed(() => 
    categories.value.filter(c => c.deletedAt)
  );

  const deletedProducts = computed(() => 
    products.value.filter(p => p.deletedAt)
  );

  const toggleAvailability = (productId) => {
    const product = products.value.find(p => p.id === productId);
    if (product) {
      product.isAvailable = !product.isAvailable;
    }
  };

  const addCategory = (category) => {
    categories.value.push({ 
      ...category, 
      id: Date.now(),
      deletedAt: null 
    });
  };

  const updateCategory = (updatedCategory) => {
    const index = categories.value.findIndex(c => c.id === updatedCategory.id);
    if (index !== -1) {
      categories.value[index] = {
        ...categories.value[index],
        ...updatedCategory,
        deletedAt: categories.value[index].deletedAt
      };
    }
  };

  const softDeleteCategory = (id) => {
    const hasActiveProducts = products.value.some(
      p => p.categoryId === id && !p.deletedAt
    );
    
    if (hasActiveProducts) {
      return { success: false, message: 'Esta categoria possui produtos ativos. Arquivar ou mova os produtos primeiro.' };
    }
    
    const category = categories.value.find(c => c.id === id);
    if (category) {
      category.deletedAt = new Date().toISOString();
    }
    return { success: true };
  };

  const restoreCategory = (id) => {
    const category = categories.value.find(c => c.id === id);
    if (category) {
      category.deletedAt = null;
    }
  };

  const permanentlyDeleteCategory = (id) => {
    categories.value = categories.value.filter(c => c.id !== id);
    products.value = products.value.filter(p => p.categoryId !== id);
  };

  const addProduct = (product) => {
    products.value.push({ 
      ...product, 
      id: Date.now(),
      deletedAt: null 
    });
  };

  const updateProduct = (updatedProduct) => {
    const index = products.value.findIndex(p => p.id === updatedProduct.id);
    if (index !== -1) {
      products.value[index] = {
        ...products.value[index],
        ...updatedProduct,
        deletedAt: products.value[index].deletedAt
      };
    }
  };

  const softDeleteProduct = (id) => {
    const product = products.value.find(p => p.id === id);
    if (product) {
      product.deletedAt = new Date().toISOString();
    }
  };

  const restoreProduct = (id) => {
    const product = products.value.find(p => p.id === id);
    if (product) {
      product.deletedAt = null;
    }
  };

  const permanentlyDeleteProduct = (id) => {
    products.value = products.value.filter(p => p.id !== id);
  };

  const getCategoryName = (id) => {
    const cat = categories.value.find(c => c.id === id);
    return cat ? cat.name : 'Sem categoria';
  };

  return {
    categories,
    products,
    activeCategories,
    activeProducts,
    deletedCategories,
    deletedProducts,
    addCategory,
    updateCategory,
    softDeleteCategory,
    restoreCategory,
    permanentlyDeleteCategory,
    addProduct,
    updateProduct,
    softDeleteProduct,
    restoreProduct,
    permanentlyDeleteProduct,
    getCategoryName,
    toggleAvailability
  };
});