<script setup lang="ts">
import type { Component } from 'vue';
import BaseButton from './BaseButton.vue';

defineProps<{
  icon: Component;
  message: string;
  actionLabel?: string;
}>();

defineEmits<{ action: [] }>();
</script>

<template>
  <div class="py-20 text-center">
    <component :is="icon" :size="40" class="mx-auto mb-4 text-[#757575] opacity-30" />
    <p class="text-[#757575] font-bold">{{ message }}</p>
    <BaseButton v-if="actionLabel" class="mt-4" @click="$emit('action')">
      {{ actionLabel }}
    </BaseButton>
  </div>
</template>
