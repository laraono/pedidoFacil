<script setup>
import { ChevronDown } from 'lucide-vue-next';

defineProps({
  label:       { type: String,           default: undefined },
  modelValue:  { type: [String, Number], default: '' },
  options:     { type: Array,            default: () => [] },
  error:       { type: String,           default: undefined },
  placeholder: { type: String,           default: 'Selecione uma opção' },
  disabled:    { type: Boolean,          default: false },
});

const emit = defineEmits(['update:modelValue']);
</script>

<template>
  <div class="relative w-full flex flex-col gap-1 text-left">
    <label v-if="label" class="text-xs font-black uppercase tracking-widest text-[#757575] ml-1">
      {{ label }}
    </label>

    <div class="relative group">
      <select
        :value="modelValue"
        :disabled="disabled"
        @change="emit('update:modelValue', $event.target.value)"
        class="w-full py-3.5 pl-4 pr-10 rounded border font-inter font-medium text-sm
               bg-gray-50 border-[#E0E0E0] text-[#212121]
               focus:outline-none focus:border-primary/50 focus:bg-gray-100
               transition-all duration-300 appearance-none cursor-pointer"
        :class="[
          error    ? '!border-red-500 !bg-red-500/5' : '',
          disabled ? 'opacity-50 cursor-not-allowed' : '',
        ]"
      >
        <option value="" disabled class="bg-white text-[#757575]">{{ placeholder }}</option>
        <option
          v-for="opt in options"
          :key="opt.value"
          :value="opt.value"
          class="bg-white text-[#212121] font-inter"
        >
          {{ opt.label }}
        </option>
      </select>

      <!-- Chevron customizado -->
      <div class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2
                  text-[#757575] group-focus-within:text-accent transition-colors">
        <ChevronDown :size="16" />
      </div>
    </div>

    <p v-if="error" class="text-danger text-[11px] font-bold ml-1 flex items-center gap-1 mt-0.5">
      {{ error }}
    </p>
  </div>
</template>
