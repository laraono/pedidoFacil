import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export function createSoftDeleteStore(storeName, initialData = []) {
  return defineStore(storeName, () => {
    const items = ref(initialData);

    const activeItems = computed(() => items.value.filter(item => !item.deletedAt));
    const deletedItems = computed(() => items.value.filter(item => item.deletedAt));

    const softDelete = (id) => {
      const item = items.value.find(i => i.id === id);
      if (item) item.deletedAt = new Date().toISOString();
    };

    const restore = (id) => {
      const item = items.value.find(i => i.id === id);
      if (item) item.deletedAt = null;
    };

    const permanentlyDelete = (id) => {
      items.value = items.value.filter(i => i.id !== id);
    };

    const addItem = (item) => {
      items.value.push({ ...item, id: Date.now(), deletedAt: null });
    };

    const updateItem = (updatedItem) => {
      const index = items.value.findIndex(i => i.id === updatedItem.id);
      if (index !== -1) {
        items.value[index] = { ...items.value[index], ...updatedItem };
      }
    };

    return {
      items,
      activeItems,
      deletedItems,
      addItem,
      updateItem,
      softDelete,
      restore,
      permanentlyDelete,
    };
  });
}