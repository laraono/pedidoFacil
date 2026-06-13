<script setup>
  import { XCircle } from "lucide-vue-next";
  import {
    getGroupedOrderItems,
    getOrderOriginalTotal,
    getOrderPaid,
    getOrderTotal,
  } from "@/utils/checkoutUtils";
  import { useUtils } from "@/composables/useUtils";

  const props = defineProps({
    order: { type: Object, required: true },
    paymentMode: { type: String, required: true },
    isSelected: { type: Boolean, default: true },
  });

  const emit = defineEmits(["toggle-select", "cancel-order"]);
  const { formatCurrency } = useUtils();

  const statusLabel = {
    pending: "Aguardando",
    preparing: "Preparando",
    ready: "Pronto",
  };
</script>

<template>
  <div
    class="rounded p-6 transition-all"
    :class="[
      order.status === 'pending'
        ? 'border border-yellow-500/30 bg-yellow-500/5'
        : 'border border-[#E0E0E0] bg-gray-50',
      paymentMode === 'parcial' && !isSelected ? 'opacity-50 grayscale' : '',
    ]"
  >
    <div class="flex justify-between items-center mb-4">
      <div class="flex items-center gap-3">
        <input
          v-if="paymentMode === 'parcial'"
          type="checkbox"
          :checked="isSelected"
          :disabled="order.status === 'pending'"
          @change="emit('toggle-select', order.id)"
          class="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          :class="order.status === 'pending' ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'"
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
          {{ statusLabel[order.status] ?? order.status }}
        </span>
        <button
          v-if="order.status !== 'finished' && order.status !== 'FINALIZADO'"
          @click.stop.prevent="emit('cancel-order', order.id)"
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
        <span class="text-[#757575] mt-0.5">{{
          formatCurrency(item.total)
        }}</span>
      </div>
    </div>

    <div
      class="text-right font-black text-[#212121] text-sm mt-3 pt-3 border-t border-[#E0E0E0] border-dashed"
    >
      <div
        v-if="getOrderPaid(order) > 0"
        class="text-xs text-amber-500 mb-1 uppercase tracking-widest font-bold"
      >
        Valor Original: {{ formatCurrency(getOrderOriginalTotal(order)) }} | Já
        Pago: {{ formatCurrency(getOrderPaid(order)) }}
      </div>
      Total Restante do Pedido:
      <span class="text-blue-400 ml-2">{{
        formatCurrency(getOrderTotal(order))
      }}</span>
    </div>
  </div>
</template>
