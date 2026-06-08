import { ref, computed } from "vue";
import { useToast } from "@/composables/useToast";

export function useMenuCart() {
  const { showToast } = useToast();

  const cart = ref([]);
  const isProductModalOpen = ref(false);
  const isCartModalOpen = ref(false);
  const currentProduct = ref(null);
  const currentQuantity = ref(1);
  const currentObservation = ref("");
  const selectedSize = ref(null);

  const cartQuantity = computed(() => cart.value.length);
  const cartTotal = computed(() => cart.value.reduce((acc, item) => acc + item.price, 0));
  const currentModalTotal = computed(() => {
    if (!currentProduct.value) return 0;
    return (selectedSize.value?.price ?? 0) * currentQuantity.value;
  });

  function openProductModal(product) {
    currentProduct.value = product;
    currentQuantity.value = 1;
    currentObservation.value = "";
    selectedSize.value = product.sizes?.length > 0
      ? product.sizes[0]
      : { name: "Padrão", price: product.price ?? 0 };
    isProductModalOpen.value = true;
  }

  function closeProductModal() {
    isProductModalOpen.value = false;
    setTimeout(() => { currentProduct.value = null; }, 300);
  }

  function addToCart() {
    if (!currentProduct.value || !selectedSize.value) return;
    const unitPrice = selectedSize.value.price;
    for (let i = 0; i < currentQuantity.value; i++) {
      cart.value.push({
        id: Date.now() + Math.random(),
        productId: currentProduct.value.id,
        name: currentProduct.value.name,
        sizeName: selectedSize.value.name,
        sizeId: selectedSize.value.id,
        price: unitPrice,
        quantity: 1,
        obs: currentObservation.value,
      });
    }
    showToast(`${currentQuantity.value}x ${currentProduct.value.name} adicionado!`, "success");
    closeProductModal();
  }

  function removeFromCart(index) {
    cart.value.splice(index, 1);
    if (cart.value.length === 0) isCartModalOpen.value = false;
  }

  return {
    cart, isProductModalOpen, isCartModalOpen,
    currentProduct, currentQuantity, currentObservation, selectedSize,
    cartQuantity, cartTotal, currentModalTotal,
    openProductModal, closeProductModal, addToCart, removeFromCart,
  };
}
