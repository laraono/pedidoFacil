<script setup>
defineProps({
  modelValue: [String, Number],
  label: String,
  type: { type: String, default: 'text' },
  placeholder: String,
  error: String,
  icon: [Object, Function],
  dark: { type: Boolean, default: false } // Modo escuro para Login/Landing
});
defineEmits(['update:modelValue']);
</script>

<template>
  <div class="relative w-full flex flex-col gap-1 text-left">
    <label v-if="label" :class="dark ? 'text-gray-400' : 'text-gray-700'" class="text-xs font-bold ml-2 uppercase tracking-widest">
      {{ label }}
    </label>
    
    <div class="relative group">
      <div v-if="icon" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-green transition-colors z-10">
        <component :is="icon" class="w-5 h-5" />
      </div>
      
      <input
        :type="type"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        :placeholder="placeholder"
        :class="[
          'w-full p-4 rounded-2xl border transition-all duration-300 focus:outline-none',
          icon ? 'pl-12' : 'pl-4',
          dark
            ? 'bg-white/5 border-white/10 text-white placeholder-gray-600 focus:border-brand-green/50 focus:bg-white/10 focus:shadow-[0_0_30px_rgba(0,210,106,0.1)]'
            : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500',
          error ? 'border-red-500' : ''
        ]"
      />
      <slot name="suffix"></slot>
    </div>
    
    <p v-if="error" class="text-red-500 text-xs mt-1 ml-2">{{ error }}</p>
  </div>
</template>