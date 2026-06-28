<script setup lang="ts">
  import { computed } from "vue";
  import { CheckCircle2, AlertTriangle, XCircle } from "lucide-vue-next";

  const props = defineProps<{
    status: string;
    type: "subscription" | "frequency";
  }>();

  const configs = {
    subscription: {
      paga: {
        label: "Paga",
        icon: CheckCircle2,
        color: "text-green-700",
        bg: "bg-green-100 border-green-600/40",
      },
      pendente: {
        label: "Pendente",
        icon: AlertTriangle,
        color: "text-amber-700",
        bg: "bg-amber-100 border-amber-600/40",
      },
      cancelada: {
        label: "Cancelada",
        icon: XCircle,
        color: "text-red-600",
        bg: "bg-red-100 border-red-500/40",
      },
      expirada: {
        label: "Expirada",
        icon: AlertTriangle,
        color: "text-[#424242]",
        bg: "bg-gray-200 border-[#9E9E9E]",
      },
    },
    frequency: {
      anual: {
        label: "Anual",
        icon: null,
        color: "text-purple-700",
        bg: "bg-purple-100 border-purple-700/40",
      },
      annual: {
        label: "Anual",
        icon: null,
        color: "text-purple-700",
        bg: "bg-purple-100 border-purple-700/40",
      },
      mensal: {
        label: "Mensal",
        icon: null,
        color: "text-blue-700",
        bg: "bg-blue-100 border-blue-700/40",
      },
      months: {
        label: "Mensal",
        icon: null,
        color: "text-blue-700",
        bg: "bg-blue-100 border-blue-700/40",
      },
      monthly: {
        label: "Mensal",
        icon: null,
        color: "text-blue-700",
        bg: "bg-blue-100 border-blue-700/40",
      },
    },
  } as const;

  const fallback = {
    label: props.status,
    icon: null,
    color: "text-[#424242]",
    bg: "bg-gray-200 border-[#9E9E9E]",
  };

  const config = computed(() => {
    const key = (props.status ?? "").toLowerCase() as any;
    return (configs[props.type] as any)?.[key] ?? fallback;
  });
</script>

<template>
  <div
    class="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded border"
    :class="[config.color, config.bg]"
  >
    <component v-if="config.icon" :is="config.icon" :size="10" />
    {{ config.label }}
  </div>
</template>
