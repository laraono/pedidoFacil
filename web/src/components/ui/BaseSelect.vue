<script setup>
import { ChevronDown } from 'lucide-vue-next';

defineProps({
  label: String,
  modelValue: [String, Number],
  options: Array, // [{ label: 'Opção 1', value: 1 }]
  error: String,
  placeholder: { type: String, default: 'Selecione uma opção' }
});

const emit = defineEmits(['update:modelValue']);
</script>

<template>
  <div class="space-y-2 w-full text-left">
    <label v-if="label" class="text-sm font-medium text-gray-700 ml-2">{{ label }}</label>
    
    <div class="relative">
      <select
        :value="modelValue"
        @change="emit('update:modelValue', $event.target.value)"
        class="w-full p-4 bg-white rounded-2xl border border-gray-300 text-gray-900 focus:outline-none focus:border-blue-500 transition-all resize-none"
        :class="{ 'border-red-500': error }"
      >
        <option value="" disabled selected>{{ placeholder }}</option>
        <option v-for="opt in options" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>
    </div>
    <p v-if="error" class="text-red-500 text-xs mt-1 ml-2">{{ error }}</p>
  </div>
</template>