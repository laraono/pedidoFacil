<script setup>
import { useRouter } from 'vue-router';
import { ArrowLeft } from 'lucide-vue-next';

const router = useRouter();
defineProps({ title: String });
</script>

<template>
  <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
    <div class="flex items-center">
      <button @click="router.back()" class="p-2 text-gray-500 hover:text-gray-800 mr-4 transition-colors">
        <ArrowLeft :size="30" />
      </button>
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">{{ title }}</h1>
      <slot name="title-suffix"></slot>
    </div>
    <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
      <slot name="actions"></slot>
    </div>
  </div>
</template>