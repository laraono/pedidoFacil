<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useMenuStore } from '@/stores/productsManagement';
import { useComandaStore } from '@/stores/comandaManagement';
import { useKitchenStore } from '@/stores/kitchen';
import { useToast } from '@/composables/useToast';
import localStorageService from '@/services/localStorageService';
import { getEstablishmentMock } from '@/mock/stablishmentmock';
import ToastMessage from '@/components/ui/ToastMessage.vue';
import { useUtils } from '@/composables/useUtils';
import {
  Utensils, X, Plus, Minus, ShoppingBag,
  Trash2, ChefHat, CheckCircle2, Palette,
} from 'lucide-vue-next';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const isEditMode = ref(false);

const menuStore = useMenuStore();
const comandaStore = useComandaStore();
const kitchenStore = useKitchenStore();
const { formatCurrency } = useUtils();
const { showToast } = useToast();

const establishmentName = ref('Carregando...');
const imageUrl = ref('');
const bgColor = ref('#0B0E11');
const buttonColor = ref('#00FF85');
const buttonTextColor = ref('#000000');
const categoryColor = ref('#009DFF');
const textColor = ref('#FFFFFF');
const cardBg = ref('#1A1E24');
const fontFamily = ref('Inter, sans-serif');
const observacoesPermitidas = ref(true);

const cart = ref([]);
const isProductModalOpen = ref(false);
const isCartModalOpen = ref(false);
const activeCategoryId = ref(null);

const currentProduct = ref(null);
const currentQuantity = ref(1);
const currentObservation = ref('');
const selectedSize = ref(null);

onMounted(async () => {
  bgColor.value = localStorageService.getBackgroundColors() || '#0B0E11';
  buttonColor.value = localStorageService.getButtonColors() || '#00FF85';
  buttonTextColor.value = localStorageService.getButtonTextColor() || '#000000';
  categoryColor.value = localStorageService.getCategoryColors() || '#009DFF';
  textColor.value = localStorageService.getTextColor() || '#FFFFFF';
  cardBg.value = localStorageService.getProductCardBg() || '#1A1E24';
  fontFamily.value = localStorageService.getFontFamily() || 'Inter, sans-serif';

  const savedImage = localStorageService.getImage();
  if (savedImage) imageUrl.value = savedImage;

  const data = await getEstablishmentMock();
  establishmentName.value = data?.info?.name || 'Seu Restaurante';

  if (productsByCategory.value.length > 0) {
    activeCategoryId.value = productsByCategory.value[0].id;
  }
  checkEditMode();
});

const backgroundStyle = computed(() => ({ backgroundColor: bgColor.value }));

const productsByCategory = computed(() => {
  const activeProducts = menuStore.activeProducts;
  return menuStore.activeCategories.map(category => ({
    ...category,
    products: activeProducts.filter(p => p.categoryId === category.id),
  })).filter(category => category.products.length > 0);
});

const selectedCategory = computed(() => productsByCategory.value.find(c => c.id === activeCategoryId.value) || null);
const cartQuantity = computed(() => cart.value.length);
const cartTotal = computed(() => cart.value.reduce((acc, item) => acc + item.price, 0));

const currentModalTotal = computed(() => {
  if (!currentProduct.value) return 0;
  const basePrice = selectedSize.value ? selectedSize.value.price : 0;
  return basePrice * currentQuantity.value;
});

const openProductModal = (product) => {
  currentProduct.value = product;
  currentQuantity.value = 1;
  currentObservation.value = '';
  selectedSize.value = product.sizes?.length > 0 ? product.sizes[0] : null;
  isProductModalOpen.value = true;
};

const closeProductModal = () => {
  isProductModalOpen.value = false;
  setTimeout(() => { currentProduct.value = null; }, 300);
};

const addToCart = () => {
  if (!currentProduct.value || !selectedSize.value) return;
  const unitPrice = selectedSize.value.price;
  for (let i = 0; i < currentQuantity.value; i++) {
    cart.value.push({
      id: Date.now() + Math.random(),
      productId: currentProduct.value.id,
      name: currentProduct.value.name,
      sizeName: selectedSize.value.name,
      price: unitPrice,
      quantity: 1,
      obs: currentObservation.value,
    });
  }
  showToast(`${currentQuantity.value}x ${currentProduct.value.name} adicionado!`, 'success');
  closeProductModal();
};

const removeFromCart = (index) => {
  cart.value.splice(index, 1);
  if (cart.value.length === 0) isCartModalOpen.value = false;
};

const finalizeOrder = () => {
  if (cart.value.length === 0) return;

  const finalOrder = {
    id: Date.now(),
    price: cartTotal.value,
    items: cart.value.map(item => ({
      name: `${item.name} (${item.sizeName})`,
      amount: 1,
      obs: item.obs,
      price: item.price,
    })),
  };

  const kitchenOrder = {
    id: Date.now(),
    table: 'Balcão',
    waiter: 'Autoatendimento',
    status: 'pending',
    createdAt: new Date(),
    items: cart.value.map(item => ({
      name: `${item.name} (${item.sizeName})`,
      amount: 1,
      obs: item.obs,
    })),
  };

  comandaStore.addComanda(finalOrder);
  kitchenStore.addOrder(kitchenOrder);

  cart.value = [];
  isCartModalOpen.value = false;
  showToast('Pedido enviado para a cozinha com sucesso!', 'success');
};

const saveVisuals = () => {
  localStorageService.saveBackgroundColors(bgColor.value);
  localStorageService.saveButtonColors(buttonColor.value);
  localStorageService.saveButtonTextColor(buttonTextColor.value);
  localStorageService.saveCategoryColors(categoryColor.value);
  localStorageService.saveFontFamily(fontFamily.value);
  localStorageService.saveTextColor(textColor.value);
  localStorageService.saveProductCardBg(cardBg.value);
  showToast('Aparência salva com sucesso!', 'success');
  closeVisuals();
};

const closeVisuals = () => {
  isEditMode.value = false;
  router.push({ path: route.path });
};

const checkEditMode = () => {
  if (route.query.editMode === 'true') {
    setTimeout(() => { isEditMode.value = true; }, 150);
  } else {
    isEditMode.value = false;
  }
};

watch(() => route.query.editMode, () => { checkEditMode(); });
</script>

<template>
  <div
    class="min-h-screen flex flex-col font-inter relative"
    :class="{ 'sm:pr-80': isEditMode }"
    :style="[{ fontFamily }, backgroundStyle]"
  >
    <div v-if="imageUrl" class="absolute inset-0 bg-black/70 z-0 fixed"></div>

    <div class="relative z-10 flex flex-col h-screen overflow-hidden max-w-7xl mx-auto w-full">
      <header class="p-4 sm:p-6 shrink-0 border-b border-white/10 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg overflow-hidden bg-white" :style="{ backgroundColor: cardBg }">
          <img v-if="imageUrl" :src="imageUrl" class="w-full h-full object-contain p-1" />
          <Utensils v-else :size="24" :style="{ color: textColor }" />
        </div>
        <div>
          <h1 class="text-2xl font-black tracking-tight leading-none" :style="{ color: textColor }">{{ establishmentName }}</h1>
          <p class="opacity-70 text-sm mt-1" :style="{ color: textColor }">O que vai desejar hoje?</p>
        </div>
      </header>

      <div class="flex flex-1 overflow-hidden relative">
        <aside class="w-1/3 sm:w-64 overflow-y-auto custom-scrollbar p-3 sm:p-4 border-r border-white/5 shrink-0">
          <button
            v-for="category in productsByCategory"
            :key="category.id"
            @click="activeCategoryId = category.id"
            class="relative w-full text-left rounded-2xl mb-3 transition-all shadow-sm flex overflow-hidden group"
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
              <div v-if="activeCategoryId === category.id" class="absolute inset-0 border-[1px] rounded-2xl transition-all" :style="{ borderColor: categoryColor }"></div>
            </template>
            <span class="relative z-10 truncate w-full tracking-wide" :class="category.image ? 'text-white text-lg font-black drop-shadow-lg' : 'text-sm sm:text-base font-bold'">
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
                class="rounded-3xl p-5 shadow-xl cursor-pointer hover:-translate-y-1 transition-all duration-300 flex flex-col h-full border border-white/5 group relative overflow-hidden"
                :style="{ backgroundColor: cardBg }"
              >
                <div v-if="product.image" class="w-full h-40 rounded-2xl mb-4 bg-cover bg-center shadow-inner" :style="{ backgroundImage: `url(${product.image})` }"></div>
                <div class="flex-1 z-10">
                  <h3 class="font-bold text-xl mb-2 leading-tight" :style="{ color: textColor }">{{ product.name }}</h3>
                  <p class="text-sm opacity-70 line-clamp-2" :style="{ color: textColor }">{{ product.description }}</p>
                </div>
                <div class="flex items-center justify-between mt-6 pt-4 border-t border-white/5 z-10">
                  <div class="flex flex-col">
                    <span v-if="product.sizes?.length > 1" class="text-[10px] opacity-70 uppercase tracking-widest font-bold mb-0.5" :style="{ color: textColor }">A partir de</span>
                    <span class="font-black text-xl" :style="{ color: buttonColor }">{{ formatCurrency(product.sizes?.[0]?.price || 0) }}</span>
                  </div>
                  <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold transition-transform group-hover:scale-110 shadow-lg" :style="{ backgroundColor: buttonColor, color: buttonTextColor }">
                    <Plus :size="20" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="productsByCategory.length === 0" class="flex flex-col items-center justify-center h-full opacity-50">
            <ChefHat class="w-16 h-16 mb-4" :style="{ color: textColor }" />
            <p class="text-lg font-bold" :style="{ color: textColor }">O cardápio está a ser preparado.</p>
          </div>
        </main>
      </div>
    </div>

    <Transition enter-active-class="transition-transform duration-300 ease-out" enter-from-class="translate-y-24 opacity-0" leave-active-class="transition-transform duration-200 ease-in" leave-to-class="translate-y-24 opacity-0">
      <div v-if="cart.length > 0" class="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-xl px-4 z-40">
        <button @click="isCartModalOpen = true" :style="{ backgroundColor: buttonColor, color: buttonTextColor }" class="w-full font-black py-4 px-6 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.4)] flex items-center justify-between hover:scale-[1.02] active:scale-95 transition-all">
          <div class="flex items-center gap-3">
            <div class="bg-black/20 px-3 py-1 rounded-full text-sm" :style="{ color: buttonTextColor }">{{ cartQuantity }}</div>
            <span class="text-lg tracking-tight">Ver carrinho</span>
          </div>
          <span class="text-lg">{{ formatCurrency(cartTotal) }}</span>
        </button>
      </div>
    </Transition>

    <Teleport to="body">
      <Transition enter-active-class="transition duration-300" enter-from-class="opacity-0" leave-active-class="transition duration-200" leave-to-class="opacity-0">
        <div v-if="isProductModalOpen" class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div class="w-full sm:max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden flex flex-col max-h-[90vh] shadow-2xl animate-slideUp sm:animate-none" :style="{ backgroundColor: cardBg, fontFamily, color: textColor }">
            
            <div class="p-6 flex justify-between items-center border-b border-white/10 shrink-0">
              <h3 class="font-black text-2xl truncate pr-4">{{ currentProduct?.name }}</h3>
              <button @click="closeProductModal" class="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors" :style="{ color: textColor }">
                <X :size="24" />
              </button>
            </div>

            <div class="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6 bg-black/5">
              <p class="leading-relaxed text-base opacity-90">{{ currentProduct?.description }}</p>

              <div v-if="currentProduct?.sizes?.length > 0" class="space-y-3">
                <h4 class="font-bold uppercase tracking-wider text-sm opacity-70">Escolha o Tamanho</h4>
                <div class="flex flex-col gap-2">
                  <label
                    v-for="size in currentProduct.sizes"
                    :key="size.name"
                    class="flex items-center justify-between p-4 border rounded-2xl cursor-pointer transition-all"
                    :style="selectedSize?.name === size.name
                      ? { borderColor: buttonColor, backgroundColor: buttonColor + '1A' }
                      : { borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)' }"
                  >
                    <div class="flex items-center gap-3">
                      <input type="radio" :value="size" v-model="selectedSize" class="w-5 h-5" :style="{ accentColor: buttonColor }" />
                      <span class="font-bold">{{ size.name }}</span>
                    </div>
                    <span class="font-bold" :style="{ color: selectedSize?.name === size.name ? buttonColor : textColor }">
                      {{ formatCurrency(size.price) }}
                    </span>
                  </label>
                </div>
              </div>

              <div v-if="observacoesPermitidas" class="space-y-3">
                <label class="block text-sm font-bold uppercase tracking-wider opacity-70">Alguma observação?</label>
                <textarea v-model="currentObservation" placeholder="Ex: Tirar cebola..." rows="2" class="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none transition-all resize-none placeholder:opacity-30" :style="{ color: textColor }"></textarea>
              </div>

              <div class="flex items-center justify-between bg-white/5 p-5 rounded-3xl border border-white/10">
                <span class="font-bold text-lg">Quantidade</span>
                <div class="flex items-center gap-5">
                  <button @click="currentQuantity > 1 ? currentQuantity-- : null" class="w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-sm bg-white/10" :style="{ color: textColor }">
                    <Minus :size="20" />
                  </button>
                  <span class="font-black text-2xl w-8 text-center">{{ currentQuantity }}</span>
                  <button @click="currentQuantity++" class="w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-sm bg-white/10" :style="{ color: textColor }">
                    <Plus :size="20" />
                  </button>
                </div>
              </div>
            </div>

            <div class="p-6 border-t border-white/10 shrink-0">
              <button @click="addToCart" :disabled="!selectedSize" :style="{ backgroundColor: buttonColor, color: buttonTextColor }" class="w-full py-5 font-black rounded-2xl shadow-xl transition-transform active:scale-95 flex items-center justify-between px-8 text-lg disabled:opacity-50">
                <span>{{ selectedSize ? 'Adicionar' : 'Selecione um tamanho' }}</span>
                <span>{{ formatCurrency(currentModalTotal) }}</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>

      <Transition enter-active-class="transition duration-300" enter-from-class="opacity-0" leave-active-class="transition duration-200" leave-to-class="opacity-0">
        <div v-if="isCartModalOpen" class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div class="w-full sm:max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden flex flex-col max-h-[90vh] shadow-2xl animate-slideUp sm:animate-none" :style="{ backgroundColor: cardBg, fontFamily, color: textColor }">
            
            <div class="p-6 flex justify-between items-center border-b border-white/10 shrink-0">
              <div class="flex items-center gap-3">
                <ShoppingBag :size="28" :style="{ color: buttonColor }" />
                <h3 class="font-black text-2xl">Meu Pedido</h3>
              </div>
              <button @click="isCartModalOpen = false" class="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors" :style="{ color: textColor }">
                <X :size="24" />
              </button>
            </div>

            <div class="p-4 overflow-y-auto custom-scrollbar flex-1 bg-black/5">
              <div class="space-y-3">
                <div v-for="(item, index) in cart" :key="item.id" class="p-5 rounded-3xl border border-white/5 flex gap-4 items-center relative overflow-hidden bg-white/5">
                  <div class="bg-white/10 font-black w-10 h-10 rounded-xl flex items-center justify-center shrink-0">1x</div>
                  <div class="flex-1">
                    <div class="flex justify-between items-start mb-1">
                      <h4 class="font-bold text-lg leading-tight">{{ item.name }} <span class="text-sm font-medium opacity-60">({{ item.sizeName }})</span></h4>
                      <span class="font-black ml-2">{{ formatCurrency(item.price) }}</span>
                    </div>
                    <p v-if="item.obs" class="text-sm bg-black/20 inline-block px-3 py-1 rounded-lg mt-2 font-medium border border-white/5">Obs: {{ item.obs }}</p>
                  </div>
                  <button @click="removeFromCart(index)" class="text-red-400 hover:text-white hover:bg-red-500/20 p-2 rounded-xl transition-colors shrink-0">
                    <Trash2 :size="20" />
                  </button>
                </div>
              </div>
            </div>

            <div class="p-6 border-t border-white/10 shrink-0 space-y-5">
              <div class="flex justify-between items-center text-lg">
                <span class="font-bold opacity-60 uppercase tracking-wider text-sm">Total</span>
                <span class="font-black text-3xl">{{ formatCurrency(cartTotal) }}</span>
              </div>
              <button @click="finalizeOrder" :style="{ backgroundColor: buttonColor, color: buttonTextColor }" class="w-full py-5 font-black rounded-2xl shadow-xl transition-transform active:scale-95 flex justify-center items-center gap-2 text-lg">
                Enviar para a Cozinha
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <Transition appear enter-active-class="transition duration-500 ease-out" enter-from-class="translate-x-full opacity-0" enter-to-class="translate-x-0 opacity-100" leave-active-class="transition duration-400 ease-in" leave-from-class="translate-x-0 opacity-100" leave-to-class="translate-x-full opacity-0">
      <aside v-if="isEditMode" class="fixed top-0 right-0 w-full sm:w-80 h-screen bg-gray-900 border-l border-white/10 z-[100] flex flex-col shadow-2xl text-white font-inter">
        <div class="p-5 border-b border-white/10 flex items-center justify-between bg-black/20 shrink-0">
          <h2 class="font-bold text-lg flex items-center gap-2 text-brand-green">
            <Palette :size="20" /> Editor Visual
          </h2>
          <button @click="closeVisuals" class="text-gray-400 hover:text-white transition-colors bg-white/5 p-1.5 rounded-lg">
            <X :size="20" />
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
          <div class="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-blue-400 text-sm mb-4 leading-relaxed">
            Navegue e clique no cardápio à esquerda. As alterações aplicarão instantaneamente!
          </div>

          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <label class="text-sm font-bold text-gray-300">Fundo Geral</label>
              <input type="color" v-model="bgColor" class="h-10 w-14 rounded cursor-pointer bg-transparent border-0" />
            </div>
            <div class="flex items-center justify-between">
              <label class="text-sm font-bold text-gray-300">Cor do Texto Principal</label>
              <input type="color" v-model="textColor" class="h-10 w-14 rounded cursor-pointer bg-transparent border-0" />
            </div>
            <div class="flex items-center justify-between">
              <label class="text-sm font-bold text-gray-300">Fundo dos Produtos</label>
              <input type="color" v-model="cardBg" class="h-10 w-14 rounded cursor-pointer bg-transparent border-0" />
            </div>
            <div class="flex items-center justify-between">
              <label class="text-sm font-bold text-gray-300">Categoria Ativa</label>
              <input type="color" v-model="categoryColor" class="h-10 w-14 rounded cursor-pointer bg-transparent border-0" />
            </div>
            <div class="flex items-center justify-between">
              <label class="text-sm font-bold text-gray-300">Cor dos Botões</label>
              <input type="color" v-model="buttonColor" class="h-10 w-14 rounded cursor-pointer bg-transparent border-0" />
            </div>
            <div class="flex items-center justify-between">
              <label class="text-sm font-bold text-gray-300">Texto dos Botões</label>
              <input type="color" v-model="buttonTextColor" class="h-10 w-14 rounded cursor-pointer bg-transparent border-0" />
            </div>
          </div>

          <div class="pt-4 border-t border-white/10">
            <label class="block text-sm font-bold text-gray-300 mb-2">Fonte do Sistema</label>
            <select v-model="fontFamily" class="w-full bg-black/40 border border-white/10 text-white p-3 rounded-xl focus:border-brand-green outline-none text-sm">
              <option value="Inter, sans-serif" class="text-black">Inter (Moderna)</option>
              <option value="Roboto, sans-serif" class="text-black">Roboto (Clássica)</option>
              <option value="Poppins, sans-serif" class="text-black">Poppins (Arredondada)</option>
              <option value="Merriweather, serif" class="text-black">Merriweather (Elegante)</option>
            </select>
          </div>

          <div>
            <label class="flex items-center justify-between p-4 border border-white/5 rounded-2xl cursor-pointer hover:bg-white/5 transition-colors">
              <div>
                <span class="block font-bold text-white mb-1">Permitir Observações</span>
                <span class="text-xs text-gray-400">Clientes podem escrever nos pedidos.</span>
              </div>
              <input type="checkbox" v-model="observacoesPermitidas" class="w-5 h-5 accent-brand-green" />
            </label>
          </div>
        </div>

        <div class="p-5 border-t border-white/10 bg-black/20 space-y-3 shrink-0">
          <button @click="saveVisuals" class="w-full bg-brand-green text-black font-black py-4 rounded-xl hover:bg-brand-green-hover transition-transform active:scale-95 shadow-lg flex justify-center items-center gap-2">
            <CheckCircle2 :size="20" /> Salvar Aparência
          </button>
          <button @click="closeVisuals" class="w-full bg-white/5 text-gray-300 font-bold py-3 rounded-xl hover:bg-white/10 transition-colors">
            Descartar e Sair
          </button>
        </div>
      </aside>
    </Transition>

    <ToastMessage />
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(156, 163, 175, 0.5); border-radius: 10px; }

@keyframes slideUp {
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
.animate-slideUp { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
.animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
</style>
