<script setup>
import { useRouter } from 'vue-router';
import { ArrowLeft } from 'lucide-vue-next';

const router = useRouter();
defineProps({
  title: String,
  subtitle: String,
});
</script>

<template>
  <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
    <div>
      <h1 class="text-3xl font-black text-white tracking-tight">{{ title }}</h1>
      <p v-if="subtitle" class="text-gray-400 text-sm mt-1">{{ subtitle }}</p>
    </div>
    <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
      <slot name="actions"></slot>
    </div>
  </div>
</template>
