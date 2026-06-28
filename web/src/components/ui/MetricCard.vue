<script setup lang="ts">
  import type { Component } from "vue";

  defineProps<{
    label: string;
    value: string | number;
    icon?: Component;
    description?: string;
    variant?: "default" | "accent" | "amber" | "red";
  }>();

  const variantClasses = {
    default: "bg-white border-[#9E9E9E] text-[#1A1A1A]",
    accent: "bg-green-50 border-green-600/40 text-green-700",
    amber: "bg-amber-50 border-amber-600/40 text-amber-700",
    red: "bg-red-50 border-red-500/40 text-red-600",
  } as const;
</script>

<template>
  <div
    class="border rounded-xl p-6 min-w-0 overflow-hidden"
    :class="variantClasses[variant ?? 'default']"
  >
    <div
      class="flex items-center gap-2 text-[11px] sm:text-xs font-black uppercase tracking-wide sm:tracking-widest mb-3 opacity-90"
    >
      <component v-if="icon" :is="icon" :size="14" class="shrink-0" />
      {{ label }}
    </div>
    <p class="text-2xl sm:text-3xl font-black">{{ value }}</p>
    <p v-if="description" class="text-sm mt-1 font-medium opacity-90">{{ description }}</p>
  </div>
</template>
