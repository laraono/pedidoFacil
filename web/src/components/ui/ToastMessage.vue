<script setup>
import { useToastStore } from '@/stores/toast';
import { CheckCircle2, AlertCircle, X } from 'lucide-vue-next';

const toast = useToastStore();
</script>

<template>
  <Transition
    enter-active-class="transition duration-500 ease-out"
    enter-from-class="-translate-y-24 opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition duration-400 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="-translate-y-24 opacity-0"
  >
    <div v-if="toast.isVisible" 
         class="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-md px-4 pointer-events-none">
      <div :class="[
        'pointer-events-auto px-6 py-4 rounded-2xl shadow-2xl border flex items-center justify-between gap-3 backdrop-blur-md',
        toast.type === 'error' ? 'bg-red-500/90 border-red-400 text-white' : 'bg-brand-green/90 border-brand-green/20 text-black'
      ]">
        <div class="flex items-center gap-3">
          <AlertCircle v-if="toast.type === 'error'" :size="20" />
          <CheckCircle2 v-else :size="20" />
          <span class="font-bold text-sm">{{ toast.message }}</span>
        </div>
        
        <button @click="toast.isVisible = false" class="opacity-50 hover:opacity-100 transition-opacity">
          <X :size="18" />
        </button>
      </div>
    </div>
  </Transition>
</template>