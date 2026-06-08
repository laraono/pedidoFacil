import { ref } from "vue";
import { useComandaStore } from "@/stores/comandaManagement";
import { comandaApi } from "@/services/comandaApi";
import { useToast } from "@/composables/useToast";

export function useMenuOrder() {
  const { showToast } = useToast();
  const comandaStore = useComandaStore();

  const isComandaModalOpen = ref(false);
  const isSubmitting = ref(false);

  function openComandaModal(cartLength) {
    if (cartLength === 0) return;
    isComandaModalOpen.value = true;
  }

  async function confirmAndSendToKitchen(cart, comandaUnitLabel, selectedComandaId, newComandaNumber, onSuccess) {
    if (isSubmitting.value) return;

    isSubmitting.value = true;
    try {
      let comandaIdParaEnviar = selectedComandaId;

      if (comandaIdParaEnviar === "new") {
        const label = `${comandaUnitLabel} ${newComandaNumber}`;
        const novaComanda = await comandaApi.create({ description: label, status: "Aberta", total: 0 });
        comandaIdParaEnviar = novaComanda.id || novaComanda;
      }

      await comandaApi.addOrder(comandaIdParaEnviar, {
        status: "Aguardando_Preparo",
        serviceType: "Garcom",
        itens: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          observation: item.obs || "",
          productVariationId: item.sizeId,
        })),
      });

      await comandaStore.loadComandas();
      isComandaModalOpen.value = false;
      onSuccess?.();
      showToast("Pedido enviado para a cozinha!", "success");
    } catch (error) {
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
