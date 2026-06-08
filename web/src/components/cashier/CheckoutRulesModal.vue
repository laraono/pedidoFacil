<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      style="z-index: 99999"
    >
      <div
        class="bg-white border border-[#E0E0E0] rounded p-8 w-full max-w-md shadow-2xl"
      >
        <div class="flex items-start gap-4 mb-6">
          <div
            class="p-3 rounded-full border shrink-0"
            :class="
              pendingCancel
                ? 'bg-danger-light border-danger'
                : 'bg-yellow-500/10 border-yellow-500/20'
            "
          >
            <AlertTriangle
              :size="24"
              :class="pendingCancel ? 'text-danger' : 'text-yellow-500'"
            />
          </div>
          <div>
            <p class="text-[#212121] font-bold text-sm leading-relaxed">
              {{ message }}
            </p>
          </div>
        </div>
        <div v-if="pendingCancel" class="mb-6">
          <label
            class="block text-[10px] font-black text-[#757575] uppercase tracking-widest mb-2"
            >Motivo do Cancelamento <span class="text-danger">*</span></label
          >
          <select
            v-model="cancelReason"
            class="w-full bg-gray-50 border border-[#E0E0E0] rounded px-4 py-3 text-sm text-[#212121] outline-none focus:border-danger transition-all cursor-pointer"
          >
            <option value="" disabled>Selecione o motivo...</option>
            <option value="Demora no preparo">Demora no preparo</option>
            <option value="Pedido errado / Erro do Garçom">
              Pedido errado / Erro do Garçom
            </option>
            <option value="Desistência / Cliente foi embora">
              Desistência / Cliente foi embora
            </option>
          </select>
        </div>
        <div class="flex gap-3">
          <button
            @click="$emit('close')"
            class="flex-1 px-6 py-3 bg-white border border-[#E0E0E0] text-[#757575] font-black uppercase tracking-widest text-xs rounded hover:bg-gray-100 transition-all"
          >
            Voltar
          </button>
          <button
            @click="confirm"
            :disabled="pendingCancel && !cancelReason.trim()"
            class="flex-1 px-6 py-3 font-black uppercase tracking-widest text-xs rounded transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            :class="
              pendingCancel
                ? 'bg-danger text-white hover:bg-red-400'
                : 'bg-primary text-white hover:bg-primary-dark'
            "
          >
            {{ pendingCancel ? "Cancelar Pedidos" : "Confirmar" }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
  import { ref, watch } from "vue";
  import { AlertTriangle } from "lucide-vue-next";

  const props = defineProps({
    isOpen: Boolean,
    pendingCancel: Boolean,
    message: String,
  });
  const emit = defineEmits(["close", "confirm"]);

  const cancelReason = ref("");

  watch(
    () => props.isOpen,
    (v) => {
      if (v) cancelReason.value = "";
    },
  );

  function confirm() {
    emit("confirm", props.pendingCancel ? cancelReason.value : null);
  }
</script>
