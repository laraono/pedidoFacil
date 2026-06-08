<script setup>
  import { Tag, XCircle } from "lucide-vue-next";
  import BaseSelect from "@/components/ui/BaseSelect.vue";
  import BaseButton from "@/components/ui/BaseButton.vue";
  import BaseInput from "@/components/ui/BaseInput.vue";

  defineProps({
    subtotal: { type: Number, required: true },
    discountType: { type: String, required: true },
    discountRaw: { type: String, default: "" },
    discountValue: { type: Number, default: 0 },
    appliedCoupon: { type: Object, default: null },
    couponCodeInput: { type: String, default: "" },
    couponError: { type: String, default: "" },
    couponDiscount: { type: Number, default: 0 },
    totalWithDiscount: { type: Number, required: true },
  });

  const emit = defineEmits([
    "update:discountType",
    "discount-input",
    "update:couponCodeInput",
    "apply-coupon",
    "remove-coupon",
  ]);

  const discountTypeOptions = [
    { value: "percent", label: "Percentual (%)" },
    { value: "fixed", label: "Valor fixo (R$)" },
  ];
</script>

<template>
  <div
    class="mt-10 border border-[#E0E0E0] rounded p-8 bg-page/40 shadow-inner"
  >
    <div
      class="flex justify-between text-sm font-black text-[#757575] uppercase tracking-widest"
    >
      <span>Subtotal da Conta:</span>
      <span class="text-[#212121]">R$ {{ subtotal.toFixed(2) }}</span>
    </div>

    <div class="mt-6 p-6 bg-gray-50 rounded border border-[#E0E0E0]">
      <label
        class="block text-[10px] font-black text-[#757575] uppercase tracking-widest mb-3"
        >Aplicar Ajuste/Desconto</label
      >
      <div class="flex gap-4">
        <BaseSelect
          :modelValue="discountType"
          :options="discountTypeOptions"
          @update:modelValue="emit('update:discountType', $event)"
          class="flex-1"
        />
        <div class="relative">
          <input
            :value="discountRaw"
            @input="emit('discount-input', $event)"
            inputmode="numeric"
            :placeholder="discountType === 'percent' ? '0' : '0,00'"
            class="bg-gray-50 border border-[#E0E0E0] rounded px-4 py-3 text-lg font-black text-center text-accent w-32 outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span
            class="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-black text-[#757575] pointer-events-none"
          >
            {{ discountType === "percent" ? "%" : "R$" }}
          </span>
        </div>
      </div>
    </div>

    <div class="mt-6 p-6 bg-gray-50 rounded border border-[#E0E0E0]">
      <label
        class="block text-[10px] font-black text-[#757575] uppercase tracking-widest mb-3 flex items-center gap-2"
      >
        <Tag :size="12" /> Cupom de Desconto
      </label>
      <div
        v-if="appliedCoupon"
        class="flex items-center justify-between p-3 bg-accent-light border border-accent/30 rounded"
      >
        <div class="flex items-center gap-2">
          <Tag :size="14" class="text-accent" />
          <span
            class="font-black text-accent text-sm font-mono tracking-widest"
            >{{ appliedCoupon.code }}</span
          >
          <span class="text-[#757575] text-xs">
            —
            {{
              appliedCoupon.type === "percent"
                ? appliedCoupon.value + "%"
                : "R$ " + Number(appliedCoupon.value).toFixed(2)
            }}
            off
          </span>
        </div>
        <button
          @click="emit('remove-coupon')"
          class="p-1 text-[#757575] hover:text-danger transition-colors"
        >
          <XCircle :size="16" />
        </button>
      </div>
      <div v-else class="flex gap-3 items-end">
        <BaseInput
          :modelValue="couponCodeInput"
          @update:modelValue="emit('update:couponCodeInput', $event)"
          placeholder="Digite o código..."
          :dark="false"
          class="flex-1"
        />
        <BaseButton variant="secondary" @click="emit('apply-coupon')"
          >Aplicar</BaseButton
        >
      </div>
      <p v-if="couponError" class="text-danger text-[11px] font-bold mt-2 ml-1">
        {{ couponError }}
      </p>
    </div>

    <div class="flex justify-between items-end mt-8">
      <div>
        <span
          class="text-[10px] font-black text-[#757575] uppercase tracking-[0.3em]"
          >Total a Pagar</span
        >
        <div
          v-if="appliedCoupon"
          class="text-[10px] text-accent font-bold mt-0.5"
        >
          Cupom: − R$ {{ couponDiscount.toFixed(2) }}
        </div>
      </div>
      <div class="flex flex-col items-end">
        <span
          v-if="discountValue > 0 || appliedCoupon"
          class="text-sm font-bold text-[#757575] line-through mb-1"
        >
          R$ {{ subtotal.toFixed(2) }}
        </span>
        <span class="text-4xl font-black text-accent tracking-tighter">
          R$ {{ totalWithDiscount.toFixed(2) }}
        </span>
      </div>
    </div>
  </div>
</template>
