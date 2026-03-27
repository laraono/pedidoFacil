<script setup>
import AppHeader from '@/components/AppHeader.vue';
</script>

<template>
  <div class="min-h-screen bg-dark-bg flex flex-col selection:bg-brand-green selection:text-black">
    <AppHeader />

    <main class="flex-1">
      <router-view />
    </main>
  </div>
</template>