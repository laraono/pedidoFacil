<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[99999]"
    >
      <div
        class="bg-white border border-[#E0E0E0] rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
      >
        <div class="p-8 flex flex-col items-center gap-4">
          <div class="p-4 bg-accent-light rounded-full border border-accent/20">
            <Printer :size="32" class="text-accent" />
          </div>
          <h2
            class="text-xl font-black text-[#212121] uppercase tracking-tight text-center"
          >
            Deseja imprimir o cupom fiscal?
          </h2>
          <p
            class="text-[#757575] text-xs text-center font-bold uppercase tracking-widest"
          >
            Um comprovante será aberto para impressão
          </p>
        </div>
        <div class="flex border-t border-[#E0E0E0]">
          <button
            @click="$emit('close')"
            class="flex-1 py-4 text-[#757575] font-black uppercase tracking-widest text-xs hover:bg-gray-50 transition-all border-r border-[#E0E0E0]"
          >
            Não
          </button>
          <button
            @click="$emit('print')"
            class="flex-1 py-4 text-primary font-black uppercase tracking-widest text-xs hover:bg-accent-light transition-all flex items-center justify-center gap-2"
          >
            <Printer :size="16" /> Imprimir
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
  import { Printer } from "lucide-vue-next";
  defineProps({ isOpen: Boolean });
  defineEmits(["close", "print"]);
</script>
