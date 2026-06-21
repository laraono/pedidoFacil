<script setup>
  import { computed } from "vue";
  import { AlertTriangle, CreditCard, DollarSign } from "lucide-vue-next";
  import { EmptyState } from "@/components/ui";

  const props = defineProps({
    paymentMethods: { type: Array, default: () => [] },
    cancellations: { type: Array, default: () => [] },
    totalCancellationsCount: { type: Number, default: 0 },
    financialImpact: { type: String, required: true },
    isLoaded: { type: Boolean, required: true },
  });

  const paymentColorMap = {
    Pix: "bg-brand-green",
    Crédito: "bg-blue-400",
    Débito: "bg-purple-400",
    Dinheiro: "bg-yellow-400",
  };
  const paymentColor = (name) => paymentColorMap[name] || "bg-gray-400";
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
    <div
      class="bg-white border border-[#E0E0E0] rounded p-8 min-h-[400px] flex flex-col shadow-sm"
    >
      <h3
        class="text-sm font-black text-[#212121] flex items-center gap-3 mb-12 uppercase tracking-widest"
      >
        <CreditCard :size="18" class="text-blue-500" /> Métodos de Recebimento
      </h3>
      <div v-if="paymentMethods.length > 0" class="space-y-8">
        <div
          v-for="method in paymentMethods"
          :key="method.name"
          class="space-y-3"
        >
          <div class="flex justify-between items-end">
            <span
              class="text-[10px] font-black text-[#757575] uppercase tracking-widest"
              >{{ method.name }}</span
            >
            <span class="text-sm font-black text-[#212121]"
              >{{ method.value }}%</span
            >
          </div>
          <div class="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
            <div
              :class="paymentColor(method.name)"
              class="h-full transition-all duration-1000 shadow-inner"
              :style="{ width: isLoaded ? method.value + '%' : '0%' }"
            ></div>
          </div>
        </div>
      </div>
      <EmptyState v-else :icon="DollarSign" message="Sem dados financeiros" />
    </div>

    <div
      class="bg-white border border-[#E0E0E0] rounded p-8 flex flex-col justify-between min-h-[400px] shadow-sm"
    >
      <div>
        <h3
          class="text-sm font-black text-[#212121] flex items-center gap-3 mb-12 uppercase tracking-widest"
        >
          <AlertTriangle :size="18" class="text-danger" /> Perdas de Receita
        </h3>
        <div v-if="cancellations.length > 0" class="space-y-8">
          <div
            v-for="item in cancellations"
            :key="item.motivo"
            class="space-y-3"
          >
            <div class="flex justify-between items-end">
              <span
                class="text-[10px] font-black text-[#757575] uppercase tracking-widest"
                >{{ item.motivo }}</span
              >
              <span class="text-xs font-black text-[#212121]"
                >{{ item.count }} UN.</span
              >
            </div>
            <div class="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
              <div
                class="bg-red-400 h-full transition-all duration-1000"
                :style="{
                  width: isLoaded
                    ? `${(item.count / (totalCancellationsCount || 1)) * 100}%`
                    : '0%',
                }"
              ></div>
            </div>
          </div>
        </div>
        <EmptyState
          v-else
          :icon="AlertTriangle"
          message="Nenhum cancelamento"
        />
      </div>
      <div
        v-if="totalCancellationsCount > 0"
        class="mt-8 p-6 bg-danger/5 border border-danger/20 rounded-2xl flex items-start gap-4"
      >
        <AlertTriangle :size="24" class="text-danger flex-shrink-0 mt-1" />
        <div>
          <h4
            class="text-danger font-black text-[11px] uppercase tracking-[0.2em] mb-1"
          >
            Perda em Cancelamentos
          </h4>
          <p class="text-danger/70 text-xs leading-relaxed font-medium">
            Cancelamentos geraram uma perda de
            <strong class="text-danger font-black text-sm">{{
              financialImpact
            }}</strong
            >.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
