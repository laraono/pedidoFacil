<script setup>
import { getImageUrl } from "@/utils/imageUrl";
import { useUtils } from "@/composables/useUtils";
import { Utensils, Plus } from "lucide-vue-next";

const { formatCurrency } = useUtils();

const props = defineProps({
  product: { type: Object, required: true },
  theme:   { type: Object, required: true },
  variant: { type: String, default: "grid" }, // 'list' | 'grid'
});

defineEmits(["click"]);

function minPrice(product) {
  return product.sizes?.length
    ? Math.min(...product.sizes.map(s => s.price))
    : (product.price ?? 0);
}
</script>

<template>
  <div
    v-if="variant === 'list'"
    class="flex items-center gap-4 p-3 rounded-xl cursor-pointer active:scale-[0.98] transition-all shadow-sm"
    :style="{ backgroundColor: theme.cardBg }"
    @click="$emit('click')"
  >
    <div
      v-if="product.image"
      class="w-24 h-24 rounded-lg shrink-0 bg-cover bg-center shadow-sm"
      :style="{ backgroundImage: `url(${getImageUrl(product.image)})` }"
    />
    <div v-else class="w-24 h-24 rounded-lg shrink-0 flex items-center justify-center opacity-20 bg-white/5">
      <Utensils :size="28" :style="{ color: theme.textColor }" />
    </div>

    <div class="flex-1 min-w-0">
      <h3 class="font-bold text-lg leading-tight" :style="{ color: theme.textColor }">{{ product.name }}</h3>
      <p v-if="product.description" class="text-sm opacity-60 line-clamp-2 mt-1" :style="{ color: theme.textColor }">
        {{ product.description }}
      </p>
      <div class="flex items-baseline gap-1 mt-2">
        <span v-if="product.sizes?.length > 1" class="text-[10px] opacity-60 uppercase tracking-widest font-bold" :style="{ color: theme.textColor }">
          a partir de
        </span>
        <span class="font-black text-xl" :style="{ color: theme.buttonColor }">
          {{ formatCurrency(minPrice(product)) }}
        </span>
      </div>
    </div>

    <div
      class="w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-md transition-transform active:scale-90"
      :style="{ backgroundColor: theme.buttonColor, color: theme.buttonTextColor }"
    >
      <Plus :size="24" />
    </div>
  </div>

  <div
    v-else
    class="rounded-lg p-5 shadow-xl cursor-pointer hover:-translate-y-1 transition-all duration-300 flex flex-col border border-white/5 group relative overflow-hidden"
    :style="{ backgroundColor: theme.cardBg }"
    @click="$emit('click')"
  >
    <div
      v-if="product.image"
      class="w-full h-44 rounded-md mb-4 bg-cover bg-center shadow-inner"
      :style="{ backgroundImage: `url(${getImageUrl(product.image)})` }"
    />

    <div class="flex-1 z-10">
      <h3 class="font-bold text-lg mb-1 leading-tight" :style="{ color: theme.textColor }">{{ product.name }}</h3>
      <p class="text-sm opacity-70 line-clamp-2" :style="{ color: theme.textColor }">{{ product.description }}</p>
    </div>

    <div class="flex items-center justify-between mt-5 pt-4 border-t border-white/5 z-10">
      <div class="flex flex-col">
        <span v-if="product.sizes?.length > 1" class="text-[10px] opacity-70 uppercase tracking-widest font-bold mb-0.5" :style="{ color: theme.textColor }">
          A partir de
        </span>
        <span class="font-black text-xl" :style="{ color: theme.buttonColor }">
          {{ formatCurrency(minPrice(product)) }}
        </span>
      </div>
      <div
        class="w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg"
        :style="{ backgroundColor: theme.buttonColor, color: theme.buttonTextColor }"
      >
        <Plus :size="20" />
      </div>
    </div>
  </div>
</template>