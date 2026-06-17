<script setup>
import { ref, computed, onMounted, watch } from "vue";
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
import { BaseButton } from "@/components/ui";
import MenuCategoryCard from "@/components/menu/MenuCategoryCard.vue";
import MenuProductCard from "@/components/menu/MenuProductCard.vue";
import MenuProductModal from "@/components/menu/MenuProductModal.vue";
import MenuCartModal from "@/components/menu/MenuCartModal.vue";
import MenuComandaModal from "@/components/menu/MenuComandaModal.vue";
import MenuVisualEditor from "@/components/menu/MenuVisualEditor.vue";
import ToastMessage from "@/components/ui/ToastMessage.vue";

import { Utensils, ChefHat, ShoppingCart } from "lucide-vue-next";

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
        <!-- Header -->
        <header class="px-4 py-3 md:p-6 shrink-0 border-b border-white/10 flex items-center gap-3 md:gap-4">
          <div class="w-12 h-12 md:w-20 md:h-20 bg-white rounded flex items-center justify-center shadow-lg overflow-hidden shrink-0">
            <img v-if="imageUrl" :src="imageUrl" class="w-full h-full object-contain p-1" />
            <Utensils v-else :size="20" :style="{ color: textColor }" />
          </div>
          <div>
            <h1 class="text-lg md:text-2xl font-black tracking-tight leading-none" :style="{ color: textColor }">
              {{ establishmentName }}
            </h1>
            <p class="hidden md:block opacity-70 text-sm mt-1" :style="{ color: textColor }">O que vai desejar hoje?</p>
          </div>
        </header>

        <nav class="md:hidden shrink-0 border-b border-white/10 overflow-x-auto no-scrollbar">
          <div class="flex gap-3 px-3 py-3 min-w-max">
            <MenuCategoryCard
              v-for="category in productsByCategory"
              :key="category.id"
              :category="category"
              :isActive="activeCategoryId === category.id"
              :categoryColor="categoryColor"
              :textColor="textColor"
              variant="mobile"
              @click="activeCategoryId = category.id"
            />
          </div>
        </nav>

        <div class="flex flex-1 overflow-hidden relative">
          <aside class="hidden md:flex md:w-56 lg:w-64 overflow-y-auto custom-scrollbar p-4 border-r border-white/5 shrink-0 flex-col gap-2">
            <MenuCategoryCard
              v-for="category in productsByCategory"
              :key="category.id"
              :category="category"
              :isActive="activeCategoryId === category.id"
              :categoryColor="categoryColor"
              :textColor="textColor"
              variant="desktop"
              @click="activeCategoryId = category.id"
            />
          </aside>

          <main class="flex-1 overflow-y-auto custom-scrollbar pb-32">
            <div v-if="selectedCategory" class="animate-fadeIn">
              <div class="hidden md:block px-6 pt-6 pb-4">
                <h2 class="text-3xl font-black pb-2 border-b border-white/10 inline-block" :style="{ color: textColor }">
                  {{ selectedCategory.name }}
                </h2>
              </div>

              <div class="md:hidden flex flex-col gap-3 p-3">
                <MenuProductCard
                  v-for="product in selectedCategory.products"
                  :key="product.id"
                  :product="product"
                  :theme="theme"
                  variant="list"
                  @click="openProductModal(product)"
                />
              </div>

              <div class="hidden md:grid grid-cols-2 xl:grid-cols-3 gap-5 px-6 pb-6">
                <MenuProductCard
                  v-for="product in selectedCategory.products"
                  :key="product.id"
                  :product="product"
                  :theme="theme"
                  variant="grid"
                  @click="openProductModal(product)"
                />
              </div>
            </div>

            <div v-if="productsByCategory.length === 0" class="flex flex-col items-center justify-center h-full text-center px-6 py-16">
              <ChefHat class="w-14 h-14 mb-4 opacity-30" :style="{ color: textColor }" />
              <p class="text-base font-bold mb-2" :style="{ color: textColor }">Sem itens disponíveis no cardápio</p>
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
          <BaseButton
            size="lg"
            class="w-full shadow-[0_10px_40px_rgba(0,0,0,0.4)] hover:scale-[1.02]"
            :style="{ backgroundColor: buttonColor, color: buttonTextColor }"
            @click="isCartModalOpen = true"
          >
            <div class="flex items-center justify-between w-full font-black">
              <div class="flex items-center gap-3">
                <div class="bg-black/20 px-3 py-1 rounded-lg text-sm flex items-center gap-1.5">
                  <ShoppingCart :size="14" />
                  {{ cartQuantity }}
                </div>
                <span class="text-lg tracking-tight">Ver carrinho</span>
              </div>
              <span class="text-lg">{{ formatCurrency(cartTotal) }}</span>
            </div>
          </BaseButton>
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
          :comandas="comandaStore.comandas.filter(c => !c.isAutoatendimento)"
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

.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

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
