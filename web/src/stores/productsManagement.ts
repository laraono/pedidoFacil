import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { categoryApi } from "@/services/categoryApi";
import { productApi } from "@/services/productApi";

export interface Product {
  id: number;
  name: string;
  description: string;
  image: string | null;
  categoryId: number;
  price: number;
  available: boolean;
  deletedAt: string | null;
  sizes: Array<{ name: string; price: number }>;
}

export interface Category {
  id: number;
  name: string;
  image: string | null;
  status: 'Ativa' | 'Inativa';
}

export const useMenuStore = defineStore("menu", () => {
  const categories = ref<Category[]>([]);
  const inactiveCategories = ref<Category[]>([]);
  const products = ref<Product[]>([]);

  const totalProducts = ref(0);
  const totalPages = ref(0);
  const currentPage = ref(1);

  const activeCategories = computed(() => categories.value);
  const activeProducts = computed(() => products.value);

  const mapProduct = (p: any): Product => ({
    id: p.id,
    name: p.name,
    description: p.description || "",
    image: p.image || null,
    price: Number(p.basePrice || 0),
    available: p.status === "Ativo",
    categoryId: p.category?.id,
    deletedAt: p.deletedAt,
    sizes: p.productVariations?.map((v: any) => ({
      name: v.name,
      price: Number(v.addPrice),
    })) || [],
  });

  const loadCategories = async () => {
    try {
      const [active, inactive] = await Promise.all([
        categoryApi.list(),
        categoryApi.listInactive(),
      ]);
      categories.value = active;
      inactiveCategories.value = inactive;
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
    }
  };

  const loadProducts = async (page = 1, limit = 100, showDeleted = false, search = "") => {
    try {
      const response = await productApi.list({ page, limit, deleted: showDeleted, search });
      products.value = response.products.map(mapProduct);
      totalProducts.value = response.total;
      totalPages.value = response.totalPages;
      currentPage.value = page;
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      products.value = [];
    }
  };

  const loadData = async () => {
    await Promise.all([loadCategories(), loadProducts(1, 100)]);
  };

  const deactivateCategory = async (id: number) => {
    try {
      await categoryApi.deactivate(id);
      await loadCategories();
      return { success: true };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  };

  const reactivateCategory = async (id: number) => {
    try {
      await categoryApi.reactivate(id);
      await loadCategories();
    } catch (error) {
      console.error(error);
    }
  };

  const deleteCategory = async (id: number) => {
    try {
      await categoryApi.delete(id);
      await loadCategories();
    } catch (error) {
      console.error(error);
    }
  };

  const addProduct = async (formData: FormData) => {
    await productApi.create(formData);
    await loadProducts(currentPage.value);
  };

  const updateProduct = async (data: FormData | any) => {
    let id: number | null = null;
    if (data instanceof FormData) {
      id = Number(data.get('id'));
    } else {
      id = data.id;
    }
    if (!id) throw new Error("ID do produto não encontrado.");
    await productApi.update(id, data);
    await loadProducts(currentPage.value);
  };

  const softDeleteProduct = async (id: number) => {
    await productApi.delete(id);
    await loadProducts(currentPage.value);
  };

  const restoreProduct = async (id: number) => {
    await productApi.restore(id);
    await loadProducts(currentPage.value);
  };

  const getCategoryName = (id: number): string => {
    const cat = [...categories.value, ...inactiveCategories.value].find(
      (c) => Number(c.id) === Number(id)
    );
    return cat ? cat.name : "Sem categoria";
  };

  return {
    categories,
    inactiveCategories,
    products,
    totalProducts,
    totalPages,
    currentPage,
    activeCategories,
    activeProducts,
    loadCategories,
    loadProducts,
    loadData,
    deactivateCategory,
    reactivateCategory,
    deleteCategory,
    addProduct,
    updateProduct,
    softDeleteProduct,
    restoreProduct,
    getCategoryName,
  };
});
