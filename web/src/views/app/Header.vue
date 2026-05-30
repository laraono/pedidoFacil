<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue';
</script>

<template>
  <div class="min-h-screen bg-page flex flex-col selection:bg-accent selection:text-black">
    <AppHeader />

    <main class="flex-1 relative">
      <router-view />
    </main>
  </div>
</template>
