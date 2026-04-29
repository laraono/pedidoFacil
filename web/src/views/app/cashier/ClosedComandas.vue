<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import SubscriptionGuard from '@/components/SubscriptionGuard.vue';
import {
  ArrowLeft, Receipt, ChevronDown, ChevronUp,
  CheckCircle, CreditCard, Tag, Clock, PackageOpen
} from 'lucide-vue-next';
import {comandaApi} from '@/services/comandaApi'

const router = useRouter();

const search = ref('');
const expandedId = ref(null);
const allComandas = ref([]);

onMounted(async () => {
  allComandas.value = await comandaApi.listClosed();
});

const filtered = computed(() => {
  const q = search.value.toLowerCase();
  return allComandas.value
    .slice()
    .reverse()
    .filter(c =>
      !q ||
      String(c.id).includes(q) ||
      c.orders?.some(o => o.productOrders?.some(i => i.product?.name?.toLowerCase().includes(q)))
    );
});

function toggleExpand(id) {
  expandedId.value = expandedId.value === id ? null : id;
}

function formatDate(iso) {
  if (!iso) return '-';
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatCurrency(v) {
  return Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function totalItems(comanda) {
  return comanda.orders?.reduce((acc, o) => acc + (o.productOrders?.reduce((a, i) => a + (i.quantity || 1), 0) || 0), 0) || 0;
}

function finalTotal(comanda) {
  const pd = comanda.paymentDetails;
  if (!pd) return comanda.total || 0;
  const sub = comanda.total || 0;
  if (!pd.discountValue) return sub;
  if (pd.discountType === 'percent') return sub * (1 - pd.discountValue / 100);
  return Math.max(0, sub - pd.discountValue);
}

function paymentSummary(comanda) {
  return comanda.orders.paymentOrders || [];
}
</script>

<template>
  <SubscriptionGuard featureName="O Histórico de Comandas">
  <main class="max-w-6xl mx-auto py-12 px-6 font-inter">

    <!-- Header -->
    <header class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
      <div class="flex items-center gap-4">
        <button @click="router.back()"
          class="p-3 bg-gray-50 border border-[#E0E0E0] rounded text-[#757575] hover:text-[#212121] hover:bg-gray-100 transition-all">
          <ArrowLeft :size="20" />
        </button>
        <div>
          <h1 class="text-3xl font-black text-[#212121] tracking-tight">Comandas Finalizadas</h1>
          <p class="text-[#757575] text-sm mt-1">Histórico completo de pedidos e pagamentos</p>
        </div>
      </div>

      <!-- Busca -->
      <div class="relative w-full sm:w-72">
        <Receipt :size="15" class="absolute left-4 top-1/2 -translate-y-1/2 text-[#757575]" />
        <input v-model="search" placeholder="Buscar comanda ou produto..."
          class="w-full pl-10 pr-4 py-3 bg-gray-50 border border-[#E0E0E0] rounded text-[#212121] text-sm
                 placeholder-gray-600 focus:outline-none focus:border-primary/30 transition-all" />
      </div>
    </header>

    <!-- Vazio -->
    <div v-if="filtered.length === 0"
      class="flex flex-col items-center justify-center py-24 text-[#757575]">
      <PackageOpen :size="52" class="mb-4 opacity-20" />
      <p class="font-black uppercase tracking-widest text-sm opacity-40">
        {{ search ? 'Nenhuma comanda encontrada' : 'Nenhuma comanda finalizada ainda' }}
      </p>
    </div>

    <!-- Lista de comandas -->
    <div class="space-y-4">
      <div v-for="comanda in filtered" :key="comanda.id"
        class="bg-white border border-[#E0E0E0] rounded overflow-hidden shadow-xl transition-all">

        <!-- Cabeçalho da comanda (clicável) -->
        <button
          class="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors text-left gap-4"
          @click="toggleExpand(comanda.id)"
        >
          <div class="flex items-center gap-4 min-w-0">
            <!-- Ícone -->
            <div class="shrink-0 w-11 h-11 rounded bg-accent-light border border-accent/30
                        flex items-center justify-center">
              <CheckCircle :size="20" class="text-accent" />
            </div>

            <div class="min-w-0">
              <div class="flex items-center gap-3 flex-wrap">
                <span class="text-[#212121] font-black text-lg tracking-tight">{{ comanda.label || '#' + comanda.id }}</span>
                <span class="px-2 py-0.5 bg-accent-light border border-accent/30
                             text-accent text-[9px] font-black uppercase tracking-widest rounded">
                  Finalizado
                </span>
              </div>
              <div class="flex items-center gap-3 mt-1 flex-wrap">
                <span class="text-[#757575] text-xs font-bold flex items-center gap-1">
                  <Clock :size="11" /> {{ formatDate(comanda.closedAt) }}
                </span>
                <span class="text-[#757575] text-xs font-bold">
                  {{ comanda.orders?.length || 0 }} pedido(s) · {{ totalItems(comanda) }} item(s)
                </span>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-6 shrink-0">
            <div class="text-right hidden sm:block">
              <p class="text-[10px] font-black text-[#757575] uppercase tracking-widest">Total</p>
              <p class="text-accent font-black text-xl">{{ formatCurrency(finalTotal(comanda)) }}</p>
            </div>
            <component :is="expandedId === comanda.id ? ChevronUp : ChevronDown"
              :size="20" class="text-[#757575]" />
          </div>
        </button>

        <!-- Detalhe expandido -->
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 -translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div v-if="expandedId === comanda.id" class="border-t border-[#E0E0E0]">
            <div class="p-6 space-y-6">

              <!-- ── Todos os Pedidos ── -->
              <div>
                <h3 class="text-[10px] font-black uppercase tracking-widest text-[#757575] mb-4">
                  Pedidos da Comanda
                </h3>

                <div v-if="!comanda.orders || comanda.orders.length === 0"
                  class="text-[#757575] text-sm font-bold text-center py-6">
                  Nenhum pedido registrado.
                </div>

                <div v-else class="space-y-3">
                  <div v-for="order in comanda.orders" :key="order.id"
                    class="bg-white border border-[#E0E0E0] rounded overflow-hidden">

                    <!-- Header do pedido -->
                    <div class="flex items-center justify-between px-5 py-3 bg-gray-100">
                      <span class="text-[#212121] font-black text-sm uppercase tracking-widest">
                        Pedido #{{ order.id }}
                      </span>
                      <span class="text-accent font-black">
                        {{ formatCurrency(order.price || 0) }}
                      </span>
                    </div>

                    <!-- Itens do pedido -->
                    <div class="px-5 py-4 space-y-2">
                      <div v-if="!order.productOrders || order.productOrders.length === 0"
                        class="text-[#757575] text-xs font-bold">
                        Sem itens registrados.
                      </div>
                      <div v-else v-for="item in order.productOrders" :key="item.product.name + item.quantity"
                        class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                          <span class="w-6 h-6 rounded bg-gray-50 border border-[#E0E0E0]
                                       flex items-center justify-center text-[10px] font-black text-[#757575]">
                            {{ item.quantity || 1 }}x
                          </span>
                          <span class="text-[#212121] text-sm font-bold">{{ item.product.name }}</span>
                        </div>
                        <span class="text-[#757575] text-sm font-bold">
                          {{ formatCurrency((item.price || 0) * (item.quantity || 1)) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- ── Resumo financeiro ── -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <!-- Subtotal / Desconto / Total -->
                <div class="p-5 bg-gray-50 border border-[#E0E0E0] rounded space-y-3">
                  <h3 class="text-[10px] font-black uppercase tracking-widest text-[#757575] mb-3">
                    Resumo Financeiro
                  </h3>
                  <div class="flex justify-between text-sm">
                    <span class="text-[#757575] font-bold">Subtotal</span>
                    <span class="text-[#212121] font-black">{{ formatCurrency(comanda.total) }}</span>
                  </div>
                  <div v-if="comanda.paymentDetails?.discountValue" class="flex justify-between text-sm">
                    <span class="text-[#757575] font-bold">
                      Desconto
                      <span class="text-[#757575] text-xs">
                        ({{ comanda.paymentDetails.discountType === 'percent'
                          ? comanda.paymentDetails.discountValue + '%'
                          : formatCurrency(comanda.paymentDetails.discountValue) }})
                      </span>
                    </span>
                    <span class="text-orange-400 font-black">
                      - {{ formatCurrency(comanda.total - finalTotal(comanda)) }}
                    </span>
                  </div>
                  <div class="flex justify-between text-sm border-t border-[#E0E0E0] pt-3">
                    <span class="text-[#212121] font-black uppercase tracking-widest text-xs">Total Pago</span>
                    <span class="text-accent font-black text-lg">{{ formatCurrency(finalTotal(comanda)) }}</span>
                  </div>
                </div>

                <!-- Pagamentos -->
                <div class="p-5 bg-gray-50 border border-[#E0E0E0] rounded">
                  <h3 class="text-[10px] font-black uppercase tracking-widest text-[#757575] mb-3">
                    Forma(s) de Pagamento
                  </h3>
                  <div v-if="paymentSummary(comanda).length === 0"
                    class="text-[#757575] text-xs font-bold">Não informado.</div>
                  <div v-else class="space-y-2">
                    <div v-for="(p, i) in paymentSummary(comanda)" :key="i"
                      class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <CreditCard :size="14" class="text-[#757575]" />
                        <span class="text-[#212121] text-sm font-bold">{{ p.payment.paymentType }}</span>
                      </div>
                      <span class="text-accent font-black text-sm">{{ formatCurrency(p.payment.total) }}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </Transition>
      </div>
    </div>
  </main>
  </SubscriptionGuard>
</template>

<style scoped>
.font-inter { font-family: 'Inter', sans-serif; }
</style>
