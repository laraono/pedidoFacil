<script setup>
import AppHeader from '@/components/AppHeader.vue';
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex flex-col">
    <AppHeader />
    <main class="flex-1">
      <router-view />
    </main>
  </div>
</template>
