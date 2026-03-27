<script setup>
defineProps({
  modelValue: [String, Number],
  label: String,
  type: { type: String, default: 'text' },
  placeholder: String,
  error: String,
  icon: [Object, Function],
  maxlength: [String, Number],
  disabled: Boolean,
  dark: { type: Boolean, default: true },
});
defineEmits(['update:modelValue', 'blur', 'input']);
</script>

<template>
  <div class="relative w-full flex flex-col gap-1 text-left">
    <label v-if="label" class="text-xs font-black uppercase tracking-widest ml-1"
      :class="dark ? 'text-gray-300' : 'text-gray-700'">
      {{ label }}
    </label>

    <div class="relative group">
      <div v-if="icon" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-green transition-colors z-10">
        <component :is="icon" class="w-5 h-5" />
      </div>

      <input
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :maxlength="maxlength"
        :disabled="disabled"
        @input="$emit('update:modelValue', $event.target.value); $emit('input', $event)"
        @blur="$emit('blur', $event)"
        :class="[
          'w-full py-3.5 px-4 rounded-2xl border transition-all duration-300 focus:outline-none',
          icon ? 'pl-12' : 'pl-4',
          dark
            ? 'bg-white/5 border-white/10 text-white placeholder-gray-600 focus:border-brand-green/50 focus:bg-white/10'
            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-brand-green/50',
          error ? '!border-red-500 !bg-red-500/5' : '',
          disabled ? 'opacity-50 cursor-not-allowed' : '',
        ]"
      />
      <slot name="suffix"></slot>
    </div>

    <p v-if="error" class="text-red-400 text-[11px] font-bold ml-1 flex items-center gap-1 mt-0.5">
      {{ error }}
    </p>
  </div>
</template>
