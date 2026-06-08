<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { getImageUrl } from "@/utils/imageUrl";
import { useMenuOrderingStore as useMenuStore } from "@/stores/menu.js";
import { useComandaStore } from "@/stores/comandaManagement";
import { useMenuTheme } from "@/composables/useMenuTheme";
import { useMenuCart } from "@/composables/useMenuCart";
import { useMenuOrder } from "@/composables/useMenuOrder";
import { useUtils } from "@/composables/useUtils";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { establishmentApi } from "@/services/establishmentApi";

import SubscriptionGuard from "@/components/SubscriptionGuard.vue";
import ToastMessage from "@/components/ui/ToastMessage.vue";
import MenuProductModal from "@/components/menu/MenuProductModal.vue";
import MenuCartModal from "@/components/menu/MenuCartModal.vue";
import MenuComandaModal from "@/components/menu/MenuComandaModal.vue";
import MenuVisualEditor from "@/components/menu/MenuVisualEditor.vue";

import { Utensils, Plus, ChefHat } from "lucide-vue-next";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const menuStore = useMenuStore();
const comandaStore = useComandaStore();
const { formatCurrency } = useUtils();

const isEditMode = ref(false);
const establishmentName = ref("Seu Restaurante");

const {
  bgColor, buttonColor, buttonTextColor, categoryColor,
  textColor, cardBg, fontFamily, comandaUnitLabel, observacoesPermitidas,
  imageUrl, isSavingTheme,
  backgroundStyle, theme,
  loadConfig, saveVisuals,
} = useMenuTheme();

const {
  cart, isProductModalOpen, isCartModalOpen,
  currentProduct, currentQuantity, currentObservation, selectedSize,
  cartQuantity, cartTotal, currentModalTotal,
  openProductModal, closeProductModal, addToCart, removeFromCart,
} = useMenuCart();

const {
  isComandaModalOpen, isSubmitting,
  openComandaModal, confirmAndSendToKitchen,
} = useMenuOrder();

const activeCategoryId = ref(null);

const productsByCategory = computed(() => {
  const activeProducts = (menuStore.activeProducts || []).filter(p => p.available !== false);
  return (menuStore.activeCategories || [])
    .map(category => ({ ...category, products: activeProducts.filter(p => p.categoryId === category.id) }))
    .filter(category => category.products.length > 0);
});

const selectedCategory = computed(() =>
  productsByCategory.value.find(c => c.id === activeCategoryId.value) || null
);

const checkEditMode = () => { isEditMode.value = route.query.editMode === "true"; };
watch(() => route.query.editMode, checkEditMode);

onMounted(async () => {
  checkEditMode();

  const estId = authStore.user?.estabelecimentoId;
  if (estId) {
    await loadConfig(estId);
    const profile = await establishmentApi.getProfile().catch(() => null);
    establishmentName.value = profile?.name || "Seu Restaurante";
  }

  await menuStore.loadData(isEditMode.value);
  await comandaStore.loadComandas();

  if (productsByCategory.value.length > 0) {
    activeCategoryId.value = productsByCategory.value[0].id;
  }
});

function handleSendToKitchen() {
  isCartModalOpen.value = false;
  openComandaModal(cart.value.length);
}

function handleOrderConfirm(selectedId, newNumber) {
  confirmAndSendToKitchen(cart.value, comandaUnitLabel.value, selectedId, newNumber, () => {
    cart.value = [];
    isCartModalOpen.value = false;
  });
}

function closeVisuals() {
  isEditMode.value = false;
  router.push("/app/dashboard");
}
</script>

<template>
  <SubscriptionGuard featureName="O Cardápio">
    <div
      class="min-h-screen flex flex-col font-inter relative"
      :class="{ 'sm:pr-80': isEditMode }"
      :style="[{ fontFamily }, backgroundStyle]"
    >
      <div v-if="imageUrl" class="absolute inset-0 z-0 fixed" />

      <div class="relative z-10 flex flex-col h-screen overflow-hidden max-w-7xl mx-auto w-full">
        <header class="p-4 sm:p-6 shrink-0 border-b border-white/10 flex items-center gap-4">
          <div class="w-20 h-20 bg-white rounded flex items-center justify-center shadow-lg overflow-hidden">
            <img v-if="imageUrl" :src="imageUrl" class="w-full h-full object-contain p-1" />
            <Utensils v-else :size="24" :style="{ color: textColor }" />
          </div>
          <div>
            <h1 class="text-2xl font-black tracking-tight leading-none" :style="{ color: textColor }">
              {{ establishmentName }}
            </h1>
            <p class="opacity-70 text-sm mt-1" :style="{ color: textColor }">O que vai desejar hoje?</p>
          </div>
        </header>

        <div class="flex flex-1 overflow-hidden relative">
          <aside class="w-1/3 sm:w-64 overflow-y-auto custom-scrollbar p-3 sm:p-4 border-r border-white/5 shrink-0">
            <button
              v-for="category in productsByCategory"
              :key="category.id"
              @click="activeCategoryId = category.id"
              class="relative w-full text-left rounded mb-3 transition-all shadow-sm flex overflow-hidden group"
              :class="[
                activeCategoryId === category.id ? 'shadow-lg scale-[1.02] z-10' : 'hover:scale-[1.02] hover:bg-white/5',
                category.image ? 'h-24 sm:h-28 items-end p-4' : 'p-4 items-center justify-between',
              ]"
              :style="!category.image
                ? activeCategoryId === category.id
                  ? { backgroundColor: categoryColor, color: '#FFFFFF' }
                  : { color: textColor }
                : {}"
            >
              <template v-if="category.image">
                <div
                  class="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                  :style="{ backgroundImage: `url(${getImageUrl(category.image)})` }"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div
                  class="absolute inset-0 transition-opacity duration-300"
                  :style="{ backgroundColor: categoryColor, opacity: activeCategoryId === category.id ? 0.6 : 0 }"
                />
                <div
                  v-if="activeCategoryId === category.id"
                  class="absolute inset-0 border-[1px] rounded transition-all"
                  :style="{ borderColor: categoryColor }"
                />
              </template>
              <span
                class="relative z-10 truncate w-full tracking-wide"
                :class="category.image ? 'text-white text-lg font-black drop-shadow-lg' : 'text-sm sm:text-base font-bold'"
              >
                {{ category.name }}
              </span>
            </button>
          </aside>

          <main class="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 pb-32">
            <div v-if="selectedCategory" class="animate-fadeIn">
              <h2 class="text-3xl font-black mb-6 pb-2 border-b border-white/10 inline-block" :style="{ color: textColor }">
                {{ selectedCategory.name }}
              </h2>
              <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                <div
                  v-for="product in selectedCategory.products"
                  :key="product.id"
                  @click="openProductModal(product)"
                  class="rounded p-5 shadow-xl cursor-pointer hover:-translate-y-1 transition-all duration-300 flex flex-col h-full border border-white/5 group relative overflow-hidden"
                  :style="{ backgroundColor: cardBg }"
                >
                  <div
                    v-if="product.image"
                    class="w-full h-40 rounded mb-4 bg-cover bg-center shadow-inner"
                    :style="{ backgroundImage: `url(${getImageUrl(product.image)})` }"
                  />
                  <div class="flex-1 z-10">
                    <h3 class="font-bold text-xl mb-2 leading-tight" :style="{ color: textColor }">{{ product.name }}</h3>
                    <p class="text-sm opacity-70 line-clamp-2" :style="{ color: textColor }">{{ product.description }}</p>
                  </div>
                  <div class="flex items-center justify-between mt-6 pt-4 border-t border-white/5 z-10">
                    <div class="flex flex-col">
                      <span
                        v-if="product.sizes?.length > 1"
                        class="text-[10px] opacity-70 uppercase tracking-widest font-bold mb-0.5"
                        :style="{ color: textColor }"
                      >A partir de</span>
                      <span class="font-black text-xl" :style="{ color: buttonColor }">
                        {{ formatCurrency(product.sizes?.[0]?.price ?? product.price ?? 0) }}
                      </span>
                    </div>
                    <div
                      class="w-10 h-10 rounded flex items-center justify-center font-bold transition-transform group-hover:scale-110 shadow-lg"
                      :style="{ backgroundColor: buttonColor, color: buttonTextColor }"
                    >
                      <Plus :size="20" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="productsByCategory.length === 0" class="flex flex-col items-center justify-center h-full text-center px-6 py-12">
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
        <div v-if="cart.length > 0" class="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-xl px-4 z-40">
          <button
            @click="isCartModalOpen = true"
            :style="{ backgroundColor: buttonColor, color: buttonTextColor }"
            class="w-full font-black py-4 px-6 rounded shadow-[0_10px_40px_rgba(0,0,0,0.4)] flex items-center justify-between hover:scale-[1.02] active:scale-95 transition-all"
          >
            <div class="flex items-center gap-3">
              <div class="bg-black/20 px-3 py-1 rounded text-sm" :style="{ color: buttonTextColor }">{{ cartQuantity }}</div>
              <span class="text-lg tracking-tight">Ver carrinho</span>
            </div>
            <span class="text-lg">{{ formatCurrency(cartTotal) }}</span>
          </button>
        </div>
      </Transition>

      <Teleport to="body">
        <MenuProductModal
          v-if="isProductModalOpen"
          :product="currentProduct"
          :quantity="currentQuantity"
          :observation="currentObservation"
          :selectedSize="selectedSize"
          :observacoesPermitidas="observacoesPermitidas"
          :total="currentModalTotal"
          :theme="theme"
          @update:quantity="currentQuantity = $event"
          @update:observation="currentObservation = $event"
          @update:selectedSize="selectedSize = $event"
          @close="closeProductModal"
          @add="addToCart"
        />

        <MenuCartModal
          v-if="isCartModalOpen"
          :cart="cart"
          :cartTotal="cartTotal"
          :theme="theme"
          @close="isCartModalOpen = false"
          @removeItem="removeFromCart"
          @sendToKitchen="handleSendToKitchen"
        />

        <MenuComandaModal
          v-if="isComandaModalOpen"
          :comandas="comandaStore.comandas"
          :comandaUnitLabel="comandaUnitLabel"
          :isSubmitting="isSubmitting"
          :theme="theme"
          @close="isComandaModalOpen = false"
          @confirm="handleOrderConfirm"
        />
      </Teleport>

      <MenuVisualEditor
        v-if="isEditMode"
        :bgColor="bgColor"
        :textColor="textColor"
        :cardBg="cardBg"
        :categoryColor="categoryColor"
        :buttonColor="buttonColor"
        :buttonTextColor="buttonTextColor"
        :fontFamily="fontFamily"
        :comandaUnitLabel="comandaUnitLabel"
        :observacoesPermitidas="observacoesPermitidas"
        :isSaving="isSavingTheme"
        @update:bgColor="bgColor = $event"
        @update:textColor="textColor = $event"
        @update:cardBg="cardBg = $event"
        @update:categoryColor="categoryColor = $event"
        @update:buttonColor="buttonColor = $event"
        @update:buttonTextColor="buttonTextColor = $event"
        @update:fontFamily="fontFamily = $event"
        @update:comandaUnitLabel="comandaUnitLabel = $event"
        @update:observacoesPermitidas="observacoesPermitidas = $event"
        @save="saveVisuals"
        @close="closeVisuals"
      />

      <ToastMessage />
    </div>
  </SubscriptionGuard>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(156,163,175,0.5); border-radius: 10px; }

@keyframes slideUp {
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
.animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
</style>
