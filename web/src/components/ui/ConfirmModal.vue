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
      <div v-if="confirmModal.show" class="fixed inset-0 bg-black/50  z-[120] flex items-center justify-center p-4">
        <div class="bg-white border border-[#E0E0E0] w-full max-w-sm rounded p-8 shadow-2xl">
          <div class="flex items-start gap-4 mb-6">
            <div class="p-3 rounded border shrink-0"
              :class="confirmModal.isError ? 'bg-blue-500/10 border-blue-500/20' : 'bg-danger-light border-danger'">
              <component :is="confirmModal.isError ? Info : AlertTriangle"
                :size="20"
                :class="confirmModal.isError ? 'text-blue-400' : 'text-danger'" />
            </div>
            <div>
              <p class="text-[#212121] font-black text-base">{{ confirmModal.title }}</p>
              <p class="text-[#757575] text-sm mt-1">{{ confirmModal.message }}</p>
            </div>
          </div>
          <div class="flex gap-3">
            <button
              v-if="!confirmModal.isError"
              @click="closeConfirm"
              class="flex-1 py-3 rounded text-[#757575] font-bold hover:bg-gray-50 transition-colors border border-[#E0E0E0]"
            >
              Cancelar
            </button>
            <button
              @click="handleConfirm"
              class="flex-1 py-3 rounded font-black transition-colors"
              :class="confirmModal.isError ? 'bg-primary text-white hover:bg-primary-dark' : 'bg-danger text-white hover:bg-red-400'"
            >
              {{ confirmModal.isError ? 'Entendi' : 'Confirmar' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
