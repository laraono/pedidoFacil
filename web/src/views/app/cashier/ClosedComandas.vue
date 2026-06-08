<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useClosedComandaStore } from "@/stores/closedComandas";
import SubscriptionGuard from "@/components/SubscriptionGuard.vue";
import localStorageService from "@/services/localStorageService";
import {
  ArrowLeft,
  Receipt,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  CreditCard,
  Clock,
  PackageOpen,
  XCircle,
  AlertTriangle
} from "lucide-vue-next";
import { useUtils } from "@/composables/useUtils";

const { formatCurrency } = useUtils();

const router = useRouter();
const closedStore = useClosedComandaStore();

const search = ref("");
const expandedId = ref(null);
const comandaUnitLabel = localStorageService.getComandaUnitLabel();

onMounted(async () => {
  await closedStore.loadClosedComandas();
});

const filtered = computed(() => {
  const q = search.value.toLowerCase();
  return closedStore.closedComandas
    .slice()
    .reverse()
    .filter(
      (c) =>
        !q ||
        String(c.id).includes(q) ||
        c.orders?.some((o) =>
          o.items?.some((i) => i.name?.toLowerCase().includes(q)),
        ),
    );
});

function toggleExpand(id) {
  expandedId.value = expandedId.value === id ? null : id;
}

function formatDate(iso) {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function getComandaTypeLabel(comanda) {
  return comanda.isAutoatendimento ? 'Autoatendimento' : comandaUnitLabel;
}

function getComandaMainLabel(comanda) {
  if (comanda.isAutoatendimento && comanda.customerName) return comanda.customerName;
  return comanda.label || '#' + comanda.id;
}

function isOrderCancelled(order) {
  if (!order || !order.status) return false;
  const s = String(order.status).toUpperCase();
  return ['CANCELADO', 'CANCELADA', 'CANCELLED'].includes(s);
}

function isCancelled(comanda) {
  if (!comanda) return false;
  const s = String(comanda.status).toUpperCase();
  if (['CANCELADO', 'CANCELADA', 'CANCELLED'].includes(s)) return true;
  
  if (comanda.orders && comanda.orders.length > 0) {
    const allCanceled = comanda.orders.every(o => isOrderCancelled(o));
    if (allCanceled) return true;
  }
  return false;
}

function originalTotal(comanda) {
  return comanda.orders?.reduce((acc, o) => acc + (o.price || 0), 0) || Number(comanda.total) || 0;
}

function getValidSubtotal(comanda) {
  if (isCancelled(comanda)) return 0;
  const validOrders = (comanda.orders || []).filter(o => !isOrderCancelled(o));
  return validOrders.reduce((acc, o) => acc + (o.price || 0), 0);
}

function finalTotal(comanda) {
  if (isCancelled(comanda)) return 0;
  const sub = getValidSubtotal(comanda);
  const pd = comanda.paymentDetails;
  
  if (!pd || !pd.discountValue) return sub;
  if (pd.discountType === "percent") return sub * (1 - pd.discountValue / 100);
  return Math.max(0, sub - pd.discountValue);
}

function totalItems(comanda) {
  const validOrders = (comanda.orders || []).filter(o => !isOrderCancelled(o));
  return validOrders.reduce((acc, o) => acc + (o.items?.reduce((a, i) => a + (i.amount || 1), 0) || 0), 0);
}

function paymentSummary(comanda) {
  if (isCancelled(comanda)) return [{ type: 'Cancelado (Sem Cobrança)', amount: 0 }];
  const payments = comanda.paymentDetails?.payments || [];
  
  return payments.map(p => {
    if (p.type === 'Liquidado') return { ...p, amount: finalTotal(comanda) };
    return p;
  });
}

function getGroupedOrderItems(order) {
  const items = order.items || [];
  const groups = [];

  items.forEach((i) => {
    const variationName = (i.variationName || i.variations?.[0]?.productVariation?.name || "").trim();
    const baseName = (i.name || i.product?.name || "Item").trim();
    const amount = Number(i.amount || i.quantity || 1);
    const price = Number(i.price ?? i.Preco_Unitario_Momento ?? 0);
    const obs = (i.observation || i.obs || "").trim();

    const existing = groups.find(
      (g) => g.name === baseName && g.variationName === variationName && Math.abs(g.price - price) < 0.01 && g.observation === obs
    );

    if (existing) {
      existing.amount += amount;
      existing.total += price * amount;
    } else {
      groups.push({
        name: baseName,
        variationName,
        amount,
        price,
        total: price * amount,
        observation: obs,
      });
    }
  });
  return groups;
}
</script>

<template>
  <SubscriptionGuard :featureName="`O Histórico de ${comandaUnitLabel}s`">
    <main class="max-w-6xl mx-auto py-12 px-6 font-inter">
      <header class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
        <div class="flex items-center gap-4">
          <button @click="router.back()" class="p-3 bg-gray-50 border border-[#E0E0E0] rounded text-[#757575] hover:text-[#212121] hover:bg-gray-100 transition-all">
            <ArrowLeft :size="20" />
          </button>
          <div>
            <h1 class="text-3xl font-black text-[#212121] tracking-tight">
              {{ comandaUnitLabel }}s Finalizadas
            </h1>
            <p class="text-[#757575] text-sm mt-1">Histórico completo de pedidos e pagamentos</p>
          </div>
        </div>

        <div class="relative w-full sm:w-72">
          <Receipt :size="15" class="absolute left-4 top-1/2 -translate-y-1/2 text-[#757575]" />
          <input v-model="search" :placeholder="`Buscar ${comandaUnitLabel.toLowerCase()} ou produto...`" class="w-full pl-10 pr-4 py-3 bg-gray-50 border border-[#E0E0E0] rounded text-[#212121] text-sm placeholder-gray-600 focus:outline-none focus:border-primary/30 transition-all" />
        </div>
      </header>

      <div v-if="filtered.length === 0" class="flex flex-col items-center justify-center py-24 text-[#757575]">
        <PackageOpen :size="52" class="mb-4 opacity-20" />
        <p class="font-black uppercase tracking-widest text-sm opacity-40">
          {{ search ? `Nenhuma ${comandaUnitLabel.toLowerCase()} encontrada` : `Nenhuma ${comandaUnitLabel.toLowerCase()} finalizada ainda` }}
        </p>
      </div>

      <div class="space-y-4">
        <div v-for="comanda in filtered" :key="comanda.id" class="bg-white border border-[#E0E0E0] rounded overflow-hidden shadow-xl transition-all">
          <button class="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors text-left gap-4 flex-wrap sm:flex-nowrap" @click="toggleExpand(comanda.id)">
            <div class="flex items-start sm:items-center gap-4 min-w-0 w-full sm:w-auto">
              
              <div class="shrink-0 w-11 h-11 rounded border flex items-center justify-center" :class="isCancelled(comanda) ? 'bg-red-50 border-red-200' : 'bg-accent-light border-accent/30'">
                <XCircle v-if="isCancelled(comanda)" :size="20" class="text-red-500" />
                <CheckCircle v-else :size="20" class="text-accent" />
              </div>

              <div class="min-w-0 flex-grow">
                <div class="flex items-center gap-3 flex-wrap">
                  <div class="flex flex-col leading-none">
                    <span class="text-[9px] font-black uppercase tracking-widest mb-0.5" :class="comanda.isAutoatendimento ? 'text-blue-500' : 'text-[#757575]'">{{ getComandaTypeLabel(comanda) }}</span>
                    <span class="text-[#212121] font-black text-lg tracking-tight">{{ getComandaMainLabel(comanda) }}</span>
                  </div>
                  
                  <span v-if="isCancelled(comanda)" class="px-2 py-0.5 bg-red-50 border border-red-200 text-red-600 text-[9px] font-black uppercase tracking-widest rounded">
                    Cancelada
                  </span>
                  <span v-else-if="originalTotal(comanda) !== getValidSubtotal(comanda)" class="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-600 text-[9px] font-black uppercase tracking-widest rounded">
                    Contém pedidos cancelados
                  </span>
                  <span v-else class="px-2 py-0.5 bg-accent-light border border-accent/30 text-accent text-[9px] font-black uppercase tracking-widest rounded">
                    Finalizado
                  </span>
                </div>
                
                <div class="flex items-center gap-3 mt-1 flex-wrap">
                  <span class="text-[#757575] text-xs font-bold flex items-center gap-1">
                    <Clock :size="11" /> {{ formatDate(comanda.closedAt) }}
                  </span>
                  <span class="text-[#757575] text-xs font-bold">
                    {{ comanda.orders?.length || 0 }} pedido(s) · {{ totalItems(comanda) }} item(s) ativos
                  </span>
                </div>

                <div v-if="isCancelled(comanda) && comanda.cancelReason" class="mt-3 text-xs text-red-600 font-bold bg-red-50/50 p-2 rounded border border-red-100 flex items-start gap-2">
                  <AlertTriangle :size="14" class="shrink-0 mt-0.5" />
                  <span>Motivo: {{ comanda.cancelReason }}</span>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-end gap-6 shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
              <div class="text-right hidden sm:block">
                <p class="text-[10px] font-black text-[#757575] uppercase tracking-widest">Total</p>
                <div class="flex flex-col items-end mt-0.5">
                  <p v-if="isCancelled(comanda) || originalTotal(comanda) !== getValidSubtotal(comanda)" class="text-xs text-[#757575] line-through leading-none mb-1">
                    {{ formatCurrency(originalTotal(comanda)) }}
                  </p>
                  <p class="font-black text-xl leading-none" :class="isCancelled(comanda) ? 'text-red-500' : 'text-accent'">
                    {{ formatCurrency(finalTotal(comanda)) }}
                  </p>
                </div>
              </div>
              <component :is="expandedId === comanda.id ? ChevronUp : ChevronDown" :size="20" class="text-[#757575]" />
            </div>
          </button>

          <Transition enter-active-class="transition-all duration-300 ease-out" enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition-all duration-200 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
            <div v-if="expandedId === comanda.id" class="border-t border-[#E0E0E0]">
              <div class="p-6 space-y-6">
                <div>
                  <h3 class="text-[10px] font-black uppercase tracking-widest text-[#757575] mb-4">Pedidos da {{ comandaUnitLabel }}</h3>

                  <div v-if="!comanda.orders || comanda.orders.length === 0" class="text-[#757575] text-sm font-bold text-center py-6">
                    Nenhum pedido registrado.
                  </div>

                  <div v-else class="space-y-3">
                    <div v-for="order in comanda.orders" :key="order.id" class="bg-white border border-[#E0E0E0] rounded overflow-hidden transition-all" :class="{'opacity-60': isOrderCancelled(order)}">
                      <div class="flex items-center justify-between px-5 py-3 bg-gray-100">
                        <div class="flex items-center gap-3">
                          <span class="text-[#212121] font-black text-sm uppercase tracking-widest">Pedido #{{ order.id }}</span>
                          <span v-if="isOrderCancelled(order)" class="text-[9px] font-black uppercase tracking-widest bg-red-100 text-red-600 border border-red-200 px-2 py-0.5 rounded">Cancelado</span>
                        </div>
                        <span class="font-black" :class="isOrderCancelled(order) ? 'text-red-400 line-through' : 'text-accent'">
                          {{ formatCurrency(order.price || 0) }}
                        </span>
                      </div>

                      <div class="px-5 py-4 space-y-2">
                        <div v-if="!order.items || order.items.length === 0" class="text-[#757575] text-xs font-bold">Sem itens registrados.</div>
                        
                        <div v-else v-for="(item, idx) in getGroupedOrderItems(order)" :key="idx" class="flex items-center justify-between" :class="{'line-through text-[#aaa]': isOrderCancelled(order)}">
                          <div class="flex items-center gap-3">
                            <span class="w-8 h-8 rounded bg-gray-50 border border-[#E0E0E0] flex items-center justify-center text-[16px] font-black text-[#757575]">{{ item.amount || 1 }}x</span>
                            <div class="flex flex-col">
                              <span class="text-sm font-bold" :class="isOrderCancelled(order) ? 'text-[#888]' : 'text-[#212121]'">{{ item.name }}</span>
                              <span v-if="item.variationName" class="text-[10px] font-black text-blue-500 uppercase tracking-wide" :class="{'grayscale opacity-60': isOrderCancelled(order)}">{{ item.variationName }}</span>
                              <span v-if="item.observation" class="text-[10px] text-amber-500 italic mt-0.5 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 self-start" :class="{'grayscale opacity-60': isOrderCancelled(order)}">Obs: {{ item.observation }}</span>
                            </div>
                          </div>
                          <span class="text-sm font-bold" :class="isOrderCancelled(order) ? 'text-[#aaa]' : 'text-[#757575]'">
                            {{ formatCurrency(item.total) }}
                          </span>
                        </div>
                        
                      </div>
                    </div>
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="p-5 bg-gray-50 border border-[#E0E0E0] rounded space-y-3">
                    <h3 class="text-[10px] font-black uppercase tracking-widest text-[#757575] mb-3">Resumo Financeiro</h3>
                    <div class="flex justify-between text-sm">
                      <span class="text-[#757575] font-bold">Subtotal</span>
                      <div class="text-right">
                        <span v-if="originalTotal(comanda) !== getValidSubtotal(comanda)" class="text-[#757575] line-through text-xs mr-2">{{ formatCurrency(originalTotal(comanda)) }}</span>
                        <span class="text-[#212121] font-black">{{ formatCurrency(getValidSubtotal(comanda)) }}</span>
                      </div>
                    </div>
                    <div v-if="comanda.paymentDetails?.discountValue" class="flex justify-between text-sm">
                      <span class="text-[#757575] font-bold">
                        Desconto <span class="text-[#757575] text-xs">({{ comanda.paymentDetails.discountType === "percent" ? comanda.paymentDetails.discountValue + "%" : formatCurrency(comanda.paymentDetails.discountValue) }})</span>
                      </span>
                      <span class="text-orange-400 font-black">- {{ formatCurrency(getValidSubtotal(comanda) - finalTotal(comanda)) }}</span>
                    </div>
                    <div class="flex justify-between text-sm border-t border-[#E0E0E0] pt-3">
                      <span class="text-[#212121] font-black uppercase tracking-widest text-xs">Total Pago</span>
                      <span class="font-black text-lg" :class="isCancelled(comanda) ? 'text-red-500' : 'text-accent'">
                        {{ formatCurrency(finalTotal(comanda)) }}
                      </span>
                    </div>
                  </div>

                  <div class="p-5 bg-gray-50 border border-[#E0E0E0] rounded">
                    <h3 class="text-[10px] font-black uppercase tracking-widest text-[#757575] mb-3">Forma(s) de Pagamento</h3>
                    <div v-if="paymentSummary(comanda).length === 0" class="text-[#757575] text-xs font-bold">Não informado.</div>
                    <div v-else class="space-y-2">
                      <div v-for="(p, i) in paymentSummary(comanda)" :key="i" class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                          <XCircle v-if="isCancelled(comanda)" :size="14" class="text-red-400" />
                          <CreditCard v-else :size="14" class="text-[#757575]" />
                          <span class="text-sm font-bold" :class="isCancelled(comanda) ? 'text-red-500' : 'text-[#212121]'">{{ p.type }}</span>
                        </div>
                        <span class="font-black text-sm" :class="isCancelled(comanda) ? 'text-red-500' : 'text-accent'">
                          {{ formatCurrency(p.amount) }}
                        </span>
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
.font-inter { font-family: "Inter", sans-serif; }
</style>