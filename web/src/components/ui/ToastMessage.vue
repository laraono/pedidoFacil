<template>
  <Teleport to="body">
    <div class="fixed top-6 right-4 z-[10000] flex flex-col gap-2">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="[
            'px-6 py-4 rounded shadow-2xl flex items-center gap-3 font-bold text-sm md:text-base text-white transform transition-all duration-300',
            toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'
          ]"
        >
          <component :is="toast.type === 'error' ? AlertCircle : CheckCircle" :size="20" />
          {{ toast.message }}
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { AlertCircle, CheckCircle } from 'lucide-vue-next';
import { useToast } from '@/composables/useToast';

const { toasts } = useToast();
</script>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from { opacity: 0; transform: translateX(30px); }
.toast-leave-to { opacity: 0; transform: translateY(-30px); }
</style>