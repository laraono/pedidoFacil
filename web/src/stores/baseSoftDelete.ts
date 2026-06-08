import { defineStore } from 'pinia';
import { ref, computed, type Ref } from 'vue';

export interface SoftDeletable {
  id: number;
  deletedAt: string | null;
}

export function createSoftDeleteStore<T extends SoftDeletable>(storeName: string, initialData: T[] = []) {
  return defineStore(storeName, () => {
    const items = ref([...initialData]) as Ref<T[]>;

    const activeItems = computed(() => items.value.filter(item => !item.deletedAt));
    const deletedItems = computed(() => items.value.filter(item => item.deletedAt));

    const softDelete = (id: number): void => {
      const item = items.value.find(i => i.id === id);
      if (item) item.deletedAt = new Date().toISOString();
    };

    const restore = (id: number): void => {
      const item = items.value.find(i => i.id === id);
      if (item) item.deletedAt = null;
    };

    const permanentlyDelete = (id: number): void => {
      items.value = items.value.filter(i => i.id !== id);
    };

    const addItem = (item: Omit<T, 'id' | 'deletedAt'>): void => {
      items.value.push({ ...item, id: Date.now(), deletedAt: null } as T);
    };

    const updateItem = (updatedItem: Partial<T> & { id: number }): void => {
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
