<template>
  <Teleport to="body">
    <div
      v-if="isOpen && comanda"
      class="fixed inset-0 bg-page/50 backdrop-blur-xl flex items-center justify-center p-4 z-50"
    >
      <div
        class="bg-white border border-[#E0E0E0] rounded w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
      >
        <div
          class="p-8 border-b border-[#E0E0E0] flex justify-between items-center bg-gray-50 shrink-0"
        >
          <div class="flex items-center gap-4">
            <div
              class="bg-blue-500/10 p-3 rounded text-blue-500 border border-blue-500/20"
            >
              <Receipt :size="24" />
            </div>
            <div>
              <h2
                class="text-2xl font-black text-[#212121] uppercase tracking-tighter"
              >
                {{ getComandaMainLabel(comanda) }}
              </h2>
              <p
                class="font-black uppercase tracking-widest text-[10px]"
                :class="
                  comanda.isAutoatendimento ? 'text-blue-500' : 'text-[#757575]'
                "
              >
                {{
                  comanda.isAutoatendimento
                    ? "Autoatendimento"
                    : "Processamento Financeiro"
                }}
              </p>
            </div>
          </div>
          <button
            @click="$emit('close')"
            class="p-2 text-[#757575] hover:text-[#212121] hover:bg-gray-100 rounded transition-all"
          >
            <X :size="24" />
          </button>
        </div>

        <div class="p-8 overflow-y-auto custom-scrollbar bg-white">
          <div
            class="flex gap-4 mb-8 bg-gray-50 p-1.5 rounded border border-[#E0E0E0]"
          >
            <label
              class="flex-1 flex items-center justify-center gap-2 p-3 rounded cursor-pointer transition-all"
              :class="
                paymentMode === 'total'
                  ? 'bg-white shadow-sm border border-[#E0E0E0] text-blue-600 font-black'
                  : 'text-[#757575] font-bold hover:bg-gray-100'
              "
            >
              <input
                type="radio"
                v-model="paymentMode"
                value="total"
                class="sr-only"
              />
              Pagar Comanda Completa
            </label>
            <label
              class="flex-1 flex items-center justify-center gap-2 p-3 rounded cursor-pointer transition-all"
              :class="
                paymentMode === 'parcial'
                  ? 'bg-white shadow-sm border border-[#E0E0E0] text-blue-600 font-black'
                  : 'text-[#757575] font-bold hover:bg-gray-100'
              "
            >
              <input
                type="radio"
                v-model="paymentMode"
                value="parcial"
                class="sr-only"
              />
              Pagar Apenas Alguns Pedidos
            </label>
          </div>

          <div
            v-if="hasPending"
            class="mb-4 flex items-start gap-3 p-4 rounded bg-yellow-500/10 border border-yellow-500/30"
          >
            <AlertTriangle :size="18" class="text-yellow-400 shrink-0 mt-0.5" />
            <div>
              <p
                class="text-amber-700 font-black text-xs uppercase tracking-widest"
              >
                Pedidos aguardando preparo
              </p>
              <p class="text-yellow-400/80 text-xs mt-1">
                Um ou mais itens ainda não foram enviados para a cozinha. Será
                necessário cancelá-los para finalizar.
              </p>
            </div>
          </div>

          <div class="space-y-4">
            <div
              v-for="order in ordersWithStatus"
              :key="order.id"
              class="rounded p-6 transition-all"
              :class="[
                order.status === 'pending'
                  ? 'border border-yellow-500/30 bg-yellow-500/5'
                  : 'border border-[#E0E0E0] bg-gray-50',
                paymentMode === 'parcial' &&
                !selectedOrderIds.includes(order.id)
                  ? 'opacity-50 grayscale'
                  : '',
              ]"
            >
              <div class="flex justify-between items-center mb-4">
                <div class="flex items-center gap-3">
                  <input
                    v-if="paymentMode === 'parcial'"
                    type="checkbox"
                    :value="order.id"
                    v-model="selectedOrderIds"
                    class="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span
                    class="font-black text-[#212121] text-sm uppercase tracking-widest"
                    >Pedido #{{ order.id }}</span
                  >
                </div>

                <div class="flex items-center gap-2">
                  <span
                    class="px-4 py-1 rounded text-[10px] font-black uppercase tracking-widest border"
                    :class="{
                      'border-yellow-500/30 bg-yellow-500/10 text-yellow-500':
                        order.status === 'pending',
                      'border-blue-500/30 bg-blue-500/10 text-blue-500':
                        order.status === 'preparing',
                      'border-accent/40 bg-accent-light text-accent':
                        order.status === 'ready',
                    }"
                  >
                    {{
                      order.status === "pending"
                        ? "Aguardando"
                        : order.status === "preparing"
                          ? "Preparando"
                          : "Pronto"
                    }}
                  </span>
                  <button
                    v-if="
                      order.status !== 'ready' && order.status !== 'finished'
                    "
                    @click.stop.prevent="$emit('cancel-order', order.id)"
                    class="text-danger hover:bg-danger-light p-1.5 rounded transition-all"
                    title="Cancelar Pedido"
                  >
                    <XCircle :size="16" />
                  </button>
                </div>
              </div>

              <div class="space-y-3 mb-4">
                <div
                  v-for="(item, idx) in getGroupedOrderItems(order)"
                  :key="idx"
                  class="flex justify-between items-start text-xs font-bold text-[#757575]"
                >
                  <div class="flex flex-col">
                    <span>{{ item.amount }}x {{ item.name }}</span>
                    <span
                      v-if="item.observation"
                      class="text-[10px] text-amber-500 italic mt-0.5 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 self-start"
                      >Obs: {{ item.observation }}</span
                    >
                  </div>
                  <span class="text-[#757575] mt-0.5"
                    >R$ {{ item.total.toFixed(2) }}</span
                  >
                </div>
              </div>

              <div
                class="text-right font-black text-[#212121] text-sm mt-3 pt-3 border-t border-[#E0E0E0] border-dashed"
              >
                Total Pedido:
                <span class="text-blue-400 ml-2"
                  >R$ {{ getOrderTotal(order).toFixed(2) }}</span
                >
              </div>
            </div>
          </div>

          <div
            v-if="selectedOrderIds.length > 0"
            class="mt-10 border border-[#E0E0E0] rounded p-8 bg-page/40 shadow-inner"
          >
            <div
              class="flex justify-between text-sm font-black text-[#757575] uppercase tracking-widest"
            >
              <span
                >Subtotal
                {{
                  paymentMode === "parcial" ? "Selecionado" : "da Conta"
                }}:</span
              >
              <span class="text-[#212121]">R$ {{ subtotal.toFixed(2) }}</span>
            </div>

            <div class="mt-6 p-6 bg-gray-50 rounded border border-[#E0E0E0]">
              <label
                class="block text-[10px] font-black text-[#757575] uppercase tracking-widest mb-3"
                >Aplicar Ajuste/Desconto</label
              >
              <div class="flex gap-4">
                <select
                  v-model="discountType"
                  class="bg-gray-50 border border-[#E0E0E0] rounded px-4 py-3 text-xs font-black uppercase text-[#212121] outline-none focus:ring-2 focus:ring-blue-500 flex-1"
                >
                  <option value="percent">Percentual (%)</option>
                  <option value="fixed">Valor fixo (R$)</option>
                </select>
                <div class="relative">
                  <input
                    :value="discountRaw"
                    @input="onDiscountInput"
                    inputmode="numeric"
                    :placeholder="discountType === 'percent' ? '0' : '0,00'"
                    class="bg-gray-50 border border-[#E0E0E0] rounded px-4 py-3 text-lg font-black text-center text-accent w-32 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span
                    class="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-black text-[#757575] pointer-events-none"
                    >{{ discountType === "percent" ? "%" : "R$" }}</span
                  >
                </div>
              </div>
            </div>

            <div class="mt-6 p-6 bg-gray-50 rounded border border-[#E0E0E0]">
              <label
                class="block text-[10px] font-black text-[#757575] uppercase tracking-widest mb-3 flex items-center gap-2"
              >
                <Tag :size="12" /> Cupom de Desconto
              </label>
              <div
                v-if="appliedCoupon"
                class="flex items-center justify-between p-3 bg-accent-light border border-accent/30 rounded"
              >
                <div class="flex items-center gap-2">
                  <Tag :size="14" class="text-accent" />
                  <span
                    class="font-black text-accent text-sm font-mono tracking-widest"
                    >{{ appliedCoupon.code }}</span
                  >
                  <span class="text-[#757575] text-xs"
                    >—
                    {{
                      appliedCoupon.type === "percent"
                        ? appliedCoupon.value + "%"
                        : "R$ " + Number(appliedCoupon.value).toFixed(2)
                    }}
                    off</span
                  >
                </div>
                <button
                  @click="removeCoupon"
                  class="p-1 text-[#757575] hover:text-danger transition-colors"
                >
                  <XCircle :size="16" />
                </button>
              </div>
              <div v-else class="flex gap-3">
                <input
                  v-model="couponCodeInput"
                  @keydown.enter="applyCoupon"
                  placeholder="Digite o código..."
                  class="flex-1 bg-gray-50 border border-[#E0E0E0] rounded px-4 py-2.5 text-sm font-black text-[#212121] placeholder:text-[#757575] outline-none focus:border-primary/40 uppercase"
                />
                <button
                  @click="applyCoupon"
                  class="px-4 py-2.5 bg-gray-50 border border-[#E0E0E0] text-[#757575] text-xs font-black uppercase tracking-widest rounded hover:bg-gray-100 transition-all"
                >
                  Aplicar
                </button>
              </div>
              <p
                v-if="couponError"
                class="text-danger text-[11px] font-bold mt-2 ml-1"
              >
                {{ couponError }}
              </p>
            </div>

            <div class="flex justify-between items-end mt-8">
              <div>
                <span
                  class="text-[10px] font-black text-[#757575] uppercase tracking-[0.3em]"
                  >Total a Pagar</span
                >
                <div
                  v-if="appliedCoupon"
                  class="text-[10px] text-accent font-bold mt-0.5"
                >
                  Cupom: − R$ {{ couponDiscount.toFixed(2) }}
                </div>
              </div>
              <span class="text-4xl font-black text-accent tracking-tighter"
                >R$ {{ totalWithDiscount.toFixed(2) }}</span
              >
            </div>
          </div>

          <div
            v-if="selectedOrderIds.length === 0"
            class="mt-10 p-8 border border-dashed border-[#E0E0E0] rounded bg-gray-50 text-center"
          >
            <p
              class="text-[#757575] font-black uppercase tracking-widest text-sm"
            >
              Selecione pelo menos um pedido para pagar.
            </p>
          </div>

          <div
            class="mt-10"
            v-if="totalWithDiscount > 0 && selectedOrderIds.length > 0"
          >
            <h3
              class="font-black text-[#757575] mb-6 uppercase tracking-[0.2em] text-[10px]"
            >
              Método de Liquidação
            </h3>
            <div class="bg-gray-50 border border-[#E0E0E0] p-8 rounded">
              <div class="mb-6 flex items-center gap-6 flex-wrap">
                <label class="flex items-center cursor-pointer">
                  <div class="relative">
                    <input
                      type="checkbox"
                      v-model="splitPayment"
                      class="sr-only"
                    />
                    <div
                      class="w-12 h-6 bg-gray-200 rounded transition-colors"
                      :class="{ 'bg-blue-600': splitPayment }"
                    ></div>
                    <div
                      class="absolute left-1 top-1 w-4 h-4 bg-white rounded transition-transform"
                      :class="{ 'translate-x-6': splitPayment }"
                    ></div>
                  </div>
                  <span
                    class="ml-3 font-black text-xs uppercase text-[#757575] tracking-widest"
                    >Dividir Pagamento</span
                  >
                </label>
                <div
                  v-if="splitPayment"
                  class="flex items-center gap-4 bg-page/40 px-4 py-2 rounded border border-[#E0E0E0]"
                >
                  <span class="text-[10px] font-black text-[#757575] uppercase"
                    >Pessoas:</span
                  >
                  <input
                    type="number"
                    v-model.number="numberOfPeople"
                    min="2"
                    max="20"
                    class="bg-transparent text-[#212121] font-black w-12 text-center outline-none"
                  />
                  <button
                    @click="distributeEqually"
                    class="px-4 py-1.5 bg-blue-500 text-white text-[10px] font-black uppercase rounded hover:bg-blue-500 transition-colors"
                  >
                    Calcular
                  </button>
                </div>
              </div>

              <div v-if="!splitPayment" class="flex gap-3 flex-wrap">
                <button
                  v-for="method in enabledPaymentMethods"
                  :key="method"
                  @click="paymentSplits[0].type = method"
                  class="px-4 py-2 rounded text-xs font-black uppercase tracking-widest transition-all border"
                  :class="
                    paymentSplits[0]?.type === method
                      ? 'bg-primary text-white border-primary'
                      : 'bg-gray-50 text-[#757575] border-[#E0E0E0] hover:border-[#E0E0E0] hover:text-[#212121]'
                  "
                >
                  {{ method }}
                </button>
              </div>

              <div v-else class="space-y-4">
                <div
                  v-for="(split, idx) in paymentSplits"
                  :key="idx"
                  class="flex flex-col gap-2"
                >
                  <div
                    class="flex gap-3 items-center p-4 rounded border transition-all"
                    :class="
                      !split.amount || split.amount <= 0
                        ? 'bg-red-500/5 border-danger'
                        : 'bg-page/20 border-[#E0E0E0]'
                    "
                  >
                    <select
                      v-model="split.type"
                      class="bg-gray-50 border border-[#E0E0E0] rounded px-3 py-2 text-xs font-black text-[#212121] outline-none flex-1"
                    >
                      <option v-for="m in enabledPaymentMethods" :key="m">
                        {{ m }}
                      </option>
                    </select>
                    <input
                      type="text"
                      :value="utils.formatCurrency(split.amount)"
                      @input="applyMask($event, split)"
                      class="bg-gray-50 border border-[#E0E0E0] rounded px-3 py-2 text-sm font-black text-accent text-right w-32 outline-none"
                    />
                    <button
                      v-if="paymentSplits.length > 1"
                      @click="removePaymentSplit(idx)"
                      class="p-2 text-red-500 hover:bg-danger-light rounded transition-all"
                    >
                      <X :size="16" />
                    </button>
                  </div>
                  <p
                    v-if="split.amount <= 0"
                    class="text-danger text-[10px] font-bold ml-4 flex items-center gap-1 uppercase tracking-widest"
                  >
                    <AlertCircle :size="10" /> Valor obrigatório
                  </p>
                </div>
                <button
                  @click="addPaymentSplit"
                  class="w-full py-3 border border-dashed border-[#E0E0E0] rounded text-[#757575] text-xs font-black uppercase tracking-widest hover:border-[#E0E0E0] hover:text-[#757575] transition-all"
                >
                  + Adicionar método
                </button>
                <div
                  class="flex justify-between text-xs font-black pt-2 border-t border-[#E0E0E0]"
                  :class="
                    Math.abs(totalPayments - totalWithDiscount) > 0.01
                      ? 'text-danger'
                      : 'text-accent'
                  "
                >
                  <span class="uppercase tracking-widest">Distribuído:</span>
                  <span
                    >R$ {{ totalPayments.toFixed(2) }} / R$
                    {{ totalWithDiscount.toFixed(2) }}</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          class="p-8 border-t border-[#E0E0E0] bg-page/20 flex flex-col gap-6 shrink-0"
        >
          <div class="flex flex-col sm:flex-row justify-between gap-4 w-full">
            <div class="flex gap-3">
              <button
                @click="$emit('close')"
                class="px-6 py-3 bg-white border border-[#E0E0E0] text-[#757575] font-black uppercase tracking-widest text-xs rounded hover:bg-gray-50 transition-all"
              >
                Voltar
              </button>
              <button
                @click="$emit('cancel-comanda')"
                class="px-6 py-3 bg-danger/5 border border-danger/20 text-danger font-black uppercase tracking-widest text-xs rounded hover:bg-danger hover:text-white transition-all flex items-center gap-2"
              >
                <XCircle :size="16" /> Cancelar Comanda
              </button>
            </div>
            <div class="flex gap-3">
              <button
                @click="printReceipt"
                class="px-6 py-3 bg-gray-50 border border-[#E0E0E0] text-[#757575] font-black uppercase tracking-widest text-xs rounded hover:bg-gray-100 transition-all flex items-center gap-2"
              >
                <Printer :size="16" /> Cupom Fiscal
              </button>
              <button
                @click="handleFinalize"
                :disabled="isFinalizeDisabled"
                class="flex-grow sm:flex-none px-8 py-3 bg-primary text-white font-black uppercase tracking-widest text-xs rounded hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-20 disabled:grayscale disabled:cursor-not-allowed"
              >
                <CheckCircle :size="18" />
                {{
                  isFinalizeDisabled
                    ? "Pagamento Inválido"
                    : "Confirmar Pagamento"
                }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useCouponStore } from "@/stores/coupons";
import { useUtils } from "@/composables/useUtils";
import {
  Receipt,
  AlertTriangle,
  X,
  XCircle,
  Tag,
  CheckCircle,
  Printer,
  AlertCircle,
} from "lucide-vue-next";

const props = defineProps({
  isOpen: Boolean,
  comanda: Object,
  ordersWithStatus: Array,
  enabledPaymentMethods: Array,
  comandaUnitLabel: String,
});
const emit = defineEmits([
  "close",
  "cancel-comanda",
  "cancel-order",
  "print-receipt",
  "finalize",
]);

const couponStore = useCouponStore();
const utils = useUtils();

const paymentMode = ref("total");
const selectedOrderIds = ref([]);

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      paymentMode.value = "total";
      selectedOrderIds.value = props.ordersWithStatus.map((o) => o.id);
      discountType.value = "percent";
      discountValue.value = 0;
      discountRaw.value = "";
      appliedCoupon.value = null;
      couponCodeInput.value = "";
      couponError.value = "";
      splitPayment.value = false;
      numberOfPeople.value = 2;
      paymentSplits.value = [{ type: "Dinheiro", amount: 0 }];
    }
  },
);

watch(paymentMode, (mode) => {
  if (mode === "total")
    selectedOrderIds.value = props.ordersWithStatus.map((o) => o.id);
  else selectedOrderIds.value = [];
});

function getGroupedOrderItems(order) {
  const items = order.items || order.productOrders || [];
  const groups = [];
  items.forEach((i) => {
    const variationName = (
      i.variations?.[0]?.productVariation?.name || ""
    ).trim();
    const baseName = (i.name || i.product?.name || "Item").trim();
    const fullName = baseName + (variationName ? ` (${variationName})` : "");
    const amount = Number(i.amount || i.quantity || 1);
    const price = Number(i.price ?? i.Preco_Unitario_Momento ?? 0);
    const obs = (i.observation || i.obs || "").trim();
    const existing = groups.find(
      (g) =>
        g.name === fullName &&
        Math.abs(g.price - price) < 0.01 &&
        g.observation === obs,
    );
    if (existing) {
      existing.amount += amount;
      existing.total += price * amount;
    } else {
      groups.push({
        name: fullName,
        amount,
        price,
        total: price * amount,
        observation: obs,
      });
    }
  });
  return groups;
}

function getOrderTotal(order) {
  const items = getGroupedOrderItems(order);
  if (items.length === 0) return Number(order.price ?? 0);
  return items.reduce((sum, item) => sum + item.total, 0);
}

function getComandaMainLabel(comanda) {
  return comanda?.isAutoatendimento && comanda?.customerName
    ? comanda.customerName
    : comanda?.label || `#${comanda?.id}`;
}

const discountType = ref("percent");
const discountValue = ref(0);
const discountRaw = ref("");
const couponCodeInput = ref("");
const appliedCoupon = ref(null);
const couponError = ref("");
const paymentSplits = ref([{ type: "Dinheiro", amount: 0 }]);
const splitPayment = ref(false);
const numberOfPeople = ref(1);

const hasPreparing = computed(() =>
  props.ordersWithStatus.some((o) => o.status === "preparing"),
);
const hasPending = computed(() =>
  props.ordersWithStatus.some((o) => o.status === "pending"),
);

const ordersToCalculate = computed(() =>
  props.ordersWithStatus.filter((o) => selectedOrderIds.value.includes(o.id)),
);

const subtotal = computed(() => {
  if (ordersToCalculate.value.length === 0) return 0;
  const sum = ordersToCalculate.value.reduce(
    (acc, order) => acc + getOrderTotal(order),
    0,
  );
  return Math.round(sum * 100) / 100;
});

const couponDiscount = computed(() => {
  if (!appliedCoupon.value || subtotal.value === 0) return 0;
  if (appliedCoupon.value.type === "percent")
    return subtotal.value * (appliedCoupon.value.value / 100);
  return Math.min(appliedCoupon.value.value, subtotal.value);
});

const totalWithDiscount = computed(() => {
  if (subtotal.value === 0) return 0;
  let afterManual = subtotal.value;
  if (discountValue.value) {
    if (discountType.value === "percent")
      afterManual = subtotal.value * (1 - discountValue.value / 100);
    else afterManual = Math.max(0, subtotal.value - discountValue.value);
  }
  return Math.max(0, afterManual - couponDiscount.value);
});

const totalPayments = computed(() =>
  paymentSplits.value.reduce((sum, s) => sum + (s.amount || 0), 0),
);

const isFinalizeDisabled = computed(() => {
  if (selectedOrderIds.value.length === 0) return true;
  if (splitPayment.value) {
    const hasZero = paymentSplits.value.some((s) => !s.amount || s.amount <= 0);
    const totalMismatch =
      Math.abs(totalPayments.value - totalWithDiscount.value) > 0.01;
    return hasZero || totalMismatch;
  }
  return totalWithDiscount.value < 0;
});

watch(discountType, () => {
  discountValue.value = 0;
  discountRaw.value = "";
  appliedCoupon.value = null;
  couponCodeInput.value = "";
  couponError.value = "";
});

const applyDiscountMask = (raw) => {
  let val = String(raw).replace(/[^\d,]/g, "");
  const commaIdx = val.indexOf(",");
  if (commaIdx !== -1) {
    val =
      val.slice(0, commaIdx + 1) + val.slice(commaIdx + 1).replace(/,/g, "");
    val = val.slice(0, commaIdx + 3);
  }
  const parts = val.split(",");
  parts[0] = parts[0].replace(/^0+(\d)/, "$1");
  return parts.join(",");
};
const onDiscountInput = (e) => {
  if (discountType.value === "percent") {
    const digits = e.target.value.replace(/\D/g, "");
    const num = Math.min(100, parseInt(digits, 10) || 0);
    discountValue.value = num;
    discountRaw.value = num === 0 ? "" : String(num);
  } else {
    const masked = applyDiscountMask(e.target.value);
    discountRaw.value = masked;
    discountValue.value = parseFloat(masked.replace(",", ".")) || 0;
  }
};

const applyCoupon = () => {
  couponError.value = "";
  if (!couponCodeInput.value.trim()) return;
  const coupon = couponStore.findByCode(couponCodeInput.value);
  if (!coupon) {
    couponError.value = "Cupom não encontrado ou inativo.";
    return;
  }
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    couponError.value = "Este cupom está vencido.";
    return;
  }
  appliedCoupon.value = coupon;
  couponError.value = "";
};
const removeCoupon = () => {
  appliedCoupon.value = null;
  couponCodeInput.value = "";
  couponError.value = "";
};

watch(numberOfPeople, (newVal) => {
  const num = Math.max(2, newVal);
  if (num !== newVal) numberOfPeople.value = num;
  const currentLength = paymentSplits.value.length;
  if (currentLength < num) {
    for (let i = currentLength; i < num; i++)
      paymentSplits.value.push({ type: "Dinheiro", amount: 0 });
  } else if (currentLength > num) {
    paymentSplits.value.splice(num);
  }
});

function distributeEqually() {
  const num = numberOfPeople.value;
  const total = totalWithDiscount.value;
  const each = Math.floor((total / num) * 100) / 100;
  paymentSplits.value = Array.from({ length: num }, (_, i) => ({
    type: "Dinheiro",
    amount: i === 0 ? total - each * (num - 1) : each,
  }));
}
function addPaymentSplit() {
  paymentSplits.value.push({ type: "Dinheiro", amount: 0 });
}
function removePaymentSplit(index) {
  paymentSplits.value.splice(index, 1);
}
function applyMask(event, method) {
  let value = event.target.value.replace(/\D/g, "");
  if (value === "") value = "0";
  method.amount = parseInt(value, 10) / 100;
  event.target.value = utils.formatCurrency(method.amount);
}

function printReceipt() {
  const hasDiscount = discountValue.value > 0 || couponDiscount.value > 0;
  const paymentInfo = hasDiscount
    ? {
        totalFinal: totalWithDiscount.value,
        coupon: appliedCoupon.value ? appliedCoupon.value.code : null,
        couponDiscount: couponDiscount.value,
        manualDiscount:
          discountType.value === "percent"
            ? subtotal.value * (discountValue.value / 100)
            : discountValue.value,
        payments: [],
      }
    : null;
  emit("print-receipt", paymentInfo);
}

function handleFinalize() {
  if (isFinalizeDisabled.value) return;
  if (!splitPayment.value)
    paymentSplits.value[0].amount = totalWithDiscount.value;

  emit("finalize", {
    paymentSplits: paymentSplits.value,
    totalWithDiscount: totalWithDiscount.value,
    discountType: discountType.value,
    discountValue: discountValue.value,
    appliedCoupon: appliedCoupon.value,
    couponDiscount: couponDiscount.value,
    subtotal: subtotal.value,
    hasPreparing: hasPreparing.value,
    hasPending: hasPending.value,
    selectedOrderIds: selectedOrderIds.value,
    paymentMode: paymentMode.value,
  });
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e0e0e0;
  border-radius: 10px;
}
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
