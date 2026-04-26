import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import imgFood from '@/assets/food.jpg';
import imgHamburguer from '@/assets/hamburguer.png';

export interface ProductSize {
  name: string;
  price: number;
}

export interface ProductAddon {
  name: string;
  price: number;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  image: string | null;
  categoryId: number;
  isAvailable: boolean;
  deletedAt: string | null;
  sizes: ProductSize[];
  addons: ProductAddon[];
}

export interface Category {
  id: number;
  name: string;
  image: string;
  deletedAt: string | null;
}

export interface OperationResult {
  success: boolean;
  message?: string;
}

export const useMenuStore = defineStore("menu", () => {
  const categories = ref([]);
  const products = ref([]);

  const categories = ref<Category[]>([
    { id: 1, name: 'Lanches', image: imgFood, deletedAt: null },
    { id: 2, name: 'Bebidas', image: imgFood, deletedAt: null },
    { id: 3, name: 'Sobremesas', image: imgFood, deletedAt: null }
  ]);

  const products = ref<Product[]>([
    {
      id: 1,
      name: 'X-Bacon',
      description: 'Hambúrguer com muito bacon crocante.',
      image: imgHamburguer,
      categoryId: 1,
      isAvailable: true,
      deletedAt: null,
      sizes: [
        { name: 'Padrão', price: 25.00 },
        { name: 'Grande', price: 30.00 }
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

  const toggleAvailability = (productId: number): void => {
    const product = products.value.find(p => p.id === productId);
    if (product) {
      product.isAvailable = !product.isAvailable;
    }
  };

  const addCategory = (category: Omit<Category, 'id' | 'deletedAt'>): void => {
    categories.value.push({
      ...category,
      id: Date.now(),
      deletedAt: null
    });
  };

  const updateCategory = (updatedCategory: Partial<Category> & { id: number }): void => {
    const index = categories.value.findIndex(c => c.id === updatedCategory.id);
    if (index !== -1) {
      categories.value[index] = {
        ...categories.value[index],
        ...updatedCategory,
        deletedAt: categories.value[index].deletedAt
      };
    }

  const softDeleteCategory = (id: number): OperationResult => {
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

  const restoreCategory = (id: number): void => {
    const category = categories.value.find(c => c.id === id);
    if (category) {
      category.deletedAt = null;
    }
  };

  const permanentlyDeleteCategory = (id: number): void => {
    categories.value = categories.value.filter(c => c.id !== id);
    products.value = products.value.filter(p => p.categoryId !== id);
  };

  const addProduct = (product: Omit<Product, 'id' | 'deletedAt'>): void => {
    products.value.push({
      ...product,
      id: Date.now(),
      deletedAt: null
    });
  };

  const updateProduct = (updatedProduct: Partial<Product> & { id: number }): void => {
    const index = products.value.findIndex(p => p.id === updatedProduct.id);
    if (index !== -1) {
      products.value[index] = {
        ...products.value[index],
        ...updatedProduct,
        deletedAt: products.value[index].deletedAt
      };
    }
  };

  const softDeleteProduct = (id: number): void => {
    const product = products.value.find(p => p.id === id);
    if (product) {
      product.deletedAt = new Date().toISOString();
    }
  };

  const restoreProduct = (id: number): void => {
    const product = products.value.find(p => p.id === id);
    if (product) {
      product.deletedAt = null;
    }
  };

  const permanentlyDeleteProduct = (id: number): void => {
    products.value = products.value.filter(p => p.id !== id);
  };

  const getCategoryName = (id: number): string => {
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
    loadData,
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
    toggleAvailability,
  };
});
