<script setup>
  import { useRouter } from "vue-router";
  import { ArrowRight } from "lucide-vue-next";

  const props = defineProps({
    cardProps: { type: Object, required: true },
  });
  const router = useRouter();
</script>

<template>
  <div
    @click="router.push(cardProps.route)"
    class="group bg-white border border-[#E0E0E0] rounded p-6 sm:p-8 cursor-pointer hover:border-accent/50 hover: hover:-translate-y-1 transition-all duration-300 flex flex-col h-full relative overflow-hidden"
  >
    <div
      class="bg-gray-50 p-4 rounded w-fit mb-6 group-hover:bg-primary-dark/10 transition-colors"
    >
      <component :is="cardProps.icon" class="w-8 h-8 text-accent" />
    </div>

    <h3 class="text-xl sm:text-2xl font-black text-[#212121] mb-3">
      {{ cardProps.name }}
    </h3>
    <p class="text-[#757575] text-sm sm:text-base leading-relaxed flex-1 mb-8">
      {{ cardProps.description }}
    </p>

    <div
      class="flex items-center gap-2 text-accent font-bold text-sm sm:text-base mt-auto group-hover:translate-x-2 transition-transform"
    >
      {{ cardProps.callToAction || "Acessar módulo" }}
      <ArrowRight class="w-4 h-4" />
    </div>
  </div>
</template>
