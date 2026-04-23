import { ref } from 'vue';

export interface ConfirmOptions {
  title?: string;
  message?: string;
  onConfirm?: ((data: unknown) => void) | null;
  data?: unknown;
  isError?: boolean;
}

interface ConfirmState extends ConfirmOptions {
  show: boolean;
}

const confirmState = ref<ConfirmState>({
  show: false,
  title: '',
  message: '',
  onConfirm: null,
  data: null,
  isError: false
});

export function useConfirm() {
  const showConfirm = (options: ConfirmOptions): void => {
    confirmState.value = { show: true, ...options };
  };

  const closeConfirm = (): void => {
    confirmState.value.show = false;
  };

  const handleConfirm = (): void => {
    if (confirmState.value.onConfirm) {
      confirmState.value.onConfirm(confirmState.value.data);
    }
    closeConfirm();
  };

  return {
    confirmState,
    showConfirm,
    closeConfirm,
    handleConfirm
  };
}
