<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useMenuStore } from "@/stores/menu";
import { useComandaStore } from "@/stores/comandaManagement";
import { request } from "@/services/api";
import SubscriptionGuard from "@/components/SubscriptionGuard.vue";
import { useToast } from "@/composables/useToast";
import localStorageService from "@/services/localStorageService";
import { getEstablishmentMock } from "@/mock/stablishmentmock";
import ToastMessage from "@/components/ui/ToastMessage.vue";
import { useUtils } from "@/composables/useUtils";
import { useRoute, useRouter } from "vue-router";
import {
  Utensils, X, Plus, Minus, ShoppingBag,
  Trash2, ChefHat, CheckCircle2, Palette, ArrowLeft,
} from 'lucide-vue-next';
import { comandaApi } from "@/services/comandaApi";
import { productApi } from "@/services/productApi";
import { orderApi } from "@/services/orderApi";
import { categoryApi } from '@/services/categoryApi';

const route = useRoute();
const router = useRouter();
const isEditMode = ref(false);

const comandaStore = useComandaStore();
const { formatCurrency } = useUtils();
const { showToast } = useToast();

const establishmentName = ref("Carregando...");
const imageUrl = ref("");
const bgColor = ref("#F5F6FA");
const buttonColor = ref("#1E7BC4");
const buttonTextColor = ref("#FFFFFF");
const categoryColor = ref("#7AB648");
const textColor = ref("#212121");
const cardBg = ref("#FFFFFF");
const fontFamily = ref("Inter, sans-serif");
const observacoesPermitidas = ref(true);

const cart = ref([]);
const isProductModalOpen = ref(false);
const isCartModalOpen = ref(false);
const isComandaModalOpen = ref(false);
const selectedComandaId = ref(null);
const newComandaNumber = ref("");
const comandaUnitLabel = ref("Comanda");
const activeCategoryId = ref(null);
const isSubmitting = ref(false);

const currentProduct = ref(null);
const currentQuantity = ref(1);
const currentObservation = ref('');
const selectedProductVariation = ref(null);

const products = ref([])
const categories = ref([])
const comandas = ref([])

onMounted(async () => {
  categories.value = await categoryApi.list()
  products.value = await productApi.listActiveByCategory(categories.value[0].id)
  comandas.value = await comandaApi.listOpen()
  activeCategoryId.value = categories.value[0].id

  bgColor.value = localStorageService.getBackgroundColors() || '#F5F6FA';
  buttonColor.value = localStorageService.getButtonColors() || '#1E7BC4';
  buttonTextColor.value = localStorageService.getButtonTextColor() || '#FFFFFF';
  categoryColor.value = localStorageService.getCategoryColors() || '#7AB648';
  textColor.value = localStorageService.getTextColor() || '#212121';
  cardBg.value = localStorageService.getProductCardBg() || '#FFFFFF';
  fontFamily.value = localStorageService.getFontFamily() || 'Inter, sans-serif';
  comandaUnitLabel.value = localStorageService.getComandaUnitLabel() || 'Comanda';

  const savedImage = localStorageService.getImage();
  if (savedImage) imageUrl.value = savedImage;

  const data = await getEstablishmentMock();
  establishmentName.value = data?.info?.name || "Seu Restaurante";

  await menuStore.loadData();
  await comandaStore.loadComandas();

  if (productsByCategory.value && productsByCategory.value.length > 0) {
    activeCategoryId.value = productsByCategory.value[0].id;
  }
  checkEditMode();
});

const backgroundStyle = computed(() => ({ backgroundColor: bgColor.value }));

const cardBgLuminance = computed(() => {
  const hex = cardBg.value.replace("#", "");
  if (hex.length < 6) return 1;
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
});
const isCardDark = computed(() => cardBgLuminance.value < 0.5);

const adaptiveBorder = computed(() => isCardDark.value ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.13)");
const adaptiveInputBg = computed(() => isCardDark.value ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.04)");
const adaptiveButtonBg = computed(() => isCardDark.value ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.07)");
const adaptiveSubtleBg = computed(() => isCardDark.value ? "rgba(0,0,0,0.15)" : "rgba(0,0,0,0.03)");
const adaptivePlaceholder = computed(() => isCardDark.value ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.32)");

const selectedCategory = computed(() => 
  categories.value.find(c => c.id === activeCategoryId.value) || null
);

const cartQuantity = computed(() => cart.value.length);

const cartTotal = computed(() => {
  return cart.value.reduce((acc, item) => {
    return acc + (item.price * item.quantity);
  }, 0); // Initial value goes here
});

const currentModalTotal = computed(() => {
  if (!currentProduct.value) return 0;

  const productPrice = currentProduct.value.basePrice ? currentProduct.value.basePrice : 0
  const variantPrice = selectedProductVariation.value.addPrice ? selectedProductVariation.value.addPrice : 0
  const basePrice = productPrice + variantPrice

  return basePrice * currentQuantity.value;
});

const getProducts = async(categoryId) => {
  activeCategoryId.value = categoryId
  products.value = await productApi.listActiveByCategory(categoryId)
}

const openProductModal = (product) => {
  currentProduct.value = product
  currentQuantity.value = 1;
  currentObservation.value = '';
  selectedProductVariation.value = product.productVariations?.length > 0
    ? product.productVariations[0]
    : { name: 'Padrão', price: product.basePrice ?? 0 };
  isProductModalOpen.value = true;
};

const closeProductModal = () => {
  isProductModalOpen.value = false;
  setTimeout(() => { currentProduct.value = null; }, 300);
};

const addToCart = () => {
  if (!currentProduct.value || !selectedProductVariation.value) return;
  const unitPrice = Number(currentProduct.value.basePrice) + Number(selectedProductVariation.value.addPrice ?? 0);
    cart.value.push({
      productId: currentProduct.value.id,
      name: currentProduct.value.name,
      variationName: selectedProductVariation.value.name,
      price: unitPrice,
      quantity: currentQuantity.value,
      obs: currentObservation.value,
    });
  
  showToast(`${currentQuantity.value}x ${currentProduct.value.name} adicionado!`, 'success');
  closeProductModal();
};

const removeFromCart = (index) => {
  cart.value.splice(index, 1);
  if (cart.value.length === 0) isCartModalOpen.value = false;
};

const openComandaModal = () => {
  if (cart.value.length === 0) return;
  selectedComandaId.value = null;
  newComandaNumber.value = "";
  isComandaModalOpen.value = true;
};

const confirmAndSendToKitchen = async () => {
  if (!selectedComandaId.value) return;
  if (selectedComandaId.value === 'new' && !newComandaNumber.value.trim()) return;

  let comandaId;
  if (selectedComandaId.value === 'new') {
    const label = `${comandaUnitLabel.value} ${newComandaNumber.value.trim()}`;
    const duplicate = comandaStore.comandas.some(c => c.label.trim().toLowerCase() === label.trim().toLowerCase());
    if (duplicate) {
      showToast(`Já existe uma comanda com o nome "${label}". Use outro número.`, 'error');
      return;
    }
    comandaId = await comandaApi.post(label, 'Aberta');
  } else {
    comandaId = selectedComandaId.value
  }
  if (!comandaId) return;

  const finalOrder = {
    status: 'Aguardando_Preparo',
    comandaId: comandaId,
    itens: cart.value.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      obs: item.obs,
    })),
  };

  await orderApi.post(comandaId, finalOrder.status, finalOrder.itens)

  const kitchenOrder = {
    id: Date.now(),
    comanda: comandaId,
    waiter: 'Autoatendimento',
    status: 'pending',
    createdAt: new Date(),
    items: cart.value.map(item => ({
      name: `${item.name} (${item.variationName})`,
      amount: 1,
      obs: item.obs,
    })),
  };

  comandaStore.updateComanda(comandaId, finalOrder);

  cart.value = [];
  isComandaModalOpen.value = false;
  isCartModalOpen.value = false;
  showToast('Pedido enviado para a cozinha!', 'success');
};

const saveVisuals = async () => {
  try {
    isSubmitting.value = true;

    await request("/estabelecimento/config", {
      method: "PUT",
      body: JSON.stringify({
        backgroundColor: bgColor.value,
        cardsColor: cardBg.value,
        textsColor: textColor.value,
        buttonsColor: buttonColor.value,
        buttonsTextColor: buttonTextColor.value,
        activeCateogryColor: categoryColor.value,
        fontFamily: fontFamily.value,
        comandaLabel: comandaUnitLabel.value, 
        allowObservations: observacoesPermitidas.value,
      }),
    });

    localStorageService.saveBackgroundColors(bgColor.value);
    localStorageService.saveButtonColors(buttonColor.value);
    localStorageService.saveButtonTextColor(buttonTextColor.value);
    localStorageService.saveCategoryColors(categoryColor.value);
    localStorageService.saveFontFamily(fontFamily.value);
    localStorageService.saveTextColor(textColor.value);
    localStorageService.saveProductCardBg(cardBg.value);
    localStorageService.saveComandaUnitLabel(comandaUnitLabel.value);

    showToast("Aparência salva com sucesso!", "success");
  } catch (error) {
    console.error("Erro ao salvar no servidor:", error);
    showToast("Erro ao salvar no servidor.", "error");
  } finally {
    isSubmitting.value = false;
  }
};

const closeVisuals = () => {
  isEditMode.value = false;
  router.push("/app/dashboard");
};

const checkEditMode = () => {
  isEditMode.value = route.query.editMode === "true";
};

watch(() => route.query.editMode, checkEditMode);
</script>

<template>
  <SubscriptionGuard featureName="O Cardápio">
    <div
      class="min-h-screen flex flex-col font-inter relative"
      :class="{ 'sm:pr-80': isEditMode }"
      :style="[{ fontFamily }, backgroundStyle]"
    >
      <div v-if="imageUrl" class="absolute inset-0 z-0 fixed"></div>

      <div
        class="relative z-10 flex flex-col h-screen overflow-hidden max-w-7xl mx-auto w-full"
      >
        <header
          class="p-4 sm:p-6 shrink-0 border-b border-white/10 flex items-center gap-4"
        >
          <div
            class="w-12 h-12 rounded flex items-center justify-center shadow-lg overflow-hidden bg-white"
          >
            <img
              v-if="imageUrl"
              :src="imageUrl"
              class="w-full h-full object-contain p-1"
            />
            <Utensils v-else :size="24" :style="{ color: textColor }" />
          </div>
          <div>
            <h1
              class="text-2xl font-black tracking-tight leading-none"
              :style="{ color: textColor }"
            >
              {{ establishmentName }}
            </h1>
            <p class="opacity-70 text-sm mt-1" :style="{ color: textColor }">
              O que vai desejar hoje?
            </p>
          </div>
        </header>

      <div class="flex flex-1 overflow-hidden relative">
        <aside class="w-1/3 sm:w-64 overflow-y-auto custom-scrollbar p-3 sm:p-4 border-r border-white/5 shrink-0">
          <button
            v-for="category in categories"
            :key="category.id"
            @click="getProducts(category.id)"
            class="relative w-full text-left rounded mb-3 transition-all shadow-sm flex overflow-hidden group"
            :class="[
              activeCategoryId === category.id ? 'shadow-lg scale-[1.02] z-10' : 'hover:scale-[1.02] hover:bg-white/5',
              category.image ? 'h-24 sm:h-28 items-end p-4' : 'p-4 items-center justify-between',
            ]"
            :style="!category.image ? (activeCategoryId === category.id ? { backgroundColor: categoryColor, color: '#FFFFFF' } : { color: textColor }) : {}"
          >
            <template v-if="category.image">
              <div class="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" :style="{ backgroundImage: `url(${category.image})` }"></div>
              <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
              <div class="absolute inset-0 transition-opacity duration-300" :style="{ backgroundColor: categoryColor, opacity: activeCategoryId === category.id ? 0.6 : 0 }"></div>
              <div v-if="activeCategoryId === category.id" class="absolute inset-0 border-[1px] rounded transition-all" :style="{ borderColor: categoryColor }"></div>
            </template>
            <span class="relative z-10 truncate w-full tracking-wide" :class="category.image ? 'text-white text-lg font-black drop-shadow-lg' : 'text-sm sm:text-base font-bold'">
              {{ category.name }}
            </span>
          </button>
        </aside>

          <main
            class="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 pb-32"
          >
            <div v-if="selectedCategory" class="animate-fadeIn">
              <h2
                class="text-3xl font-black mb-6 pb-2 border-b border-white/10 inline-block"
                :style="{ color: textColor }"
              >
                {{ selectedCategory.name }}
              </h2>

            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              <div
                v-for="product in products"
                :key="product.id"
                @click="openProductModal(product)"
                class="rounded p-5 shadow-xl cursor-pointer hover:-translate-y-1 transition-all duration-300 flex flex-col h-full border border-white/5 group relative overflow-hidden"
                :style="{ backgroundColor: cardBg }"
              >
                <div v-if="product.image" class="w-full h-40 rounded mb-4 bg-cover bg-center shadow-inner" :style="{ backgroundImage: `url(${product.image})` }"></div>
                <div class="flex-1 z-10">
                  <h3 class="font-bold text-xl mb-2 leading-tight" :style="{ color: textColor }">{{ product.name }}</h3>
                  <p class="text-sm opacity-70 line-clamp-2" :style="{ color: textColor }">{{ product.description }}</p>
                </div>
                <div class="flex items-center justify-between mt-6 pt-4 border-t border-white/5 z-10">
                  <div class="flex flex-col">
                    <span v-if="product.productVariations?.length > 1" class="text-[10px] opacity-70 uppercase tracking-widest font-bold mb-0.5" :style="{ color: textColor }">A partir de</span>
                    <span class="font-black text-xl" :style="{ color: buttonColor }">{{ formatCurrency(product.productVariations?.[0]?.addPrice ?? product.basePrice ?? 0) }}</span>
                  </div>
                  <div class="w-10 h-10 rounded flex items-center justify-center font-bold transition-transform group-hover:scale-110 shadow-lg" :style="{ backgroundColor: buttonColor, color: buttonTextColor }">
                    <Plus :size="20" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="products.length === 0" class="flex flex-col items-center justify-center h-full text-center px-6 py-12">
            <ChefHat class="w-16 h-16 mb-4 opacity-30" :style="{ color: textColor }" />
            <p class="text-lg font-bold mb-2" :style="{ color: textColor }">Sem itens disponíveis no cardápio</p>
            <p class="text-sm opacity-60" :style="{ color: textColor }">
              Altere a disponibilidade de produtos em
              <a href="/app/settings/products" class="underline font-bold hover:opacity-80 transition-opacity">Gerenciar Produtos</a>.
            </p>
          </div>
        </main>
      </div>
    </div>

      <Transition
        enter-active-class="transition-transform duration-300 ease-out"
        enter-from-class="translate-y-24 opacity-0"
        leave-active-class="transition-transform duration-200 ease-in"
        leave-to-class="translate-y-24 opacity-0"
      >
        <div
          v-if="cart.length > 0"
          class="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-xl px-4 z-40"
        >
          <button
            @click="isCartModalOpen = true"
            :style="{ backgroundColor: buttonColor, color: buttonTextColor }"
            class="w-full font-black py-4 px-6 rounded shadow-[0_10px_40px_rgba(0,0,0,0.4)] flex items-center justify-between hover:scale-[1.02] active:scale-95 transition-all"
          >
            <div class="flex items-center gap-3">
              <div
                class="bg-black/20 px-3 py-1 rounded text-sm"
                :style="{ color: buttonTextColor }"
              >
                {{ cartQuantity }}
              </div>
              <span class="text-lg tracking-tight">Ver carrinho</span>
            </div>
            <span class="text-lg">{{ formatCurrency(cartTotal) }}</span>
          </button>
        </div>
      </Transition>

      <Teleport to="body">
        <Transition
          enter-active-class="transition duration-300"
          enter-from-class="opacity-0"
          leave-active-class="transition duration-200"
          leave-to-class="opacity-0"
        >
          <div
            v-if="isProductModalOpen"
            class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          >
            <div
              class="w-full sm:max-w-md rounded-t sm:rounded overflow-hidden flex flex-col max-h-[90vh] shadow-2xl animate-slideUp sm:animate-none"
              :style="{ backgroundColor: cardBg, fontFamily, color: textColor }"
            >
              <div
                class="p-6 flex justify-between items-center shrink-0"
                :style="{ borderBottom: `1px solid ${adaptiveBorder}` }"
              >
                <h3 class="font-black text-2xl truncate pr-4">
                  {{ currentProduct?.name }}
                </h3>
                <button
                  @click="closeProductModal"
                  class="p-2 rounded transition-colors"
                  :style="{
                    backgroundColor: adaptiveButtonBg,
                    color: textColor,
                  }"
                >
                  <X :size="24" />
                </button>
              </div>

              <div
                class="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6"
                :style="{ backgroundColor: adaptiveSubtleBg }"
              >
                <p class="leading-relaxed text-base opacity-90">
                  {{ currentProduct?.description }}
                </p>

              <div v-if="currentProduct?.productVariations?.length > 0" class="space-y-3">
                <h4 class="font-bold uppercase tracking-wider text-sm opacity-70">Escolha o Tamanho</h4>
                <div class="flex flex-col gap-2">
                  <label
                    v-for="productVariation in currentProduct.productVariations"
                    :key="productVariation.name"
                    class="flex items-center justify-between p-4 border rounded cursor-pointer transition-all"
                    :style="selectedProductVariation?.name === productVariation.name
                      ? { borderColor: buttonColor, backgroundColor: buttonColor + '1A' }
                      : { borderColor: adaptiveBorder, backgroundColor: adaptiveInputBg }"
                  >
                    <div class="flex items-center gap-3">
                      <input type="radio" :value="productVariation" v-model="selectedProductVariation" class="w-5 h-5" :style="{ accentColor: buttonColor }" />
                      <span class="font-bold">{{ productVariation.name }}</span>
                    </div>
                    <span class="font-bold" :style="{ color: selectedProductVariation?.name === productVariation.name ? buttonColor : textColor }">
                      {{ formatCurrency(productVariation.addPrice) }}
                    </span>
                  </label>
                </div>
              </div>

                <div v-if="observacoesPermitidas" class="space-y-3">
                  <label
                    class="block text-sm font-bold uppercase tracking-wider opacity-70"
                    >Alguma observação?</label
                  >
                  <textarea
                    v-model="currentObservation"
                    placeholder="Ex: Tirar cebola..."
                    rows="2"
                    class="w-full border rounded p-4 focus:outline-none transition-all resize-none adaptive-placeholder"
                    :style="{
                      color: textColor,
                      backgroundColor: adaptiveInputBg,
                      borderColor: adaptiveBorder,
                      '--ph': adaptivePlaceholder,
                    }"
                  ></textarea>
                </div>

                <div
                  class="flex items-center justify-between p-5 rounded border"
                  :style="{
                    backgroundColor: adaptiveInputBg,
                    borderColor: adaptiveBorder,
                  }"
                >
                  <span class="font-bold text-lg">Quantidade</span>
                  <div class="flex items-center gap-5">
                    <button
                      @click="currentQuantity > 1 ? currentQuantity-- : null"
                      class="w-12 h-12 rounded flex items-center justify-center transition-all active:scale-95 shadow-sm"
                      :style="{
                        backgroundColor: adaptiveButtonBg,
                        color: textColor,
                      }"
                    >
                      <Minus :size="20" />
                    </button>
                    <span class="font-black text-2xl w-8 text-center">{{
                      currentQuantity
                    }}</span>
                    <button
                      @click="currentQuantity++"
                      class="w-12 h-12 rounded flex items-center justify-center transition-all active:scale-95 shadow-sm"
                      :style="{
                        backgroundColor: adaptiveButtonBg,
                        color: textColor,
                      }"
                    >
                      <Plus :size="20" />
                    </button>
                  </div>
                </div>
              </div>

            <div class="p-6 shrink-0" :style="{ borderTop: `1px solid ${adaptiveBorder}` }">
              <button @click="addToCart" :disabled="!selectedProductVariation" :style="{ backgroundColor: buttonColor, color: buttonTextColor }" class="w-full py-5 font-black rounded shadow-xl transition-transform active:scale-95 flex items-center justify-between px-8 text-lg disabled:opacity-50">
                <span>{{ selectedProductVariation ? 'Adicionar' : 'Selecione um tamanho' }}</span>
                <span>{{ formatCurrency(currentModalTotal) }}</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>            
        <Transition
          enter-active-class="transition duration-300"
          enter-from-class="opacity-0"
          leave-active-class="transition duration-200"
          leave-to-class="opacity-0"
        >
          <div
            v-if="isCartModalOpen"
            class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          >
            <div
              class="w-full sm:max-w-md rounded-t sm:rounded overflow-hidden flex flex-col max-h-[90vh] shadow-2xl animate-slideUp sm:animate-none"
              :style="{ backgroundColor: cardBg, fontFamily, color: textColor }"
            >
              <div
                class="p-6 flex justify-between items-center shrink-0"
                :style="{ borderBottom: `1px solid ${adaptiveBorder}` }"
              >
                <div class="flex items-center gap-3">
                  <ShoppingBag :size="28" :style="{ color: buttonColor }" />
                  <h3 class="font-black text-2xl">Meu Pedido</h3>
                </div>
                <button
                  @click="isCartModalOpen = false"
                  class="p-2 rounded transition-colors"
                  :style="{
                    backgroundColor: adaptiveButtonBg,
                    color: textColor,
                  }"
                >
                  <X :size="24" />
                </button>
              </div>

            <div class="p-4 overflow-y-auto custom-scrollbar flex-1" :style="{ backgroundColor: adaptiveSubtleBg }">
              <div class="space-y-3">
                <div v-for="(item, index) in cart" :key="item.id" class="p-5 rounded border flex gap-4 items-center relative overflow-hidden" :style="{ backgroundColor: adaptiveInputBg, borderColor: adaptiveBorder }">
                  <div class="font-black w-10 h-10 rounded flex items-center justify-center shrink-0 text-sm" :style="{ backgroundColor: adaptiveButtonBg, color: textColor }">{{ item.quantity }} x</div>
                  <div class="flex-1">
                    <div class="flex justify-between items-start mb-1">
                      <h4 class="font-bold text-lg leading-tight">{{ item.name }} <span class="text-sm font-medium opacity-60">({{ item.variationName }})</span></h4>
                      <span class="font-black ml-2">{{ formatCurrency(item.price) }}</span>
                    </div>
                    <p v-if="item.obs" class="text-sm inline-block px-3 py-1 rounded mt-2 font-medium border" :style="{ backgroundColor: adaptiveButtonBg, borderColor: adaptiveBorder }">Obs: {{ item.obs }}</p>
                  </div>
                  <button @click="removeFromCart(index)" class="text-red-400 p-2 rounded transition-colors shrink-0" :style="{ backgroundColor: adaptiveButtonBg }">
                    <Trash2 :size="20" />
                  </button>
                </div>
              </div>
            </div>

              <div
                class="p-6 shrink-0 space-y-5"
                :style="{ borderTop: `1px solid ${adaptiveBorder}` }"
              >
                <div class="flex justify-between items-center text-lg">
                  <span
                    class="font-bold opacity-60 uppercase tracking-wider text-sm"
                    >Total</span
                  >
                  <span class="font-black text-3xl">{{
                    formatCurrency(cartTotal)
                  }}</span>
                </div>
                <button
                  @click="openComandaModal"
                  :style="{
                    backgroundColor: buttonColor,
                    color: buttonTextColor,
                  }"
                  class="w-full py-5 font-black rounded shadow-xl transition-transform active:scale-95 flex justify-center items-center gap-2 text-lg"
                >
                  Enviar para a Cozinha
                </button>
              </div>
            </div>
          </div>
        </Transition>
        <Transition
          enter-active-class="transition duration-300"
          enter-from-class="opacity-0"
          leave-active-class="transition duration-200"
          leave-to-class="opacity-0"
        >
          <div
            v-if="isComandaModalOpen"
            class="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4"
          >
            <div
              class="w-full sm:max-w-md rounded-t sm:rounded overflow-hidden flex flex-col max-h-[85vh] shadow-2xl animate-slideUp sm:animate-none"
              :style="{ backgroundColor: cardBg, fontFamily, color: textColor }"
            >
              <div
                class="p-6 flex justify-between items-center shrink-0"
                :style="{ borderBottom: `1px solid ${adaptiveBorder}` }"
              >
                <h3 class="font-black text-2xl" :style="{ color: textColor }">
                  Vincular Comanda
                </h3>
                <button
                  @click="isComandaModalOpen = false"
                  class="p-2 rounded transition-colors"
                  :style="{
                    backgroundColor: adaptiveButtonBg,
                    color: textColor,
                  }"
                >
                  <X :size="24" />
                </button>
              </div>

            <div class="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-5" :style="{ backgroundColor: adaptiveSubtleBg }">

              <!-- Comandas abertas -->
              <div v-if="comandas.length > 0">
                <p class="text-xs font-black uppercase tracking-widest opacity-60 mb-3" :style="{ color: textColor }">
                  Comandas Abertas
                </p>
                <div class="space-y-2">
                  <button
                    v-for="comanda in comandas"
                    :key="comanda.id"
                    @click="selectedComandaId = comanda.id"
                    class="w-full p-4 rounded border-2 text-left transition-all flex justify-between items-center"
                    :style="selectedComandaId === comanda.id
                      ? { borderColor: buttonColor, backgroundColor: buttonColor + '22' }
                      : { borderColor: adaptiveBorder, backgroundColor: adaptiveInputBg }"
                  >
                    <span class="font-black text-base" :style="{ color: textColor }">{{ comanda.description }}</span>
                    <span class="text-xs opacity-60 font-bold" :style="{ color: textColor }">{{ comanda.orders.length }} pedido(s)</span>
                  </button>
                </div>
              </div>

                <div>
                <p class="text-xs font-black uppercase tracking-widest opacity-60 mb-3" :style="{ color: textColor }">
                  Nova {{ comandaUnitLabel }}
                </p>
                <div
                  class="rounded border-2 transition-all overflow-hidden"
                  :style="selectedComandaId === 'new'
                    ? { borderColor: buttonColor, backgroundColor: buttonColor + '22' }
                    : { borderColor: adaptiveBorder, backgroundColor: adaptiveInputBg }"
                >
                  <button
                    @click="selectedComandaId = 'new'"
                    class="w-full p-4 text-left font-black text-base transition-all"
                    :style="{ color: textColor }"
                  >
                    + Criar {{ comandaUnitLabel }}
                  </button>
                  <div v-if="selectedComandaId === 'new'" class="px-4 pb-4 flex flex-col gap-2">
                    <div class="flex items-center gap-3">
                      <span class="font-bold text-sm shrink-0" :style="{ color: textColor }">{{ comandaUnitLabel }}</span>
                      <input
                        v-model="newComandaNumber"
                        type="text"
                        placeholder="Número ou nome..."
                        class="flex-1 border rounded px-3 py-2 font-bold text-sm outline-none adaptive-placeholder"
                        :style="{ color: textColor, backgroundColor: adaptiveInputBg, borderColor: adaptiveBorder, '--ph': adaptivePlaceholder }"
                      />
                    </div>
                    <button
                      type="button"
                      @click="newComandaNumber = String(Math.floor(Math.random() * 900) + 100)"
                      class="w-full py-2 rounded text-xs font-black uppercase tracking-widest transition-all text-center"
                      :style="{ backgroundColor: adaptiveButtonBg, color: textColor }"
                    >
                      # Número Aleatório
                    </button>
                  </div>
                </div>
              </div>

            </div>

              <div
                class="p-5 shrink-0"
                :style="{ borderTop: `1px solid ${adaptiveBorder}` }"
              >
                <button
                  @click="confirmAndSendToKitchen"
                  :disabled="
                    !selectedComandaId ||
                    (selectedComandaId === 'new' && !newComandaNumber.trim()) ||
                    isSubmitting
                  "
                  :style="{
                    backgroundColor: buttonColor,
                    color: buttonTextColor,
                  }"
                  class="w-full py-5 font-black rounded shadow-xl transition-transform active:scale-95 flex justify-center items-center gap-2 text-lg disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChefHat v-if="!isSubmitting" :size="20" />
                  <span
                    v-if="isSubmitting"
                    class="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  ></span>
                  <span>{{
                    isSubmitting ? "Enviando..." : "Confirmar e Enviar"
                  }}</span>
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>

      <Transition
        appear
        enter-active-class="transition duration-500 ease-out"
        enter-from-class="translate-x-full opacity-0"
        enter-to-class="translate-x-0 opacity-100"
        leave-active-class="transition duration-400 ease-in"
        leave-from-class="translate-x-0 opacity-100"
        leave-to-class="translate-x-full opacity-0"
      >
        <aside
          v-if="isEditMode"
          class="fixed top-0 right-0 w-full sm:w-80 h-screen bg-white border-l border-[#E0E0E0] z-[100] flex flex-col shadow-xl font-inter"
        >
          <div
            class="p-5 border-b border-[#E0E0E0] flex items-center justify-between bg-gray-50 shrink-0"
          >
            <h2 class="font-bold text-lg flex items-center gap-2 text-primary">
              <Palette :size="20" /> Editor Visual
            </h2>
            <div class="flex items-center gap-2">
              <button
                @click="router.push('/app/dashboard')"
                class="text-[#757575] hover:text-primary transition-colors bg-gray-100 p-1.5 rounded"
                title="Ir ao Dashboard"
              >
                <ArrowLeft :size="18" />
              </button>
              <button
                @click="closeVisuals"
                class="text-[#757575] hover:text-danger transition-colors bg-gray-100 p-1.5 rounded"
                title="Fechar editor"
              >
                <X :size="20" />
              </button>
            </div>
          </div>

          <div class="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
            <div
              class="bg-primary-light border border-primary/20 p-4 rounded text-primary text-sm leading-relaxed"
            >
              As alterações são aplicadas instantaneamente no cardápio.
            </div>

            <div class="space-y-1">
              <p
                class="text-[10px] font-black uppercase tracking-widest text-[#757575] mb-3"
              >
                Cores
              </p>
              <div
                class="flex items-center justify-between py-2.5 border-b border-[#E0E0E0]"
              >
                <label class="text-sm font-bold text-[#212121]"
                  >Fundo Geral</label
                >
                <input
                  type="color"
                  v-model="bgColor"
                  class="h-9 w-12 rounded cursor-pointer border border-[#E0E0E0] p-0.5"
                />
              </div>
              <div
                class="flex items-center justify-between py-2.5 border-b border-[#E0E0E0]"
              >
                <label class="text-sm font-bold text-[#212121]"
                  >Texto Principal</label
                >
                <input
                  type="color"
                  v-model="textColor"
                  class="h-9 w-12 rounded cursor-pointer border border-[#E0E0E0] p-0.5"
                />
              </div>
              <div
                class="flex items-center justify-between py-2.5 border-b border-[#E0E0E0]"
              >
                <label class="text-sm font-bold text-[#212121]"
                  >Fundo dos Produtos</label
                >
                <input
                  type="color"
                  v-model="cardBg"
                  class="h-9 w-12 rounded cursor-pointer border border-[#E0E0E0] p-0.5"
                />
              </div>
              <div
                class="flex items-center justify-between py-2.5 border-b border-[#E0E0E0]"
              >
                <label class="text-sm font-bold text-[#212121]"
                  >Categoria Ativa</label
                >
                <input
                  type="color"
                  v-model="categoryColor"
                  class="h-9 w-12 rounded cursor-pointer border border-[#E0E0E0] p-0.5"
                />
              </div>
              <div
                class="flex items-center justify-between py-2.5 border-b border-[#E0E0E0]"
              >
                <label class="text-sm font-bold text-[#212121]"
                  >Cor dos Botões</label
                >
                <input
                  type="color"
                  v-model="buttonColor"
                  class="h-9 w-12 rounded cursor-pointer border border-[#E0E0E0] p-0.5"
                />
              </div>
              <div class="flex items-center justify-between py-2.5">
                <label class="text-sm font-bold text-[#212121]"
                  >Texto dos Botões</label
                >
                <input
                  type="color"
                  v-model="buttonTextColor"
                  class="h-9 w-12 rounded cursor-pointer border border-[#E0E0E0] p-0.5"
                />
              </div>
            </div>

            <div class="pt-2">
              <label
                class="block text-[10px] font-black uppercase tracking-widest text-[#757575] mb-2"
                >Fonte</label
              >
              <select
                v-model="fontFamily"
                class="w-full bg-white border border-[#E0E0E0] text-[#212121] p-3 rounded focus:border-primary focus:outline-none text-sm"
              >
                <option value="Inter, sans-serif">Inter (Moderna)</option>
                <option value="Roboto, sans-serif">Roboto (Clássica)</option>
                <option value="Poppins, sans-serif">
                  Poppins (Arredondada)
                </option>
                <option value="Merriweather, serif">
                  Merriweather (Elegante)
                </option>
              </select>
            </div>

            <div>
              <label
                class="block text-[10px] font-black uppercase tracking-widest text-[#757575] mb-2"
                >Nome da Unidade</label
              >
              <input
                v-model="comandaUnitLabel"
                type="text"
                placeholder="Ex: Mesa, Comanda, Cabine..."
                class="w-full bg-white border border-[#E0E0E0] text-[#212121] p-3 rounded focus:border-primary focus:outline-none text-sm"
              />
              <p class="text-[10px] text-[#757575] mt-1">
                Ex: "{{ comandaUnitLabel }} 5", "{{ comandaUnitLabel }} 12"
              </p>
            </div>

            <div>
              <label
                class="flex items-center justify-between p-4 border border-[#E0E0E0] rounded cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div>
                  <span class="block font-bold text-[#212121] mb-0.5"
                    >Permitir Observações</span
                  >
                  <span class="text-xs text-[#757575]"
                    >Clientes podem escrever nos pedidos.</span
                  >
                </div>
                <input
                  type="checkbox"
                  v-model="observacoesPermitidas"
                  class="w-5 h-5 accent-primary"
                />
              </label>
            </div>
          </div>

          <div
            class="p-5 border-t border-[#E0E0E0] bg-gray-50 space-y-3 shrink-0"
          >
            <button
              @click="saveVisuals"
              class="w-full bg-primary text-white font-black py-3.5 rounded hover:bg-primary-dark transition-colors active:scale-95 shadow-sm flex justify-center items-center gap-2"
            >
              <CheckCircle2 :size="18" /> Salvar Aparência
            </button>
            <button
              @click="closeVisuals"
              class="w-full bg-white border border-[#E0E0E0] text-[#757575] font-bold py-3 rounded hover:bg-gray-100 transition-colors"
            >
              Descartar e Sair
            </button>
          </div>
        </aside>
      </Transition>

      <ToastMessage />
    </div>
  </SubscriptionGuard>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.5);
  border-radius: 10px;
}

/* Placeholder dinâmico via CSS var --ph injetada pelo :style */
.adaptive-placeholder::placeholder {
  color: var(--ph, rgba(0, 0, 0, 0.35));
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
.animate-slideUp {
  animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
.animate-fadeIn {
  animation: fadeIn 0.3s ease-out forwards;
}
</style>
