<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      style="z-index: 99998"
    >
      <div
        class="bg-white border border-[#E0E0E0] rounded w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden max-h-[85vh]"
      >
        <div
          class="p-6 border-b border-[#E0E0E0] flex justify-between items-center bg-gray-50 shrink-0"
        >
          <div class="flex items-center gap-3">
            <div
              class="bg-blue-500/10 p-2 rounded text-blue-500 border border-blue-500/20"
            >
              <ClipboardList :size="20" />
            </div>
            <div>
              <h2
                class="text-xl font-black text-[#212121] uppercase tracking-tighter"
              >
                {{ comandaLabel }}
              </h2>
              <p
                class="font-black uppercase tracking-widest text-[10px] text-[#757575]"
              >
                Itens e Pedidos Vinculados
              </p>
            </div>
          </div>
          <button
            @click="$emit('close')"
            class="p-2 text-[#757575] hover:text-[#212121] hover:bg-gray-200 rounded transition-all"
          >
            <X :size="20" />
          </button>
        </div>

        <div
          class="p-6 overflow-y-auto bg-white flex-grow custom-scrollbar space-y-3"
        >
          <div
            v-if="!orders || orders.length === 0"
            class="text-center py-8 text-[#757575] font-bold"
          >
            Nenhum pedido encontrado.
          </div>

          <div
            v-else
            v-for="order in orders"
            :key="order.id"
            class="p-4 rounded border border-[#E0E0E0] bg-gray-50"
          >
            <div
              class="flex justify-between items-center mb-3 border-b border-[#E0E0E0] pb-2"
            >
              <span
                class="font-black text-[#212121] text-xs uppercase tracking-widest"
              >
                Pedido #{{ order.id }}
              </span>
              <span
                class="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border"
                :class="getStatusTheme(order.status)"
              >
                {{ formatStatus(order.status) }}
              </span>
            </div>

            <div class="space-y-2">
              <div
                v-for="(item, idx) in order.items"
                :key="idx"
                class="flex items-start gap-3"
              >
                <span class="font-black text-sm text-accent"
                  >{{ item.amount || item.quantity }}x</span
                >
                <div class="flex flex-col">
                  <span class="font-bold text-sm text-[#212121]">{{
                    item.name
                  }}</span>
                  <span
                    v-if="item.variationName"
                    class="text-[10px] font-black text-blue-500 uppercase"
                  >
                    {{ item.variationName }}
                  </span>
                  <span
                    v-if="item.observation || item.obs"
                    class="text-[10px] font-bold text-amber-600 mt-0.5 bg-amber-50 px-1 py-0.5 rounded italic"
                  >
                    Obs: {{ item.observation || item.obs }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="p-6 border-t border-[#E0E0E0] bg-gray-50 shrink-0">
          <button
            @click="$emit('close')"
            class="w-full py-3 bg-white border border-[#E0E0E0] text-[#757575] font-black uppercase tracking-widest text-xs rounded hover:bg-gray-100 transition-all"
          >
            Fechar Janela
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
  import { ClipboardList, X } from "lucide-vue-next";

  const props = defineProps({
    isOpen: { type: Boolean, required: true },
    comandaLabel: { type: String, default: "Comanda" },
    orders: { type: Array, default: () => [] },
  });

  defineEmits(["close"]);

  const formatStatus = (status) => {
    const map = {
      pending: "Aguardando",
      preparing: "Em Preparo",
      ready: "Pronto",
      finished: "Finalizado",
      cancelled: "Cancelado",
    };
    return map[status] || status;
  };

  const getStatusTheme = (status) => {
    switch (status) {
      case "pending":
        return "border-yellow-500/30 bg-yellow-500/10 text-yellow-600";
      case "preparing":
        return "border-blue-500/30 bg-blue-500/10 text-blue-600";
      case "ready":
        return "border-accent/40 bg-accent-light text-accent";
      case "cancelled":
        return "border-red-500/30 bg-red-50 text-red-600";
      default:
        return "border-gray-300 bg-gray-100 text-gray-600";
    }
  };
</script>
