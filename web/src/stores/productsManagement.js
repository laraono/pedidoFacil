import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { categoryApi } from "@/services/categoryApi";
import { productApi } from "@/services/productApi";

export const useMenuStore = defineStore("menu", () => {
  const categories = ref([]);
  const products = ref([]);

  const activeCategories = computed(() =>
    categories.value.filter((c) => !c.deletedAt),
  );

  const activeProducts = computed(() =>
    products.value.filter((p) => !p.deletedAt),
  );

  const deletedCategories = computed(() =>
    categories.value.filter((c) => c.deletedAt),
  );

  const deletedProducts = computed(() =>
    products.value.filter((p) => p.deletedAt),
  );

  const mapCategory = (c) => ({
    id: c.id,
    name: c.name,
    image: c.image || null,
    deletedAt: c.deletedAt,
  });

  const mapProduct = (p) => ({
    id: p.id,
    name: p.name,
    description: p.description || "",
    image: p.image || null,
    price: Number(p.basePrice || 0),
    available: p.status === "Ativo",
    categoryId: p.category?.id,
    deletedAt: p.deletedAt,
    sizes:
      p.productVariations?.map((v) => ({
        name: v.name,
        price: Number(v.addPrice),
      })) || [],
  });

  const loadData = async () => {
    try {
      const [catActive, catDeleted, prodActive, prodDeleted] =
        await Promise.all([
          categoryApi.list(),
          categoryApi.listDeleted(),
          productApi.list(),
          productApi.listDeleted(),
        ]);

      categories.value = [...catActive, ...catDeleted].map(mapCategory);
      products.value = [...prodActive, ...prodDeleted].map(mapProduct);
    } catch (error) {
      console.error(
        "Erro ao sincronizar cardápio com o banco de dados:",
        error,
      );
    }
  };

  const addCategory = async (category) => {
    const payload = {
      name: category.name,
      image: category.image,
    };
    await categoryApi.create(payload);
    await loadData();
  };

  const updateCategory = async (updatedCategory) => {
    const payload = {
      name: updatedCategory.name,
      image: updatedCategory.image,
    };
    await categoryApi.update(updatedCategory.id, payload);
    await loadData();
  };

  const softDeleteCategory = async (id) => {
    const hasActiveProducts = products.value.some(
      (p) => String(p.categoryId) === String(id) && !p.deletedAt,
    );

    if (hasActiveProducts) {
      return {
        success: false,
        message:
          "Esta categoria possui produtos ativos. Arquive ou mova os produtos primeiro.",
      };
    }

    await categoryApi.delete(id);
    await loadData();
    return { success: true };
  };

  const restoreCategory = async (id) => {
    await categoryApi.restore(id);
    await loadData();
  };

  const permanentlyDeleteCategory = (id) => {
    categories.value = categories.value.filter((c) => c.id !== id);
  };

  const addProduct = async (productData) => {
    const payload = {
      product: {
        name: productData.name,
        description: productData.description,
        basePrice: productData.price,
        categoryId: productData.categoryId,
        image: productData.image,
        status: productData.available ? "Ativo" : "Inativo",
        estocavel: false,
      },
      productVariations: productData.sizes.map((s) => ({
        name: s.name,
        addPrice: s.price,
        status: "Ativo",
      })),
    };

    await productApi.create(payload);
    await loadData();
  };

  const updateProduct = async (updatedProduct) => {
    await productApi.update(updatedProduct.id, updatedProduct);
    await loadData();
  };

  const softDeleteProduct = async (id) => {
    await productApi.delete(id);
    await loadData();
  };

  const restoreProduct = async (id) => {
    await productApi.restore(id);
    await loadData();
  };

  const permanentlyDeleteProduct = (id) => {
    products.value = products.value.filter((p) => p.id !== id);
  };

  const toggleAvailability = async (productId) => {
    const product = products.value.find((p) => p.id === productId);
    if (product) {
      const newStatus = !product.available;
      await productApi.update(productId, { available: newStatus });
      await loadData();
    }
  };

  const getCategoryName = (id) => {
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
