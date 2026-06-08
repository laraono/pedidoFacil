<script setup>
  import { PackageOpen } from "lucide-vue-next";
  import { useUtils } from "@/composables/useUtils";
  import { DataTable, EmptyState } from "@/components/ui";

  defineProps({
    topProducts: { type: Array, default: () => [] },
  });

  const { formatCurrency } = useUtils();

  const columns = [
    { key: "nome", label: "Produto" },
    { key: "qtd", label: "Vendas" },
    { key: "receita", label: "Faturamento" },
  ];
</script>

<template>
  <div class="pb-12">
    <div class="bg-white border border-[#E0E0E0] rounded-2xl p-8 shadow-sm">
      <h3
        class="text-sm font-black text-[#212121] flex items-center gap-3 mb-12 uppercase tracking-widest"
      >
        <PackageOpen :size="18" class="text-accent" /> Mix de Produtos &
        Rentabilidade
      </h3>
      <DataTable
        v-if="topProducts.length > 0"
        :columns="columns"
        :data="topProducts"
      >
        <template #cell-nome="{ item }">
          <span class="font-black text-sm text-[#212121]">{{ item.nome }}</span>
          <span
            class="text-[10px] font-bold text-[#757575] block uppercase tracking-tighter"
            >{{ item.categoria }}</span
          >
        </template>
        <template #cell-receita="{ value }">
          <span class="font-black text-accent">{{
            formatCurrency(value)
          }}</span>
        </template>
      </DataTable>
      <EmptyState
        v-else
        :icon="PackageOpen"
        message="Sem histórico de produtos"
      />
    </div>
  </div>
</template>
