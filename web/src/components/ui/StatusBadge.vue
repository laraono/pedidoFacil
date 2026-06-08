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
        color: "text-accent",
        bg: "bg-accent-light border-accent/25",
      },
      pendente: {
        label: "Pendente",
        icon: AlertTriangle,
        color: "text-amber-400",
        bg: "bg-amber-500/10 border-amber-500/25",
      },
      cancelada: {
        label: "Cancelada",
        icon: XCircle,
        color: "text-red-400",
        bg: "bg-red-500/10 border-red-500/20",
      },
      expirada: {
        label: "Expirada",
        icon: AlertTriangle,
        color: "text-[#757575]",
        bg: "bg-gray-200/20 border-[#E0E0E0]",
      },
    },
    frequency: {
      anual: {
        label: "Anual",
        icon: null,
        color: "text-purple-400",
        bg: "bg-purple-500/10 border-purple-500/20",
      },
      annual: {
        label: "Anual",
        icon: null,
        color: "text-purple-400",
        bg: "bg-purple-500/10 border-purple-500/20",
      },
      mensal: {
        label: "Mensal",
        icon: null,
        color: "text-blue-400",
        bg: "bg-blue-500/10 border-blue-500/20",
      },
      months: {
        label: "Mensal",
        icon: null,
        color: "text-blue-400",
        bg: "bg-blue-500/10 border-blue-500/20",
      },
      monthly: {
        label: "Mensal",
        icon: null,
        color: "text-blue-400",
        bg: "bg-blue-500/10 border-blue-500/20",
      },
    },
  } as const;

  const fallback = {
    label: props.status,
    icon: null,
    color: "text-[#757575]",
    bg: "bg-gray-200/20 border-[#E0E0E0]",
  };

  const config = computed(() => {
    const key = (props.status ?? "").toLowerCase() as any;
    return (configs[props.type] as any)?.[key] ?? fallback;
  });
</script>

<template>
  <div
    class="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded border"
    :class="[config.color, config.bg]"
  >
    <component v-if="config.icon" :is="config.icon" :size="10" />
    {{ config.label }}
  </div>
</template>
