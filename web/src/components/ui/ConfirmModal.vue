<script setup>
import { AlertTriangle, Info } from 'lucide-vue-next';

const props = defineProps({
  confirmModal: { type: Object, required: true }
});
const emit = defineEmits(['close']);

const closeConfirm = () => { emit('close'); };
const handleConfirm = () => {
  if (props.confirmModal.onConfirm) {
    props.confirmModal.onConfirm(props.confirmModal.data);
  }
  closeConfirm();
};
</script>

<template>
  <Teleport to="body">
    <Transition enter-active-class="transition duration-200" enter-from-class="opacity-0" leave-active-class="transition duration-150" leave-to-class="opacity-0">
      <div v-if="confirmModal.show" class="fixed inset-0 bg-black/80 backdrop-blur-md z-[120] flex items-center justify-center p-4">
        <div class="bg-dark-card border border-white/10 w-full max-w-sm rounded-[2rem] p-8 shadow-2xl">
          <div class="flex items-start gap-4 mb-6">
            <div class="p-3 rounded-2xl border shrink-0"
              :class="confirmModal.isError ? 'bg-blue-500/10 border-blue-500/20' : 'bg-red-500/10 border-red-500/20'">
              <component :is="confirmModal.isError ? Info : AlertTriangle"
                :size="20"
                :class="confirmModal.isError ? 'text-blue-400' : 'text-red-400'" />
            </div>
            <div>
              <p class="text-white font-black text-base">{{ confirmModal.title }}</p>
              <p class="text-gray-400 text-sm mt-1">{{ confirmModal.message }}</p>
            </div>
          </div>
          <div class="flex gap-3">
            <button
              v-if="!confirmModal.isError"
              @click="closeConfirm"
              class="flex-1 py-3 rounded-2xl text-gray-400 font-bold hover:bg-white/5 transition-colors border border-white/10"
            >
              Cancelar
            </button>
            <button
              @click="handleConfirm"
              class="flex-1 py-3 rounded-2xl font-black transition-colors"
              :class="confirmModal.isError ? 'bg-blue-500 text-white hover:bg-blue-400' : 'bg-red-500 text-white hover:bg-red-400'"
            >
              {{ confirmModal.isError ? 'Entendi' : 'Confirmar' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
