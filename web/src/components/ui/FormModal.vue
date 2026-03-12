<script setup>
import { X } from 'lucide-vue-next';

defineProps({
  show: Boolean,
  title: String,
  size: { type: String, default: 'md' } // sm, md, lg
});

const emit = defineEmits(['close', 'save']);

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl'
};
</script>

<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-xl shadow-2xl w-full overflow-hidden" :class="sizeClasses[size]">
      <div class="p-6 border-b border-gray-100 flex justify-between items-center">
        <h2 class="text-xl font-bold text-gray-800">{{ title }}</h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
          <X :size="24" />
        </button>
      </div>

      <div class="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
        <slot></slot>
      </div>

      <div class="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
        <button
          type="button"
          @click="$emit('close')"
          class="px-4 py-2 text-gray-600 font-semibold hover:bg-gray-200 rounded-lg transition-colors"
        >
          Cancelar
        </button>
        <button
          type="button"
          @click="$emit('save')"
          class="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
        >
          Salvar
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
</style>