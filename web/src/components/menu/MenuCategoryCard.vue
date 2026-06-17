<script setup>
import { getImageUrl } from "@/utils/imageUrl";

const props = defineProps({
  category:      { type: Object,  required: true },
  isActive:      { type: Boolean, default: false },
  categoryColor: { type: String,  required: true },
  textColor:     { type: String,  required: true },
  variant:       { type: String,  default: "desktop" }, // 'mobile' | 'desktop'
});

defineEmits(["click"]);
</script>

<template>
  <button
    class="relative flex overflow-hidden rounded-xl transition-all group"
    :class="[
      variant === 'mobile'
        ? ['shrink-0 shadow-md active:scale-95', category.image ? 'w-36 h-28 items-end' : 'h-12 px-5 items-center']
        : ['w-full text-left shadow-sm', isActive ? 'shadow-lg scale-[1.02] z-10' : 'hover:scale-[1.02] hover:bg-white/5',
           category.image ? 'h-24 items-end p-4' : 'p-3 items-center'],
      !category.image && !isActive ? 'bg-white/10' : '',
    ]"
    :style="!category.image
      ? isActive
        ? { backgroundColor: categoryColor, color: '#ffffff' }
        : { color: textColor }
      : {}"
    @click="$emit('click')"
  >
    <template v-if="category.image">
      <div
        class="absolute inset-0 bg-cover bg-center transition-transform duration-500"
        :class="variant === 'desktop' && 'group-hover:scale-110'"
        :style="{ backgroundImage: `url(${getImageUrl(category.image)})` }"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      <div
        class="absolute inset-0 transition-opacity duration-200"
        :style="{ backgroundColor: categoryColor, opacity: isActive ? 0.55 : 0 }"
      />
      <div v-if="isActive" class="absolute inset-0 rounded-xl border-2" :style="{ borderColor: categoryColor }" />
    </template>

    <span
      class="relative z-10 font-bold leading-tight truncate"
      :class="[
        category.image ? 'text-white drop-shadow' : '',
        variant === 'mobile'
          ? category.image ? 'text-sm px-2 pb-2 max-w-[130px]' : 'text-base'
          : 'text-sm w-full tracking-wide',
      ]"
    >
      {{ category.name }}
    </span>
  </button>
</template>
