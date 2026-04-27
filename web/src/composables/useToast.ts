import { ref } from 'vue';

export interface Toast {
  id: number;
  message: string;
  type: string;
}

const toasts = ref<Toast[]>([]);

export function useToast() {
  const showToast = (message: string, type = 'success', duration = 3000): void => {
    const id = Date.now();
    toasts.value.push({ id, message, type });

    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id: number): void => {
    toasts.value = toasts.value.filter(t => t.id !== id);
  };

  return { toasts, showToast, removeToast };
}
