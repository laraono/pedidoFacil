import { ref, computed, watch } from "vue";
import { useCouponStore } from "@/stores/coupons";
import { useUtils } from "@/composables/useUtils";
import { getOrderTotal } from "@/utils/checkoutUtils";

interface Order {
  id: number
  status: string
  [key: string]: any
}

interface PaymentSplit {
  type: string
  amount: number
}

interface Coupon {
  type: 'percent' | 'fixed'
  value: number
  expiresAt?: string | null
}

export function useCheckoutPayment(
  getOrders: () => Order[],
  getEnabledMethods: () => string[],
) {
  const couponStore = useCouponStore();
  const utils = useUtils();

  const paymentMode = ref("total");
  const selectedOrderIds = ref<number[]>([]);
  const discountType = ref("percent");
  const discountValue = ref(0);
  const discountRaw = ref("");
  const couponCodeInput = ref("");
  const appliedCoupon = ref<Coupon | null>(null);
  const couponError = ref("");
  const splitPayment = ref(false);
  const numberOfPeople = ref(2);
  const paymentSplits = ref<PaymentSplit[]>([{ type: "Dinheiro", amount: 0 }]);

  function reset() {
    paymentMode.value = "total";
    selectedOrderIds.value = getOrders().map((o) => o.id);
    discountType.value = "percent";
    discountValue.value = 0;
    discountRaw.value = "";
    appliedCoupon.value = null;
    couponCodeInput.value = "";
    couponError.value = "";
    splitPayment.value = false;
    numberOfPeople.value = 2;
    paymentSplits.value = [{ type: getEnabledMethods()[0] ?? "Dinheiro", amount: 0 }];
  }

  watch(paymentMode, (mode) => {
    selectedOrderIds.value = mode === "total" ? getOrders().map((o) => o.id) : [];
  });

  watch(discountType, () => {
    discountValue.value = 0;
    discountRaw.value = "";
    appliedCoupon.value = null;
    couponCodeInput.value = "";
    couponError.value = "";
  });

  watch(numberOfPeople, (newVal) => {
    const num = Math.max(2, newVal);
    if (num !== newVal) numberOfPeople.value = num;
    const current = paymentSplits.value.length;
    if (current < num) {
      for (let i = current; i < num; i++)
        paymentSplits.value.push({ type: getEnabledMethods()[0] ?? "Dinheiro", amount: 0 });
    } else if (current > num) {
      paymentSplits.value.splice(num);
    }
  });

  const ordersToCalculate = computed(() =>
    getOrders().filter((o) => selectedOrderIds.value.includes(o.id))
  );

  const hasPending = computed(() => getOrders().some((o) => o.status === "pending"));
  const hasPreparing = computed(() => getOrders().some((o) => o.status === "preparing"));

  const subtotal = computed(() => {
    if (ordersToCalculate.value.length === 0) return 0;
    return Math.round(ordersToCalculate.value.reduce((acc, o) => acc + getOrderTotal(o), 0) * 100) / 100;
  });

  const couponDiscount = computed(() => {
    if (!appliedCoupon.value || subtotal.value === 0) return 0;
    if (appliedCoupon.value.type === "percent")
      return subtotal.value * (appliedCoupon.value.value / 100);
    return Math.min(appliedCoupon.value.value, subtotal.value);
  });

  const totalWithDiscount = computed(() => {
    if (subtotal.value === 0) return 0;
    let after = subtotal.value;
    if (discountValue.value) {
      after = discountType.value === "percent"
        ? subtotal.value * (1 - discountValue.value / 100)
        : Math.max(0, subtotal.value - discountValue.value);
    }
    return Math.max(0, after - couponDiscount.value);
  });

  const totalPayments = computed(() =>
    paymentSplits.value.reduce((sum, s) => sum + (s.amount || 0), 0)
  );

  const isFinalizeDisabled = computed(() => {
    if (selectedOrderIds.value.length === 0) return true;
    if (splitPayment.value) {
      return (
        paymentSplits.value.some((s) => !s.amount || s.amount <= 0) ||
        Math.abs(totalPayments.value - totalWithDiscount.value) > 0.01
      );
    }
    return totalWithDiscount.value < 0;
  });

  function onDiscountInput(e: Event) {
    const target = e.target as HTMLInputElement;
    if (discountType.value === "percent") {
      const num = Math.min(100, parseInt(target.value.replace(/\D/g, ""), 10) || 0);
      discountValue.value = num;
      discountRaw.value = num === 0 ? "" : String(num);
      target.value = discountRaw.value;
    } else {
      let val = target.value.replace(/[^\d,]/g, "");
      const commaIdx = val.indexOf(",");
      if (commaIdx !== -1) {
        val = val.slice(0, commaIdx + 1) + val.slice(commaIdx + 1).replace(/,/g, "");
        val = val.slice(0, commaIdx + 3);
      }
      const parts = val.split(",");
      parts[0] = parts[0].replace(/^0+(\d)/, "$1");
      const masked = parts.join(",");
      const parsed = parseFloat(masked.replace(",", ".")) || 0;
      const clamped = Math.min(parsed, subtotal.value);
      discountValue.value = clamped;
      discountRaw.value = clamped < parsed ? clamped.toFixed(2).replace(".", ",") : masked;
      target.value = discountRaw.value;
    }
  }

  function applyCoupon() {
    couponError.value = "";
    if (!couponCodeInput.value.trim()) return;
    const coupon = couponStore.findByCode(couponCodeInput.value) as Coupon | null | undefined;
    if (!coupon) { couponError.value = "Cupom não encontrado ou inativo."; return; }
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) { couponError.value = "Este cupom está vencido."; return; }
    if (coupon.type === "fixed" && subtotal.value - coupon.value < 1.0) {
      couponError.value = "O valor final com este cupom fica menor que R$ 1,00.";
      return;
    }
    appliedCoupon.value = coupon;
  }

  function removeCoupon() {
    appliedCoupon.value = null;
    couponCodeInput.value = "";
    couponError.value = "";
  }

  function distributeEqually() {
    const num = numberOfPeople.value;
    const total = totalWithDiscount.value;
    const each = Number((total / num).toFixed(2));
    paymentSplits.value = Array.from({ length: num }, (_, i) => ({
      type: getEnabledMethods()[0] ?? "Dinheiro",
      amount: i === 0 ? Number((total - each * (num - 1)).toFixed(2)) : each,
    }));
  }

  function addPaymentSplit() {
    paymentSplits.value.push({ type: getEnabledMethods()[0] ?? "Dinheiro", amount: 0 });
  }

  function removePaymentSplit(index: number) {
    paymentSplits.value.splice(index, 1);
  }

  function applyMask(event: Event, split: PaymentSplit) {
    const target = event.target as HTMLInputElement;
    let value = target.value.replace(/\D/g, "");
    if (value === "") value = "0";
    split.amount = parseInt(value, 10) / 100;
    target.value = utils.formatCurrency(split.amount);
  }

  function buildFinalizePayload() {
    if (!splitPayment.value) paymentSplits.value[0].amount = totalWithDiscount.value;
    return {
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
    };
  }

  return {
    paymentMode, selectedOrderIds,
    discountType, discountValue, discountRaw,
    couponCodeInput, appliedCoupon, couponError,
    splitPayment, numberOfPeople, paymentSplits,
    hasPending, hasPreparing,
    subtotal, couponDiscount, totalWithDiscount, totalPayments,
    isFinalizeDisabled,
    reset, onDiscountInput, applyCoupon, removeCoupon,
    distributeEqually, addPaymentSplit, removePaymentSplit, applyMask,
    buildFinalizePayload,
  };
}
