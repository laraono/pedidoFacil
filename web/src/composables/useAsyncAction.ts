import { ref } from 'vue';
import { useToast } from './useToast';

export function useAsyncAction() {
  const { showToast } = useToast();
  const loading = ref(false);

  async function run<T>(fn: () => Promise<T>, errorMsg?: string): Promise<T | undefined> {
    loading.value = true;
    try {
      return await fn();
    } catch (e: any) {
      showToast(errorMsg ?? e?.message ?? 'Erro inesperado.', 'error');
    } finally {
      loading.value = false;
    }
  }

  return { loading, run };
}
