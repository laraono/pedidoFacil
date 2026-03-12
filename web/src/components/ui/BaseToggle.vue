<script setup>
defineProps({
  label: String,
  modelValue: Boolean,
  description: String
});

const emit = defineEmits(['update:modelValue']);
</script>

<template>
  <div class="flex items-center justify-between p-2">
    <div>
      <label v-if="label" class="block text-sm font-bold text-gray-700">{{ label }}</label>
      <span v-if="description" class="text-xs text-gray-500">{{ description }}</span>
    </div>
    
    <button
      type="button"
      @click="emit('update:modelValue', !modelValue)"
      class="relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none"
      :class="modelValue ? 'bg-green-500' : 'bg-gray-300'"
    >
      <span
        class="inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300"
        :class="modelValue ? 'translate-x-6' : 'translate-x-1'"
      />
    </button>
  </div>
</template>