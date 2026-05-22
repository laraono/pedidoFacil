<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { ShoppingCart, Plus, Minus, Trash2, ChefHat, X, CheckCircle2, AlertTriangle, ChevronRight } from 'lucide-vue-next';

const route = useRoute();

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const code = computed(() => route.params.code);

const establishment = ref(null);
const categories = ref([]);
const isLoading = ref(true);
const error = ref('');
const cart = ref([]);
const customerName = ref('');
const activeCategory = ref(null);
const showCart = ref(false);
const orderSent = ref(false);
const orderTicket = ref('');
const isSending = ref(false);
const orderError = ref('');

async function totemFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-totem-code': code.value,
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || data.message || `Erro ${res.status}`);
  }
  return res.status === 204 ? null : res.json();
}

onMounted(async () => {
  try {
    const estData = await fetch(`${BASE_URL}/estabelecimento/code/${code.value}`).then(r => {
      if (!r.ok) throw new Error('Estabelecimento não encontrado');
      return r.json();
    });

    establishment.value = estData;

    const menu = await fetch(`${BASE_URL}/menu?establishmentId=${estData.id}`).then(r => r.json());

    categories.value = menu || [];
    if (categories.value.length > 0) {
      activeCategory.value = categories.value[0].id;
    }
  } catch (e) {
    error.value = e.message || 'Erro ao carregar o cardápio';
  } finally {
    isLoading.value = false;
  }
});

const activeProducts = computed(() => {
  const cat = categories.value.find(c => c.id === activeCategory.value);
  return cat?.products || [];
});

const cartTotal = computed(() =>
  cart.value.reduce((sum, item) => sum + item.price * item.qty, 0)
);

const cartCount = computed(() =>
  cart.value.reduce((sum, item) => sum + item.qty, 0)
);

function addToCart(product, variation = null) {
  const finalPrice = Number(product.basePrice) + (variation ? Number(variation.addPrice) : 0);
  const key = variation ? `${product.id}_${variation.id}` : `${product.id}`;
  const existing = cart.value.find(i => i.key === key);
  if (existing) {
    existing.qty++;
  } else {
    cart.value.push({
      key,
      productId: product.id,
      variationId: variation?.id || null,
      name: product.name + (variation ? ` (${variation.name})` : ''),
      price: finalPrice,
      qty: 1,
    });
  }
}

function decrement(item) {
  if (item.qty > 1) {
    item.qty--;
  } else {
    cart.value = cart.value.filter(i => i.key !== item.key);
  }
}

function remove(item) {
  cart.value = cart.value.filter(i => i.key !== item.key);
}

async function placeOrder() {
  if (cart.value.length === 0) return;
  isSending.value = true;
  orderError.value = '';
  try {
    const itens = cart.value.map(item => ({
      productId: item.productId,
      productVariationId: item.variationId || undefined,
      quantity: item.qty,
    }));

    const result = await totemFetch('/totem/orders', {
      method: 'POST',
      body: JSON.stringify({
        itens,
        customerName: customerName.value.trim() || null,
      }),
    });

    orderTicket.value = result?.ticket || result?.label || '';
    orderSent.value = true;
    cart.value = [];
    showCart.value = false;
  } catch (e) {
    orderError.value = e.message || 'Erro ao enviar pedido';
  } finally {
    isSending.value = false;
  }
}

function resetOrder() {
  orderSent.value = false;
  orderTicket.value = '';
  customerName.value = '';
}

const selectedProduct = ref(null);
const showVariationModal = ref(false);

function openProduct(product) {
  if (product.variations && product.variations.length > 0) {
    selectedProduct.value = product;
    showVariationModal.value = true;
  } else {
    addToCart(product);
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 font-inter flex flex-col">

    <!-- Loading -->
    <div v-if="isLoading" class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <div class="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-[#757575] font-bold">Carregando cardápio...</p>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="flex-1 flex items-center justify-center p-8">
      <div class="text-center max-w-sm">
        <AlertTriangle :size="48" class="text-danger mx-auto mb-4" />
        <h2 class="text-xl font-black text-[#212121] mb-2">Ops! Algo deu errado</h2>
        <p class="text-[#757575]">{{ error }}</p>
      </div>
    </div>

    <!-- Order success -->
    <div v-else-if="orderSent" class="flex-1 flex items-center justify-center p-8">
      <div class="bg-white rounded-2xl shadow-2xl p-10 max-w-sm w-full text-center">
        <div class="w-20 h-20 bg-accent-light rounded-full flex items-center justify-center mx-auto mb-6 border border-accent/30">
          <CheckCircle2 :size="40" class="text-accent" />
        </div>
        <h2 class="text-2xl font-black text-[#212121] mb-2">Pedido enviado!</h2>
        <p class="text-[#757575] mb-6">Seu pedido foi enviado para a cozinha.</p>
        <div v-if="orderTicket" class="bg-gray-50 border border-[#E0E0E0] rounded-xl p-6 mb-8">
          <p class="text-xs font-black text-[#757575] uppercase tracking-widest mb-2">Seu número</p>
          <p class="text-5xl font-black text-accent tracking-widest">{{ orderTicket }}</p>
        </div>
        <button @click="resetOrder" class="w-full py-4 bg-primary text-white font-black uppercase tracking-widest rounded-xl hover:bg-primary-dark transition-all">
          Fazer novo pedido
        </button>
      </div>
    </div>

    <!-- Main -->
    <template v-else>
      <!-- Header -->
      <header class="bg-white border-b border-[#E0E0E0] px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-accent-light border border-accent/30 rounded-xl flex items-center justify-center">
            <ChefHat :size="20" class="text-accent" />
          </div>
          <div>
            <h1 class="font-black text-[#212121] text-lg leading-tight">{{ establishment?.name || 'Cardápio' }}</h1>
            <p class="text-xs text-[#757575] font-bold">Autoatendimento</p>
          </div>
        </div>

        <button @click="showCart = true" class="relative flex items-center gap-2 bg-primary text-white font-black px-5 py-2.5 rounded-xl hover:bg-primary-dark transition-all">
          <ShoppingCart :size="18" />
          <span class="hidden sm:inline text-sm">Carrinho</span>
          <span v-if="cartCount > 0" class="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-black w-5 h-5 rounded-full flex items-center justify-center">
            {{ cartCount }}
          </span>
        </button>
      </header>

      <!-- Category tabs -->
      <div class="bg-white border-b border-[#E0E0E0] px-4 flex gap-2 overflow-x-auto sticky top-[73px] z-10 py-3">
        <button
          v-for="cat in categories"
          :key="cat.id"
          @click="activeCategory = cat.id"
          class="shrink-0 px-4 py-2 rounded-lg font-black text-sm uppercase tracking-widest transition-all"
          :class="activeCategory === cat.id ? 'bg-primary text-white' : 'bg-gray-100 text-[#757575] hover:bg-gray-200'"
        >
          {{ cat.name }}
        </button>
      </div>

      <!-- Products -->
      <main class="flex-1 p-4 max-w-4xl mx-auto w-full">
        <div v-if="activeProducts.length === 0" class="text-center py-16 text-[#757575]">
          <p class="font-bold">Nenhum produto nesta categoria.</p>
        </div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="product in activeProducts"
            :key="product.id"
            @click="openProduct(product)"
            class="bg-white rounded-xl border border-[#E0E0E0] overflow-hidden cursor-pointer hover:shadow-lg hover:border-accent/40 transition-all group"
          >
            <div v-if="product.imageUrl" class="h-40 overflow-hidden">
              <img :src="product.imageUrl" :alt="product.name" class="w-full h-full object-cover group-hover:scale-105 transition-transform" />
            </div>
            <div class="p-4">
              <h3 class="font-black text-[#212121] text-base">{{ product.name }}</h3>
              <p v-if="product.description" class="text-xs text-[#757575] mt-1 line-clamp-2">{{ product.description }}</p>
              <div class="flex items-center justify-between mt-3">
                <span class="font-black text-accent text-lg">
                  R$ {{ Number(product.basePrice).toFixed(2) }}
                </span>
                <div class="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center group-hover:bg-primary-dark transition-colors">
                  <Plus :size="16" />
                </div>
              </div>
              <p v-if="product.variations && product.variations.length > 0" class="text-[10px] text-[#757575] font-bold mt-1 flex items-center gap-1">
                <ChevronRight :size="10" /> Escolha a variação
              </p>
            </div>
          </div>
        </div>
      </main>
    </template>

    <!-- Cart slide-over -->
    <Teleport to="body">
      <Transition name="slide">
        <div v-if="showCart && !orderSent" class="fixed inset-0 z-50 flex justify-end">
          <div class="absolute inset-0 bg-black/40" @click="showCart = false"></div>
          <div class="relative bg-white w-full max-w-md flex flex-col shadow-2xl">
            <div class="p-6 border-b border-[#E0E0E0] flex items-center justify-between">
              <h2 class="font-black text-xl text-[#212121]">Seu pedido</h2>
              <button @click="showCart = false" class="p-2 text-[#757575] hover:text-[#212121] hover:bg-gray-100 rounded-lg">
                <X :size="20" />
              </button>
            </div>

            <div class="flex-1 overflow-y-auto p-6">
              <div v-if="cart.length === 0" class="text-center py-16 text-[#757575]">
                <ShoppingCart :size="40" class="mx-auto mb-3 opacity-30" />
                <p class="font-bold">Seu carrinho está vazio</p>
              </div>

              <div v-else class="space-y-4">
                <div v-for="item in cart" :key="item.key" class="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-[#E0E0E0]">
                  <div class="flex-1 min-w-0">
                    <p class="font-bold text-sm text-[#212121] truncate">{{ item.name }}</p>
                    <p class="text-accent font-black text-sm">R$ {{ (item.price * item.qty).toFixed(2) }}</p>
                  </div>
                  <div class="flex items-center gap-2">
                    <button @click="decrement(item)" class="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300">
                      <Minus :size="12" />
                    </button>
                    <span class="font-black text-sm w-4 text-center">{{ item.qty }}</span>
                    <button @click="item.qty++" class="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300">
                      <Plus :size="12" />
                    </button>
                    <button @click="remove(item)" class="w-7 h-7 text-danger hover:bg-danger-light rounded-full flex items-center justify-center ml-1">
                      <Trash2 :size="12" />
                    </button>
                  </div>
                </div>

                <div class="pt-4 border-t border-[#E0E0E0]">
                  <label class="block text-xs font-black text-[#757575] uppercase tracking-widest mb-2">Seu nome (opcional)</label>
                  <input
                    v-model="customerName"
                    type="text"
                    placeholder="Ex: João"
                    class="w-full py-3 px-4 bg-gray-50 border border-[#E0E0E0] rounded-lg text-sm font-bold text-[#212121] outline-none focus:border-accent"
                  />
                </div>
              </div>
            </div>

            <div class="p-6 border-t border-[#E0E0E0]">
              <div v-if="orderError" class="mb-4 p-3 bg-danger-light border border-danger rounded-lg text-danger text-sm font-bold">
                {{ orderError }}
              </div>
              <div class="flex justify-between items-center mb-4">
                <span class="font-black text-[#757575] uppercase tracking-widest text-sm">Total</span>
                <span class="text-2xl font-black text-accent">R$ {{ cartTotal.toFixed(2) }}</span>
              </div>
              <button
                @click="placeOrder"
                :disabled="cart.length === 0 || isSending"
                class="w-full py-4 bg-primary text-white font-black uppercase tracking-widest rounded-xl hover:bg-primary-dark transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                <span v-if="isSending" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                {{ isSending ? 'Enviando...' : 'Confirmar pedido' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Variation picker modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showVariationModal && selectedProduct" class="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
            <div class="p-6 border-b border-[#E0E0E0] flex justify-between items-center">
              <h3 class="font-black text-lg text-[#212121]">{{ selectedProduct.name }}</h3>
              <button @click="showVariationModal = false" class="p-2 text-[#757575] hover:text-[#212121]"><X :size="18" /></button>
            </div>
            <div class="p-6 space-y-3">
              <p class="text-xs font-black text-[#757575] uppercase tracking-widest mb-4">Escolha uma opção</p>
              <button
                v-for="variation in selectedProduct.variations"
                :key="variation.id"
                @click="addToCart(selectedProduct, variation); showVariationModal = false"
                class="w-full flex items-center justify-between p-4 rounded-xl border border-[#E0E0E0] hover:border-accent hover:bg-accent-light transition-all text-left"
              >
                <span class="font-bold text-[#212121]">{{ variation.name }}</span>
                <span class="font-black text-accent">
                  R$ {{ (Number(selectedProduct.basePrice) + Number(variation.addPrice)).toFixed(2) }}
                </span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.slide-enter-active, .slide-leave-active { transition: transform 0.3s ease; }
.slide-enter-from, .slide-leave-to { transform: translateX(100%); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
