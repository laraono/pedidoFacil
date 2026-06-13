<script setup>
  import { X, Plus, Minus } from "lucide-vue-next";
  import { getImageUrl } from "@/utils/imageUrl";
  import { useUtils } from "@/composables/useUtils";

  const props = defineProps({
    product: Object,
    quantity: { type: Number, default: 1 },
    observation: { type: String, default: "" },
    selectedSize: Object,
    observacoesPermitidas: { type: Boolean, default: true },
    total: { type: Number, default: 0 },
    theme: { type: Object, required: true },
  });

  const emit = defineEmits([
    "update:quantity",
    "update:observation",
    "update:selectedSize",
    "close",
    "add",
  ]);

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
      v-if="product"
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
          <h3 class="font-black text-2xl truncate pr-4">{{ product.name }}</h3>
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
          class="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6"
          :style="{ backgroundColor: theme.adaptiveSubtleBg }"
        >
          <div
            v-if="product.image"
            class="w-full h-48 rounded bg-cover bg-center shadow-inner"
            :style="{ backgroundImage: `url(${getImageUrl(product.image)})` }"
          />
          <p class="leading-relaxed text-base opacity-90">
            {{ product.description }}
          </p>

          <div v-if="product.sizes?.length > 0" class="space-y-3">
            <h4 class="font-bold uppercase tracking-wider text-sm opacity-70">
              Escolha o Tamanho
            </h4>
            <div class="flex flex-col gap-2">
              <label
                v-for="size in product.sizes"
                :key="size.name"
                class="flex items-center justify-between p-4 border rounded cursor-pointer transition-all"
                :style="
                  selectedSize?.name === size.name
                    ? {
                        borderColor: theme.buttonColor,
                        backgroundColor: theme.buttonColor + '1A',
                      }
                    : {
                        borderColor: theme.adaptiveBorder,
                        backgroundColor: theme.adaptiveInputBg,
                      }
                "
              >
                <div class="flex items-center gap-3">
                  <input
                    type="radio"
                    :value="size"
                    :checked="selectedSize?.name === size.name"
                    @change="emit('update:selectedSize', size)"
                    class="w-5 h-5"
                    :style="{ accentColor: theme.buttonColor }"
                  />
                  <span class="font-bold">{{ size.name }}</span>
                </div>
                <span
                  class="font-bold"
                  :style="{
                    color:
                      selectedSize?.name === size.name
                        ? theme.buttonColor
                        : theme.textColor,
                  }"
                >
                  {{ formatCurrency(size.price) }}
                </span>
              </label>
            </div>
          </div>

          <div v-if="observacoesPermitidas" class="space-y-3">
            <label
              class="block text-sm font-bold uppercase tracking-wider opacity-70"
              >Alguma observação?</label
            >
            <textarea
              :value="observation"
              @input="emit('update:observation', $event.target.value)"
              placeholder="Ex: Tirar cebola..."
              rows="2"
              class="w-full border rounded p-4 focus:outline-none transition-all resize-none adaptive-placeholder"
              :style="{
                color: theme.textColor,
                backgroundColor: theme.adaptiveInputBg,
                borderColor: theme.adaptiveBorder,
                '--ph': theme.adaptivePlaceholder,
              }"
            />
          </div>

          <div
            class="flex items-center justify-between p-5 rounded border"
            :style="{
              backgroundColor: theme.adaptiveInputBg,
              borderColor: theme.adaptiveBorder,
            }"
          >
            <span class="font-bold text-lg">Quantidade</span>
            <div class="flex items-center gap-5">
              <button
                @click="emit('update:quantity', Math.max(1, quantity - 1))"
                :disabled="quantity <= 1"
                class="w-12 h-12 rounded flex items-center justify-center transition-all shadow-sm disabled:opacity-30 disabled:cursor-not-allowed"
                :class="quantity > 1 ? 'active:scale-95' : ''"
                :style="{
                  backgroundColor: theme.adaptiveButtonBg,
                  color: theme.textColor,
                }"
              >
                <Minus :size="20" />
              </button>
              <span class="font-black text-2xl w-8 text-center">{{
                quantity
              }}</span>
              <button
                @click="emit('update:quantity', quantity + 1)"
                class="w-12 h-12 rounded flex items-center justify-center transition-all active:scale-95 shadow-sm"
                :style="{
                  backgroundColor: theme.adaptiveButtonBg,
                  color: theme.textColor,
                }"
              >
                <Plus :size="20" />
              </button>
            </div>
          </div>
        </div>

        <div
          class="p-6 shrink-0"
          :style="{ borderTop: `1px solid ${theme.adaptiveBorder}` }"
        >
          <button
            @click="emit('add')"
            :disabled="!selectedSize"
            :style="{
              backgroundColor: theme.buttonColor,
              color: theme.buttonTextColor,
            }"
            class="w-full py-5 font-black rounded shadow-xl transition-transform active:scale-95 flex items-center justify-between px-8 text-lg disabled:opacity-50"
          >
            <span>{{
              selectedSize ? "Adicionar" : "Selecione um tamanho"
            }}</span>
            <span>{{ formatCurrency(total) }}</span>
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
  .adaptive-placeholder::placeholder {
    color: var(--ph, rgba(0, 0, 0, 0.35));
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
