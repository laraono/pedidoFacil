<template>
  <div
    class="bg-gray-50 rounded border border-[#E0E0E0] p-6 cursor-pointer hover:border-blue-500/50 hover:bg-gray-50 transition-all group"
    @click="$emit('click', comanda)"
  >
    <div class="flex justify-between items-start mb-4 gap-2">
      <div class="min-w-0">
        <span
          class="text-[10px] font-black uppercase tracking-widest block mb-1 truncate"
          :class="
            comanda.isAutoatendimento ? 'text-blue-500' : 'text-[#757575]'
          "
        >
          {{ typeLabel }}
        </span>
        <span
          class="font-black text-[#212121] text-xl tracking-tighter group-hover:text-blue-400 transition-colors block truncate"
        >
          {{ mainLabel }}
        </span>
      </div>
      <span class="text-accent font-black text-lg tracking-tighter shrink-0">
        {{ formatCurrency(remainingTotal) }}
      </span>
    </div>
    <div
      class="flex items-center gap-2 text-[10px] font-bold text-[#757575] uppercase tracking-wider bg-page/40 p-3 rounded border border-[#E0E0E0]"
    >
      <Receipt :size="14" class="text-blue-500" />
      {{ activeOrdersCount }} pedidos vinculados
    </div>
  </div>
</template>

<script setup>
  import { computed } from "vue";
  import { Receipt } from "lucide-vue-next";
  import { useUtils } from "@/composables/useUtils";
  import { isOrderActive } from "@/utils/checkoutUtils";

  const { formatCurrency } = useUtils();

  const props = defineProps({
    comanda: { type: Object, required: true },
    comandaUnitLabel: { type: String, default: "Mesa" },
    kitchenOrders: { type: Array, default: () => [] },
  });

  defineEmits(["click"]);

  const typeLabel = computed(() =>
    props.comanda.isAutoatendimento
      ? "Autoatendimento"
      : props.comandaUnitLabel,
  );

  const mainLabel = computed(() => {
    if (props.comanda.customerName) return props.comanda.customerName;
    if (props.comanda.isAutoatendimento && props.comanda.description)
      return props.comanda.description;
    return (
      props.comanda.label || props.comanda.description || `#${props.comanda.id}`
    );
  });

  const activeOrders = computed(() =>
    (props.comanda.orders || []).filter((o) =>
      isOrderActive(o, props.kitchenOrders),
    ),
  );

  const activeOrdersCount = computed(() => activeOrders.value.length);

  const remainingTotal = computed(() =>
    activeOrders.value.reduce((total, o) => {
      const items = o.items || o.productOrders || [];
      const orderTotal = items.reduce((sum, i) => {
        return (
          sum +
          Number(i.price ?? i.Preco_Unitario_Momento ?? 0) *
            Number(i.amount || i.quantity || 1)
        );
      }, 0);
      const paid = (o.paymentOrders || []).reduce(
        (sum, po) => sum + Number(po.price || 0),
        0,
      );
      return total + Math.max(0, orderTotal - paid);
    }, 0),
  );
</script>
