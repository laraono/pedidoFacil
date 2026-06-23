<script setup>
  import { X, ShoppingBag, Trash2 } from "lucide-vue-next";
  import { useUtils } from "@/composables/useUtils";

  const props = defineProps({
    cart: { type: Array, required: true },
    cartTotal: { type: Number, default: 0 },
    theme: { type: Object, required: true },
  });

  const emit = defineEmits(["close", "removeItem", "sendToKitchen"]);

  const { formatCurrency } = useUtils();
</script>

<template>
  <Transition
    enter-active-class="transition duration-300"
    enter-from-class="opacity-0"
    leave-active-class="transition duration-200"
    leave-to-class="opacity-0"
  >
    <div
      v-if="cart.length > 0"
      class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <div
        class="w-full sm:max-w-md rounded-t sm:rounded overflow-hidden flex flex-col max-h-[90vh] shadow-2xl animate-slideUp sm:animate-none"
        :style="{
          backgroundColor: theme.cardBg,
          fontFamily: theme.fontFamily,
          color: theme.textColor,
        }"
      >
        <div
          class="p-6 flex justify-between items-center shrink-0"
          :style="{ borderBottom: `1px solid ${theme.adaptiveBorder}` }"
        >
          <div class="flex items-center gap-3">
            <ShoppingBag :size="28" :style="{ color: theme.buttonColor }" />
            <h3 class="font-black text-2xl">Meu Pedido</h3>
          </div>
          <button
            @click="emit('close')"
            class="p-2 rounded transition-colors"
            :style="{
              backgroundColor: theme.adaptiveButtonBg,
              color: theme.textColor,
            }"
          >
            <X :size="24" />
          </button>
        </div>

        <div
          class="p-4 overflow-y-auto custom-scrollbar flex-1"
          :style="{ backgroundColor: theme.adaptiveSubtleBg }"
        >
          <div class="space-y-3">
            <div
              v-for="(item, index) in cart"
              :key="item.id"
              class="p-5 rounded border flex gap-4 items-center relative overflow-hidden"
              :style="{
                backgroundColor: theme.adaptiveInputBg,
                borderColor: theme.adaptiveBorder,
              }"
            >
              <div
                class="font-black w-10 h-10 rounded flex items-center justify-center shrink-0 text-sm"
                :style="{
                  backgroundColor: theme.adaptiveButtonBg,
                  color: theme.textColor,
                }"
              >
                {{ item.quantity }}x
              </div>
              <div class="flex-1">
                <div class="flex justify-between items-start mb-1">
                  <h4 class="font-bold text-lg leading-tight">
                    {{ item.name }}
                    <span class="text-sm font-medium opacity-60"
                      >({{ item.sizeName }})</span
                    >
                  </h4>
                  <span class="font-black ml-2">{{
                    formatCurrency(item.price * item.quantity)
                  }}</span>
                </div>
                <p
                  v-if="item.obs"
                  class="text-sm inline-block px-3 py-1 rounded mt-2 font-medium border"
                  :style="{
                    backgroundColor: theme.adaptiveButtonBg,
                    borderColor: theme.adaptiveBorder,
                  }"
                >
                  Obs: {{ item.obs }}
                </p>
              </div>
              <button
                @click="emit('removeItem', index)"
                class="text-red-400 p-2 rounded transition-colors shrink-0"
                :style="{ backgroundColor: theme.adaptiveButtonBg }"
              >
                <Trash2 :size="20" />
              </button>
            </div>
          </div>
        </div>

        <div
          class="p-6 shrink-0 space-y-5"
          :style="{ borderTop: `1px solid ${theme.adaptiveBorder}` }"
        >
          <div class="flex justify-between items-center text-lg">
            <span class="font-bold opacity-60 uppercase tracking-wider text-sm"
              >Total</span
            >
            <span class="font-black text-3xl">{{
              formatCurrency(cartTotal)
            }}</span>
          </div>
          <button
            @click="emit('sendToKitchen')"
            :style="{
              backgroundColor: theme.buttonColor,
              color: theme.buttonTextColor,
            }"
            class="w-full py-5 font-black rounded shadow-xl transition-transform active:scale-95 flex justify-center items-center gap-2 text-lg"
          >
            Enviar para a Cozinha
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(156, 163, 175, 0.5);
    border-radius: 10px;
  }
  @keyframes slideUp {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  .animate-slideUp {
    animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
</style>
