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
    default: "bg-white border-[#E0E0E0] text-[#212121]",
    accent: "bg-accent-light border-accent/30 text-accent",
    amber: "bg-amber-500/5 border-amber-500/20 text-amber-400",
    red: "bg-red-500/5 border-red-500/20 text-red-400",
  } as const;
</script>

<template>
  <div
    class="border rounded-xl p-6"
    :class="variantClasses[variant ?? 'default']"
  >
    <div
      class="flex items-center gap-2 text-xs font-black uppercase tracking-widest mb-3 opacity-60"
    >
      <component v-if="icon" :is="icon" :size="14" />
      {{ label }}
    </div>
    <p class="text-3xl font-black">{{ value }}</p>
    <p v-if="description" class="text-xs mt-1 opacity-60">{{ description }}</p>
  </div>
</template>
