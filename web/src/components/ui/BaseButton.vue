<script setup>
import { Loader2 } from 'lucide-vue-next';

defineProps({
  type: { type: String, default: 'button' },
  variant: { type: String, default: 'primary' }, 
  isLoading: Boolean,
  disabled: Boolean,
  icon: [Object, Function], // <--- A CORREÇÃO ESTÁ AQUI
  size: { type: String, default: 'md' }
});
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || isLoading"
    :class="[
      variant === 'primary' ? 'btn-primary' : '',
      variant === 'secondary' ? 'btn-secondary' : '',
      variant === 'brand' ? 'btn-brand' : '',
      variant === 'ghost' ? 'btn-ghost' : '',
      variant === 'danger' ? 'btn-danger' : '',
      size === 'lg' ? 'py-4 px-8 text-lg' : 'py-3 px-6 text-base',
      'transition-all'
    ]"
  >
    <Loader2 v-if="isLoading" class="w-5 h-5 animate-spin" />
    <span v-if="!isLoading" class="flex items-center justify-center gap-2 w-full">
      <slot></slot>
      <component :is="icon" v-if="icon" class="w-5 h-5" />
    </span>
  </button>
</template>