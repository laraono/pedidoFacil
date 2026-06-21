<script setup>
  import { ref } from "vue";
  import { X, ChefHat } from "lucide-vue-next";

  const props = defineProps({
    comandas: { type: Array, default: () => [] },
    comandaUnitLabel: { type: String, default: "Comanda" },
    isSubmitting: Boolean,
    theme: { type: Object, required: true },
  });

  const emit = defineEmits(["close", "confirm"]);

  const selectedComandaId = ref(null);
  const newComandaNumber = ref("");

  function handleConfirm() {
    if (!selectedComandaId.value) return;
    if (selectedComandaId.value === "new" && !newComandaNumber.value.trim())
      return;
    emit("confirm", selectedComandaId.value, newComandaNumber.value.trim());
  }

  function reset() {
    selectedComandaId.value = null;
    newComandaNumber.value = "";
  }

  defineExpose({ reset });
</script>

<template>
  <Transition
    enter-active-class="transition duration-300"
    enter-from-class="opacity-0"
    leave-active-class="transition duration-200"
    leave-to-class="opacity-0"
  >
    <div
      class="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <div
        class="w-full sm:max-w-md rounded-t sm:rounded overflow-hidden flex flex-col max-h-[85vh] shadow-2xl animate-slideUp sm:animate-none"
        :style="{
          backgroundColor: theme.cardBg,
          fontFamily: theme.fontFamily,
          color: theme.textColor,
        }"
      >
        <div
          class="p-6 flex justify-between items-center shrink-0"
          :style="{ borderBottom: `1px solid ${theme.adaptiveBorder}` }"
        >
          <h3 class="font-black text-2xl">Vincular Comanda</h3>
          <button
            @click="emit('close')"
            class="p-2 rounded transition-colors"
            :style="{
              backgroundColor: theme.adaptiveButtonBg,
              color: theme.textColor,
            }"
          >
            <X :size="24" />
          </button>
        </div>

        <div
          class="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-5"
          :style="{ backgroundColor: theme.adaptiveSubtleBg }"
        >
          <div v-if="comandas.length > 0">
            <p
              class="text-xs font-black uppercase tracking-widest opacity-60 mb-3"
            >
              Abertas
            </p>
            <div class="space-y-2">
              <button
                v-for="comanda in comandas"
                :key="comanda.id"
                @click="selectedComandaId = comanda.id"
                class="w-full p-4 rounded border-2 text-left transition-all flex justify-between items-center"
                :style="
                  selectedComandaId === comanda.id
                    ? {
                        borderColor: theme.buttonColor,
                        backgroundColor: theme.buttonColor + '22',
                      }
                    : {
                        borderColor: theme.adaptiveBorder,
                        backgroundColor: theme.adaptiveInputBg,
                      }
                "
              >
                <span class="font-black text-base">{{ comanda.label }}</span>
                <span class="text-xs opacity-60 font-bold"
                  >{{ comanda.orders?.length || 0 }} pedido(s)</span
                >
              </button>
            </div>
          </div>

          <div>
            <p
              class="text-xs font-black uppercase tracking-widest opacity-60 mb-3"
            >
               {{ comandaUnitLabel }}
            </p>
            <div
              class="rounded border-2 transition-all overflow-hidden"
              :style="
                selectedComandaId === 'new'
                  ? {
                      borderColor: theme.buttonColor,
                      backgroundColor: theme.buttonColor + '22',
                    }
                  : {
                      borderColor: theme.adaptiveBorder,
                      backgroundColor: theme.adaptiveInputBg,
                    }
              "
            >
              <button
                @click="selectedComandaId = 'new'"
                class="w-full p-4 text-left font-black text-base transition-all"
                :style="{ color: theme.textColor }"
              >
                + Criar {{ comandaUnitLabel }}
              </button>
              <div
                v-if="selectedComandaId === 'new'"
                class="px-4 pb-4 flex flex-col gap-2"
              >
                <div class="flex items-center gap-3">
                  <span
                    class="font-bold text-sm shrink-0"
                    :style="{ color: theme.textColor }"
                    >{{ comandaUnitLabel }}</span
                  >
                  <input
                    v-model="newComandaNumber"
                    type="text"
                    placeholder="Número ou nome..."
                    maxlength="10"
                    class="flex-1 border rounded px-3 py-2 font-bold text-sm outline-none adaptive-placeholder"
                    :style="{
                      color: theme.textColor,
                      backgroundColor: theme.adaptiveInputBg,
                      borderColor: theme.adaptiveBorder,
                      '--ph': theme.adaptivePlaceholder,
                    }"
                  />
                </div>
                <button
                  type="button"
                  @click="
                    newComandaNumber = String(
                      Math.floor(Math.random() * 900) + 100,
                    )
                  "
                  class="w-full py-2 rounded text-xs font-black uppercase tracking-widest transition-all text-center"
                  :style="{
                    backgroundColor: theme.adaptiveButtonBg,
                    color: theme.textColor,
                  }"
                >
                  # Número Aleatório
                </button>
              </div>
            </div>
          </div>
        </div>

        <div
          class="p-5 shrink-0"
          :style="{ borderTop: `1px solid ${theme.adaptiveBorder}` }"
        >
          <button
            @click="handleConfirm"
            :disabled="
              !selectedComandaId ||
              (selectedComandaId === 'new' && !newComandaNumber.trim()) ||
              isSubmitting
            "
            :style="{
              backgroundColor: theme.buttonColor,
              color: theme.buttonTextColor,
            }"
            class="w-full py-5 font-black rounded shadow-xl transition-transform active:scale-95 flex justify-center items-center gap-2 text-lg disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChefHat v-if="!isSubmitting" :size="20" />
            <span
              v-if="isSubmitting"
              class="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"
            />
            <span>{{
              isSubmitting ? "Enviando..." : "Confirmar e Enviar"
            }}</span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(156, 163, 175, 0.5);
    border-radius: 10px;
  }
  .adaptive-placeholder::placeholder {
    color: var(--ph, rgba(0, 0, 0, 0.35));
  }
  @keyframes slideUp {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  .animate-slideUp {
    animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
</style>
