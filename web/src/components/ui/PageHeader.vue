<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ArrowLeft } from 'lucide-vue-next';
import type { Component } from 'vue';
import BaseButton from './BaseButton.vue';

const router = useRouter();

defineProps<{
  title: string;
  subtitle?: string;
  backTo?: string;
  categoryIcon?: Component;
  categoryLabel?: string;
}>();
</script>

<template>
  <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
    <div class="flex items-center gap-4">
      <BaseButton
        v-if="backTo"
        variant="secondary"
        @click="backTo === 'back' ? router.back() : router.push(backTo)"
        class="!p-3 !px-3"
      >
        <ArrowLeft :size="20" />
      </BaseButton>
      <div>
        <div v-if="categoryIcon || categoryLabel" class="flex items-center gap-2 mb-1">
          <component v-if="categoryIcon" :is="categoryIcon" :size="16" class="text-accent" />
          <span v-if="categoryLabel" class="text-xs font-black text-accent uppercase tracking-widest">
            {{ categoryLabel }}
          </span>
        </div>
        <h1 class="text-3xl font-black text-[#212121] tracking-tight">{{ title }}</h1>
        <p v-if="subtitle" class="text-[#757575] text-sm mt-1">{{ subtitle }}</p>
      </div>
    </div>
    <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
      <slot name="actions"></slot>
    </div>
  </div>
</template>
