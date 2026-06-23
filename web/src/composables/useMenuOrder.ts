import { ref } from "vue";
import { useComandaStore } from "@/stores/comandaManagement";
import { comandaApi } from "@/services/comandaApi";
import { useToast } from "@/composables/useToast";
import type { CartItem } from "@/composables/useMenuCart";

export function useMenuOrder() {
  const { showToast } = useToast();
  const comandaStore = useComandaStore();

  const isComandaModalOpen = ref(false);
  const isSubmitting = ref(false);

  function openComandaModal(cartLength: number) {
    if (cartLength === 0) return;
    isComandaModalOpen.value = true;
  }

  async function confirmAndSendToKitchen(
    cart: CartItem[],
    comandaUnitLabel: string,
    selectedComandaId: string | number,
    newComandaNumber: string | number,
    onSuccess?: () => void,
  ) {
    if (isSubmitting.value) return;  

    isSubmitting.value = true;
    try {
      let comandaIdParaEnviar: string | number = selectedComandaId;

      if (comandaIdParaEnviar === "new") {
        const label = `${comandaUnitLabel} ${newComandaNumber}`;
        const novaComanda = await comandaApi.create({ description: label, status: "Aberta", total: 0 });
        comandaIdParaEnviar = novaComanda.id || novaComanda;
      }

      const idempotencyKey = crypto.randomUUID();
      await comandaApi.addOrder(comandaIdParaEnviar, {
        status: "Aguardando_Preparo",
        itens: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          observation: item.obs || "",
          productVariationId: item.sizeId,
        })),
      }, idempotencyKey);

      await comandaStore.loadComandas();
      isComandaModalOpen.value = false;
      onSuccess?.();
      showToast("Pedido enviado para a cozinha!", "success");
    } catch (error: any) {
      const data = error.response?.data || error.data || error;
      if (data?.errors && Array.isArray(data.errors)) {
        showToast(data.errors[0].mensagem, "error");
      } else {
        showToast(data?.message || "Erro ao enviar pedido para a cozinha.", "error");
      }
    } finally {
      isSubmitting.value = false;
    }
  }

  return {
    isComandaModalOpen, isSubmitting,
    openComandaModal, confirmAndSendToKitchen,
  };
}
