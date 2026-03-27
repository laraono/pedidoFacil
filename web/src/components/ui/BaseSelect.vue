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
    <label v-if="label" class="text-xs font-black uppercase tracking-widest text-gray-300 ml-1">
      {{ label }}
    </label>

    <div class="relative group">
      <select
        :value="modelValue"
        :disabled="disabled"
        @change="emit('update:modelValue', $event.target.value)"
        class="w-full py-3.5 pl-4 pr-10 rounded-2xl border font-inter font-medium text-sm
               bg-white/5 border-white/10 text-white
               focus:outline-none focus:border-brand-green/50 focus:bg-white/10
               transition-all duration-300 appearance-none cursor-pointer"
        :class="[
          error    ? '!border-red-500 !bg-red-500/5' : '',
          disabled ? 'opacity-50 cursor-not-allowed' : '',
        ]"
      >
        <option value="" disabled class="bg-zinc-900 text-gray-400">{{ placeholder }}</option>
        <option
          v-for="opt in options"
          :key="opt.value"
          :value="opt.value"
          class="bg-zinc-900 text-white font-inter"
        >
          {{ opt.label }}
        </option>
      </select>

      <!-- Chevron customizado -->
      <div class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2
                  text-gray-500 group-focus-within:text-brand-green transition-colors">
        <ChevronDown :size="16" />
      </div>
    </div>

    <p v-if="error" class="text-red-400 text-[11px] font-bold ml-1 flex items-center gap-1 mt-0.5">
      {{ error }}
    </p>
  </div>
</template>
