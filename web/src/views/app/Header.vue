<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue';
import { CircleHelp } from 'lucide-vue-next';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import { useFeaturesStore } from '@/stores/features';

const authStore = useAuthStore();
const { emailEnabled } = storeToRefs(useFeaturesStore());
</script>

<template>
  <div class="min-h-screen bg-page flex flex-col selection:bg-accent selection:text-black">
    <AppHeader />

    <main class="flex-1 relative">
      <router-view />
    </main>

    <a
      v-if="emailEnabled && !authStore.isAdmin"
      href="/#contato"
      target="_blank"
      rel="noopener noreferrer"
      class="print:hidden fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-brand-green text-black text-sm font-semibold px-4 py-2.5 rounded-full shadow-lg hover:brightness-110 transition-all"
      title="Ajuda / Contato"
    >
      <CircleHelp class="w-4 h-4" />
      Ajuda
    </a>
  </div>
</template>
