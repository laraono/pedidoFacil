<script setup>
  import { AlertCircle, X } from "lucide-vue-next";
  import BaseButton from "@/components/ui/BaseButton.vue";
  import BaseSelect from "@/components/ui/BaseSelect.vue";
  import BaseInput from "@/components/ui/BaseInput.vue";
  import { useUtils } from "@/composables/useUtils";

  const props = defineProps({
    splitPayment: { type: Boolean, required: true },
    numberOfPeople: { type: Number, required: true },
    paymentSplits: { type: Array, required: true },
    enabledPaymentMethods: { type: Array, required: true },
    totalWithDiscount: { type: Number, required: true },
    totalPayments: { type: Number, required: true },
  });

  const emit = defineEmits([
    "update:splitPayment",
    "update:numberOfPeople",
    "set-single-method",
    "set-split-type",
    "split-amount-input",
    "remove-split",
    "add-split",
    "distribute-equally",
  ]);

  const { formatCurrency } = useUtils();
</script>

<template>
  <div class="mt-10">
    <h3
      class="font-black text-[#757575] mb-6 uppercase tracking-[0.2em] text-[10px]"
    >
      Método de Liquidação
    </h3>
    <div class="bg-gray-50 border border-[#E0E0E0] p-8 rounded">
      <div class="mb-6 flex items-center gap-6 flex-wrap">
        <label class="flex items-center cursor-pointer">
          <div class="relative">
            <input
              type="checkbox"
              :checked="splitPayment"
              @change="emit('update:splitPayment', $event.target.checked)"
              class="sr-only"
            />
            <div
              class="w-12 h-6 rounded transition-colors"
              :class="splitPayment ? 'bg-blue-600' : 'bg-gray-200'"
            />
            <div
              class="absolute left-1 top-1 w-4 h-4 bg-white rounded transition-transform"
              :class="{ 'translate-x-6': splitPayment }"
            />
          </div>
          <span
            class="ml-3 font-black text-xs uppercase text-[#757575] tracking-widest"
            >Dividir Pagamento</span
          >
        </label>

        <div
          v-if="splitPayment"
          class="flex items-center gap-3 bg-page/40 px-4 py-2 rounded border border-[#E0E0E0]"
        >
          <span class="text-[10px] font-black text-[#757575] uppercase shrink-0"
            >Pessoas:</span
          >
          <BaseInput
            :modelValue="String(numberOfPeople)"
            type="number"
            @update:modelValue="emit('update:numberOfPeople', Number($event))"
            :dark="false"
            class="!w-20"
          />
          <BaseButton
            variant="brand"
            @click="emit('distribute-equally')"
            class="!py-1.5 !px-4 !text-[10px] shrink-0"
          >
            Calcular
          </BaseButton>
        </div>
      </div>

      <div v-if="!splitPayment" class="flex gap-3 flex-wrap">
        <button
          v-for="method in enabledPaymentMethods"
          :key="method"
          @click="emit('set-single-method', method)"
          class="px-4 py-2 rounded text-xs font-black uppercase tracking-widest transition-all border"
          :class="
            paymentSplits[0]?.type === method
              ? 'bg-primary text-white border-primary'
              : 'bg-gray-50 text-[#757575] border-[#E0E0E0] hover:text-[#212121]'
          "
        >
          {{ method }}
        </button>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="(split, idx) in paymentSplits"
          :key="idx"
          class="flex flex-col gap-2"
        >
          <div
            class="flex gap-3 items-center p-4 rounded border transition-all"
            :class="
              !split.amount || split.amount <= 0
                ? 'bg-red-500/5 border-danger'
                : 'bg-page/20 border-[#E0E0E0]'
            "
          >
            <BaseSelect
              :modelValue="split.type"
              :options="
                enabledPaymentMethods.map((m) => ({ value: m, label: m }))
              "
              @update:modelValue="emit('set-split-type', idx, $event)"
              class="flex-1"
            />
            <input
              type="text"
              :value="formatCurrency(split.amount)"
              @input="emit('split-amount-input', $event, split)"
              class="bg-gray-50 border border-[#E0E0E0] rounded px-3 py-2 text-sm font-black text-accent text-right w-32 outline-none"
            />
            <button
              v-if="paymentSplits.length > 1"
              @click="emit('remove-split', idx)"
              class="p-2 text-red-500 hover:bg-danger-light rounded transition-all"
            >
              <X :size="16" />
            </button>
          </div>
          <p
            v-if="split.amount <= 0"
            class="text-danger text-[10px] font-bold ml-4 flex items-center gap-1 uppercase tracking-widest"
          >
            <AlertCircle :size="10" /> Valor obrigatório
          </p>
        </div>

        <BaseButton
          variant="ghost"
          @click="emit('add-split')"
          class="w-full border border-dashed border-[#E0E0E0]"
        >
          + Adicionar método
        </BaseButton>

        <div
          class="flex justify-between text-xs font-black pt-2 border-t border-[#E0E0E0]"
          :class="
            Math.abs(totalPayments - totalWithDiscount) > 0.01
              ? 'text-danger'
              : 'text-accent'
          "
        >
          <span class="uppercase tracking-widest">Distribuído:</span>
          <span>{{ formatCurrency(totalPayments) }} / {{ formatCurrency(totalWithDiscount) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
