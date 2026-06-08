<script setup>
  defineProps({
    label: String,
    modelValue: String,
    placeholder: String,
    rows: { type: Number, default: 3 },
    error: String,
  });

  const emit = defineEmits(["update:modelValue"]);
</script>

<template>
  <div class="space-y-2 w-full text-left">
    <label v-if="label" class="text-sm font-medium text-[#757575] ml-2">{{
      label
    }}</label>
    <textarea
      :value="modelValue"
      @input="emit('update:modelValue', $event.target.value)"
      :rows="rows"
      :placeholder="placeholder"
      class="w-full p-4 bg-white rounded border border-gray-300 text-[#212121] focus:outline-none focus:border-blue-500 transition-all resize-none"
      :class="{ 'border-red-500': error }"
    ></textarea>
    <p v-if="error" class="text-red-500 text-xs mt-1 ml-2">{{ error }}</p>
  </div>
</template>
