<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import AppHeader from '@/components/AppHeader.vue';
import SubscriptionBlockModal from '@/components/SubscriptionBlockModal.vue';

const showSubscriptionModal = ref(false);
const subscriptionErrorMessage = ref('');

function handleSubscriptionBlocked(event: Event) {
  const detail = (event as CustomEvent).detail;
  subscriptionErrorMessage.value = detail?.message || 'Assinatura inativa';
  showSubscriptionModal.value = true;
}

onMounted(() => {
  window.addEventListener('subscription-blocked', handleSubscriptionBlocked);
});

onUnmounted(() => {
  window.removeEventListener('subscription-blocked', handleSubscriptionBlocked);
});
</script>

<template>
  <div class="min-h-screen bg-page flex flex-col selection:bg-accent selection:text-black">
    <AppHeader />

    <main class="flex-1">
      <router-view />
    </main>

    <SubscriptionBlockModal
      v-if="showSubscriptionModal"
      :message="subscriptionErrorMessage"
      @close="showSubscriptionModal = false"
    />
  </div>
</template>
