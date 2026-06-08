import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { menuApi } from '@/services/menuApi';

interface MenuCategory {
  id: number;
  name: string;
  image: string | null;
  deletedAt: string | null;
}

interface ProductSize {
  id: number;
  name: string;
  price: number;
}

interface MenuProduct {
  id: number;
  name: string;
  description: string;
  image: string | null;
  price: number;
  available: boolean;
  categoryId: number | undefined;
  deletedAt: string | null;
  sizes: ProductSize[];
}

export const useMenuOrderingStore = defineStore('menuOrdering', () => {
  const categories = ref<MenuCategory[]>([]);
  const products = ref<MenuProduct[]>([]);

  const activeCategories = computed(() => categories.value.filter(c => !c.deletedAt));
  const activeProducts = computed(() => products.value.filter(p => !p.deletedAt && p.available));

  const getCategoryName = (id: number | string): string => {
    const cat = categories.value.find(c => String(c.id) === String(id));
    return cat ? cat.name : 'Sem categoria';
  };

  const loadData = async (editMode = false): Promise<void> => {
    try {
      const data = await menuApi.getFullMenu(editMode);
      if (!data) return;

      categories.value = (data.categories || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        image: c.image || null,
        deletedAt: c.deletedAt,
      }));

      products.value = (data.products || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        description: p.description || '',
        image: p.image || null,
        price: Number(p.basePrice),
        available: p.status === 'Ativo',
        categoryId: p.category?.id,
        deletedAt: p.deletedAt,
        sizes: p.productVariations?.map((v: any) => ({
          id: v.id,
          name: v.name,
          price: Number(p.basePrice) + Number(v.addPrice),
        })) || [],
      }));
    } catch (error) {
      console.error('Erro ao carregar o cardápio:', error);
    }
  };

  return { categories, products, activeCategories, activeProducts, getCategoryName, loadData };
});
