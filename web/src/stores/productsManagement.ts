import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { categoryApi } from "@/services/categoryApi";
import { productApi } from "@/services/productApi";

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
  price: number;
  available: boolean;
  deletedAt: string | null;
  sizes: ProductSize[];
  addons?: ProductAddon[];
}

export interface Category {
  id: number;
  name: string;
  image: string | null;
  deletedAt: string | null;
}

export interface OperationResult {
  success: boolean;
  message?: string;
}

export const useMenuStore = defineStore("menu", () => {
  const categories = ref<Category[]>([]);
  const products = ref<Product[]>([]);

  const activeCategories = computed(() => categories.value.filter((c) => !c.deletedAt));
  const activeProducts = computed(() => products.value.filter((p) => !p.deletedAt));
  const deletedCategories = computed(() => categories.value.filter((c) => c.deletedAt));
  const deletedProducts = computed(() => products.value.filter((p) => p.deletedAt));

  const mapCategory = (c: any): Category => ({
    id: c.id,
    name: c.name,
    image: c.image || null,
    deletedAt: c.deletedAt,
  });

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

  const loadData = async () => {
    try {
      const [catActive, catDeleted, prodActive, prodDeleted] = await Promise.all([
          categoryApi.list().catch(() => []),
          categoryApi.listDeleted().catch(() => []),
          productApi.list().catch(() => []),
          productApi.listDeleted().catch(() => []),
      ]);

      categories.value = [...catActive, ...catDeleted].map(mapCategory);
      products.value = [...prodActive, ...prodDeleted].map(mapProduct);
    } catch (error) {
      console.error("Erro crítico ao sincronizar cardápio:", error);
    }
  };

  const addCategory = async (category: Partial<Category>) => {
    const payload = { name: category.name, image: category.image };
    await categoryApi.create(payload);
    await loadData();
  };

  const updateCategory = async (updatedCategory: Partial<Category> & { id: number }) => {
    const payload = { name: updatedCategory.name, image: updatedCategory.image };
    await categoryApi.update(updatedCategory.id, payload);
    await loadData();
  };

  const softDeleteCategory = async (id: number): Promise<OperationResult> => {
    const hasActiveProducts = products.value.some((p) => String(p.categoryId) === String(id) && !p.deletedAt);

    if (hasActiveProducts) {
      return {
        success: false,
        message: "Esta categoria possui produtos ativos. Arquive ou mova os produtos primeiro.",
      };
    }

    await categoryApi.delete(id);
    await loadData();
    return { success: true };
  };

  const restoreCategory = async (id: number) => {
    await categoryApi.restore(id);
    await loadData();
  };

  const permanentlyDeleteCategory = (id: number) => {
    categories.value = categories.value.filter((c) => c.id !== id);
  };

  const addProduct = async (formDataPayload: any) => {
    await productApi.create(formDataPayload);
    await loadData();
  };

  const updateProduct = async (formDataPayload: any) => {
    const id = formDataPayload.id || (formDataPayload.get ? formDataPayload.get('id') : undefined);
    
    if (!id) throw new Error("ID do produto não encontrado na atualização.");

    await productApi.update(id, formDataPayload);
    await loadData();
  };

  const softDeleteProduct = async (id: number) => {
    await productApi.delete(id);
    await loadData();
  };

  const restoreProduct = async (id: number) => {
    await productApi.restore(id);
    await loadData();
  };

  const permanentlyDeleteProduct = (id: number) => {
    products.value = products.value.filter((p) => p.id !== id);
  };

  const toggleAvailability = async (productId: number) => {
    const product = products.value.find((p) => p.id === productId);
    if (product) {
      const newStatus = !product.available;
      await productApi.update(productId, { status: newStatus ? "Ativo" : "Inativo" });
      await loadData();
    }
  };

  const getCategoryName = (id: number): string => {
    const cat = categories.value.find((c) => String(c.id) === String(id));
    return cat ? cat.name : "Sem categoria";
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