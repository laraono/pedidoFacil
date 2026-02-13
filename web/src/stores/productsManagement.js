import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useMenuStore = defineStore('menu', () => {

  const categories = ref([
    { id: 1, name: 'Lanches', image: null },
    { id: 2, name: 'Bebidas', image: null },
    { id: 3, name: 'Sobremesas', image: null }
  ]);

  const toggleAvailability = (productId) => {
    const product = products.value.find(p => p.id === productId);
    if (product) {
      product.isAvailable = !product.isAvailable;
    }
  };

  const products = ref([
    {
      id: 1,
      name: 'X-Bacon',
      description: 'Hambúrguer com muito bacon crocante.',
      image: null,
      categoryId: 1,
      isAvailable: true,

      sizes: [
        { name: 'Padrão', price: 25.00 }
      ],

      addons: [
        { name: 'Bacon Extra', price: 5.00 }
      ]
    }
  ]);

  const addCategory = (category) => {
    categories.value.push({ ...category, id: Date.now() });
  };

  const updateCategory = (updatedCategory) => {
    const index = categories.value.findIndex(c => c.id === updatedCategory.id);
    if (index !== -1) categories.value[index] = updatedCategory;
  };

  const removeCategory = (id) => {
    const hasProducts = products.value.some(p => p.categoryId === id);
    if (hasProducts) {
      alert('Não é possível excluir uma categoria que possui produtos.');
      return;
    }
    categories.value = categories.value.filter(c => c.id !== id);
  };

  const addProduct = (product) => {
    products.value.push({ ...product, id: Date.now() });
  };

  const updateProduct = (updatedProduct) => {
    const index = products.value.findIndex(p => p.id === updatedProduct.id);
    if (index !== -1) products.value[index] = updatedProduct;
  };

  const removeProduct = (id) => {
    products.value = products.value.filter(p => p.id !== id);
  };

  const getCategoryName = (id) => {
    const cat = categories.value.find(c => c.id === id);
    return cat ? cat.name : 'Sem categoria';
  };

  return {
    categories,
    products,
    addCategory,
    updateCategory,
    removeCategory,
    addProduct,
    updateProduct,
    removeProduct,
    getCategoryName,
    toggleAvailability
  };
});