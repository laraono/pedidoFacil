<script setup>
  import { computed } from "vue";
  import {
    Clock,
    ChefHat,
    CheckCircle2,
    Flame,
    XCircle,
  } from "lucide-vue-next";
  import localStorageService from "@/services/localStorageService";
  import { useOrderTimer } from "@/composables/useOrderTimer";
  import BaseButton from "@/components/ui/BaseButton.vue";
  import OrderItemsList from "@/components/kitchen/OrderItemsList.vue";

  const props = defineProps({
    order: { type: Object, required: true },
    alertMinutes: { type: Number, default: 15 },
  });

  const emit = defineEmits(["move", "cancel", "finish"]);

  const unitLabel = localStorageService.getComandaUnitLabel();
  const isAutoatendimento = computed(
    () =>
      props.order.source === "totem" ||
      (props.order.comanda || "").startsWith("Totem #"),
  );

  const { elapsedTime, isDelayed } = useOrderTimer(
    props.order,
    props.alertMinutes,
  );

  const statusTheme = computed(() => {
    if (!props.order) return {};
    if (isDelayed.value && props.order.status !== "ready") {
      return {
        color: "bg-red-600",
        border: "border-red-400",
        bg: "bg-red-50",
        btn: "bg-red-600 text-white shadow-red-200",
        barWidth: "w-6",
      };
    }
    switch (props.order.status) {
      case "pending":
        return {
          color: "bg-amber-500",
          border: "border-[#E0E0E0]",
          bg: "bg-white",
          btn: "bg-amber-500 text-white",
          barWidth: "w-3",
        };
      case "preparing":
        return {
          color: "bg-blue-500",
          border: "border-[#E0E0E0]",
          bg: "bg-white",
          btn: "bg-blue-500 text-white",
          barWidth: "w-3",
        };
      case "ready":
        return {
          color: "bg-accent",
          border: "border-[#E0E0E0]",
          bg: "bg-white",
          btn: "bg-primary text-white",
          barWidth: "w-3",
        };
      default:
        return {
          color: "bg-gray-400",
          border: "border-[#E0E0E0]",
          bg: "bg-white",
          btn: "bg-gray-400 text-white",
          barWidth: "w-3",
        };
    }
  });
</script>

<template>
  <div
    class="w-full rounded flex overflow-hidden mb-5 transition-all duration-500 border shadow-sm"
    :class="[
      statusTheme.bg,
      statusTheme.border,
      isDelayed && order.status !== 'ready' ? 'animate-emergency' : '',
    ]"
  >
    <div
      class="shrink-0 transition-all duration-300 flex items-center justify-center"
      :class="[statusTheme.color, statusTheme.barWidth]"
    >
      <Flame
        v-if="isDelayed && order.status !== 'ready'"
        :size="16"
        class="text-white animate-bounce"
      />
    </div>

    <div class="flex-grow flex flex-col">
      <div
        class="p-4 flex justify-between items-center border-b border-[#E0E0E0] bg-gray-50"
      >
        <div class="flex items-center gap-3">
          <span class="font-black text-2xl text-[#212121] tracking-tighter">{{
            order.id
          }}</span>
          <div class="flex flex-col">
            <span
              class="text-[9px] font-black uppercase tracking-[0.2em] leading-none"
              :class="isAutoatendimento ? 'text-blue-500' : 'text-[#757575]'"
            >
              {{ isAutoatendimento ? "Autoatendimento" : unitLabel }}
            </span>
            <span
              class="text-[#212121] font-black text-base uppercase italic leading-none"
            >
              {{
                isAutoatendimento && order.customerName
                  ? order.customerName
                  : order.comanda
              }}
            </span>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <div
            class="flex items-center gap-2 font-mono text-xl font-black px-4 py-1.5 rounded border transition-colors"
            :class="
              isDelayed && order.status !== 'ready'
                ? 'bg-red-600 text-white border-red-400'
                : 'bg-gray-100 text-[#212121] border-[#E0E0E0]'
            "
          >
            <Clock :size="18" stroke-width="3" />
            {{ elapsedTime }}
          </div>

          <BaseButton
            v-if="order.status !== 'ready'"
            variant="danger"
            title="Cancelar pedido"
            @click.stop="emit('cancel', order.id)"
            class="!py-2 !px-2"
          >
            <XCircle :size="16" stroke-width="2.5" />
          </BaseButton>
        </div>
      </div>

      <OrderItemsList
        :items="order.items || []"
        :isDelayed="isDelayed"
        :isReady="order.status === 'ready'"
      />

      <div class="p-4 mt-auto">
        <button
          v-if="order.status === 'pending'"
          @click="emit('move', order.id, 'preparing')"
          class="w-full py-4 rounded font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 transition-all active:scale-95"
          :class="statusTheme.btn"
        >
          <ChefHat :size="18" stroke-width="3" /> Iniciar Agora
        </button>

        <button
          v-if="order.status === 'preparing'"
          @click="emit('move', order.id, 'ready')"
          class="w-full py-4 rounded font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 transition-all active:scale-95"
          :class="statusTheme.btn"
        >
          <CheckCircle2 :size="18" stroke-width="3" /> Concluir Preparo
        </button>

        <button
          v-if="order.status === 'ready'"
          @click="
            isAutoatendimento
              ? emit('move', order.id, 'finished')
              : emit('finish', order.id)
          "
          class="w-full py-4 bg-gray-100 hover:bg-gray-200 text-[#212121] border border-[#E0E0E0] rounded font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 transition-all"
        >
          Finalizar Entrega
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
  @keyframes emergency {
    0%,
    100% {
      border-color: rgba(220, 38, 38, 0.5);
      background-color: #fff5f5;
    }
    50% {
      border-color: rgba(220, 38, 38, 0.8);
      background-color: #fee2e2;
    }
  }
  .animate-emergency {
    animation: emergency 1.5s ease-in-out infinite;
  }
  .animate-bounce {
    animation: bounce 1s infinite;
  }
  @keyframes bounce {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-3px);
    }
  }
</style>
