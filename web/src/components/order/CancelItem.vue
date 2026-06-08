<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      style="z-index: 99999"
    >
      <div
        class="bg-white border border-danger rounded p-8 w-full max-w-md shadow-2xl"
      >
        <div class="flex items-start gap-4 mb-6">
          <div
            class="p-3 bg-danger-light rounded-full border border-danger shrink-0"
          >
            <AlertTriangle :size="24" class="text-danger" />
          </div>
          <div>
            <p class="text-[#212121] font-black text-base mb-1">{{ title }}</p>
            <p class="text-[#757575] text-sm leading-relaxed">
              {{ description }}
            </p>
          </div>
        </div>

        <label
          class="block text-[10px] font-black text-[#757575] uppercase tracking-widest mb-2"
        >
          Motivo do Cancelamento <span class="text-danger">*</span>
        </label>

        <select
          v-model="selectedReason"
          class="w-full bg-gray-50 border border-[#E0E0E0] rounded px-4 py-3 text-sm text-[#212121] outline-none focus:border-danger mb-6 cursor-pointer"
        >
          <option value="" disabled>Selecione o motivo...</option>
          <option v-for="reason in reasons" :key="reason" :value="reason">
            {{ reason }}
          </option>
        </select>

        <div class="flex gap-3">
          <button
            @click="closeModal"
            class="flex-1 px-6 py-3 bg-white border border-[#E0E0E0] text-[#757575] font-black uppercase tracking-widest text-xs rounded hover:bg-gray-50 transition-all"
          >
            Voltar
          </button>
          <button
            @click="confirmCancel"
            :disabled="!selectedReason.trim()"
            class="flex-1 px-6 py-3 bg-danger text-white font-black uppercase tracking-widest text-xs rounded hover:bg-red-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Confirmar
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
    isOpen: { type: Boolean, required: true },
    title: { type: String, default: "Cancelar" },
    description: { type: String, default: "Informe o motivo do cancelamento." },
    reasons: {
      type: Array,
      default: () => [
        "Demora no preparo",
        "Pedido errado",
        "Desistência / Cliente foi embora",
        "Outros",
      ],
    },
  });

  const emit = defineEmits(["close", "confirm"]);

  const selectedReason = ref("");

  watch(
    () => props.isOpen,
    (newVal) => {
      if (newVal) selectedReason.value = "";
    },
  );

  const closeModal = () => emit("close");
  const confirmCancel = () => emit("confirm", selectedReason.value);
</script>
