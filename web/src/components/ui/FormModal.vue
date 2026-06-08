<script setup>
  import { X } from "lucide-vue-next";
  import BaseButton from "./BaseButton.vue";

  defineProps({
    show: Boolean,
    title: String,
    size: { type: String, default: "md" },
    isLoading: Boolean,
    saveLabel: { type: String, default: "Salvar" },
    hideSave: Boolean,
    saveDisabled: Boolean,
  });

  const emit = defineEmits(["close", "save"]);

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
  };
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="show"
        class="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
      >
        <div
          class="bg-white border border-[#E0E0E0] w-full rounded flex flex-col shadow-2xl overflow-hidden"
          :class="sizeClasses[size]"
        >
          <header
            class="p-8 border-b border-[#E0E0E0] flex justify-between items-center bg-gray-50"
          >
            <h2 class="text-2xl font-black text-[#212121]">{{ title }}</h2>
            <button
              @click="$emit('close')"
              class="p-2 text-[#757575] hover:text-[#212121] transition-colors rounded hover:bg-gray-100"
            >
              <X :size="24" />
            </button>
          </header>

          <div class="p-8 overflow-y-auto max-h-[65vh] custom-scrollbar">
            <slot></slot>
          </div>

          <footer
            class="p-8 border-t border-[#E0E0E0] bg-gray-50 flex justify-end gap-4"
          >
            <slot name="footer-actions" />
            <BaseButton variant="ghost" type="button" @click="$emit('close')"
              >Cancelar</BaseButton
            >
            <BaseButton
              v-if="!hideSave"
              variant="primary"
              type="button"
              :isLoading="isLoading"
              :disabled="saveDisabled"
              @click="$emit('save')"
            >
              {{ saveLabel }}
            </BaseButton>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.2s ease;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #e0e0e0;
    border-radius: 10px;
  }
</style>
