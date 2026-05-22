<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppHeader from '@/components/AppHeader.vue';
import SubscriptionBlockModal from '@/components/SubscriptionBlockModal.vue';

const RESTRICTED_ROUTES = ['/app/menu', '/app/cashier', '/app/kitchen', '/app/closed', '/app/reports'];

const showSubscriptionModal = ref(false);
const subscriptionErrorMessage = ref('');

const route = useRoute();

function isRestrictedRoute(path: string) {
  return RESTRICTED_ROUTES.some(r => path === r || path.startsWith(r + '/'));
}

function handleSubscriptionBlocked(event: Event) {
  const detail = (event as CustomEvent).detail;
  subscriptionErrorMessage.value = detail?.message || 'Assinatura inativa';
  showSubscriptionModal.value = true;
}

watch(
  () => route.path,
  (newPath) => {
    if (!isRestrictedRoute(newPath)) {
      showSubscriptionModal.value = false;
    }
  }
);

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

    <main class="flex-1 relative">
      <router-view />

      <SubscriptionBlockModal
        v-if="showSubscriptionModal"
        :message="subscriptionErrorMessage"
      />
    </main>
  </div>
</template>
