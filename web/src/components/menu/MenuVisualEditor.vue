<script setup>
import { Palette, ArrowLeft, X, CheckCircle2 } from "lucide-vue-next";
import { useRouter } from "vue-router";
import BaseButton from "@/components/ui/BaseButton.vue";
import BaseInput from "@/components/ui/BaseInput.vue";
import BaseSelect from "@/components/ui/BaseSelect.vue";

const props = defineProps({
  bgColor: String,
  textColor: String,
  cardBg: String,
  categoryColor: String,
  buttonColor: String,
  buttonTextColor: String,
  fontFamily: String,
  comandaUnitLabel: String,
  allowObservations: Boolean,
  isSaving: Boolean,
});

const emit = defineEmits([
  "update:bgColor",
  "update:textColor",
  "update:cardBg",
  "update:categoryColor",
  "update:buttonColor",
  "update:buttonTextColor",
  "update:fontFamily",
  "update:comandaUnitLabel",
  "update:allowObservations",
  "save",
  "close",
]);

const router = useRouter();

const colorFields = [
  { label: "Fundo Geral", key: "bgColor" },
  { label: "Texto Principal", key: "textColor" },
  { label: "Fundo dos Produtos", key: "cardBg" },
  { label: "Categoria Ativa", key: "categoryColor" },
  { label: "Cor dos Botões", key: "buttonColor" },
  { label: "Texto dos Botões", key: "buttonTextColor" },
];

const fontOptions = [
  { value: "Inter, sans-serif", label: "Inter (Moderna)" },
  { value: "Roboto, sans-serif", label: "Roboto (Clássica)" },
  { value: "Poppins, sans-serif", label: "Poppins (Arredondada)" },
  { value: "Merriweather, serif", label: "Merriweather (Elegante)" },
];
</script>

<template>
  <Transition
    appear
    enter-active-class="transition duration-500 ease-out"
    enter-from-class="translate-x-full opacity-0"
    enter-to-class="translate-x-0 opacity-100"
    leave-active-class="transition duration-400 ease-in"
    leave-from-class="translate-x-0 opacity-100"
    leave-to-class="translate-x-full opacity-0"
  >
    <aside class="fixed top-0 right-0 w-full sm:w-80 h-screen bg-white border-l border-[#E0E0E0] z-[100] flex flex-col shadow-xl font-inter">
      <div class="p-5 border-b border-[#E0E0E0] flex items-center justify-between bg-gray-50 shrink-0">
        <h2 class="font-bold text-lg flex items-center gap-2 text-primary">
          <Palette :size="20" /> Editor Visual
        </h2>
        <div class="flex items-center gap-2">
          <button
            @click="router.push('/app/dashboard')"
            class="text-[#757575] hover:text-primary transition-colors bg-gray-100 p-1.5 rounded"
            title="Ir ao Dashboard"
          >
            <ArrowLeft :size="18" />
          </button>
          <button
            @click="emit('close')"
            class="text-[#757575] hover:text-danger transition-colors bg-gray-100 p-1.5 rounded"
            title="Fechar editor"
          >
            <X :size="20" />
          </button>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
        <div class="bg-primary-light border border-primary/20 p-4 rounded text-primary text-sm leading-relaxed">
          As alterações são aplicadas instantaneamente no cardápio.
        </div>

        <div class="space-y-1">
          <p class="text-[10px] font-black uppercase tracking-widest text-[#757575] mb-3">Cores</p>
          <div
            v-for="(field, i) in colorFields"
            :key="field.key"
            class="flex items-center justify-between py-2.5"
            :class="i < colorFields.length - 1 ? 'border-b border-[#E0E0E0]' : ''"
          >
            <label class="text-sm font-bold text-[#212121]">{{ field.label }}</label>
            <input
              type="color"
              :value="props[field.key]"
              @input="emit(`update:${field.key}`, $event.target.value)"
              class="h-9 w-12 rounded cursor-pointer border border-[#E0E0E0] p-0.5"
            />
          </div>
        </div>

        <BaseSelect
          label="Fonte"
          :modelValue="fontFamily"
          :options="fontOptions"
          @update:modelValue="emit('update:fontFamily', $event)"
        />

        <div>
          <BaseInput
            label="Nome da Unidade"
            :modelValue="comandaUnitLabel"
            placeholder="Ex: Mesa, Comanda, Cabine..."
            @update:modelValue="emit('update:comandaUnitLabel', $event)"
          />
          <p class="text-[10px] text-[#757575] mt-1">Ex: "{{ comandaUnitLabel }} 5", "{{ comandaUnitLabel }} 12"</p>
        </div>

        <label class="flex items-center justify-between p-4 border border-[#E0E0E0] rounded cursor-pointer hover:bg-gray-50 transition-colors">
          <div>
            <span class="block font-bold text-[#212121] mb-0.5">Permitir Observações</span>
            <span class="text-xs text-[#757575]">Clientes podem escrever nos pedidos.</span>
          </div>
          <input
            type="checkbox"
            :checked="allowObservations"
            @change="emit('update:allowObservations', $event.target.checked)"
            class="w-5 h-5 accent-primary"
          />
        </label>
      </div>

      <div class="p-5 border-t border-[#E0E0E0] bg-gray-50 space-y-3 shrink-0">
        <BaseButton variant="primary" :isLoading="isSaving" @click="emit('save')" class="w-full">
          <CheckCircle2 :size="18" /> Salvar Aparência
        </BaseButton>
        <BaseButton variant="secondary" @click="emit('close')" class="w-full">
          Descartar e Sair
        </BaseButton>
      </div>
    </aside>
  </Transition>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(156,163,175,0.5); border-radius: 10px; }
</style>
