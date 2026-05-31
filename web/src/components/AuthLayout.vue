<script setup>
import LandingHeader from '@/components/LandingHeader.vue'
import imgOndas from '@/assets/ondas.png'

defineProps({
  contentClass: {
    type: String,
    default: 'p-4',
  },
})
</script>

<template>
  <div class="min-h-screen bg-page font-inter flex flex-col">
    <LandingHeader />
    <div
      class="flex-1 relative flex flex-col items-center justify-center"
      :class="contentClass"
    >
      <div
        class="absolute top-0 left-0 w-full h-full z-0 pointer-events-none opacity-40"
        :style="{ backgroundImage: `url(${imgOndas})`, backgroundSize: 'cover', backgroundPosition: 'center' }"
      />
      <slot />
    </div>
  </div>
</template>