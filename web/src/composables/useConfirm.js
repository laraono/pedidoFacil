import { ref } from 'vue';

const confirmState = ref({
  show: false,
  title: '',
  message: '',
  onConfirm: null,
  data: null,
  isError: false
});

export function useConfirm() {
  const showConfirm = (options) => {
    confirmState.value = { show: true, ...options };
  };

  const closeConfirm = () => {
    confirmState.value.show = false;
  };

  const handleConfirm = () => {
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