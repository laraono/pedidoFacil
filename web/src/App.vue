<script setup>
import { onMounted, onUnmounted, watch } from 'vue';
import { RouterView } from 'vue-router';
import ToastMessage from './components/ui/ToastMessage.vue';
import { useAuthStore } from '@/stores/auth';
import { getSocket, connectSocket } from '@/services/socket'; 
import { useToast } from '@/composables/useToast';

const authStore = useAuthStore();
const { showToast } = useToast();

let currentSocketListener = null;

const setupNotificationListener = () => {
  connectSocket('global'); 
  const socket = getSocket();
  
  if (socket && authStore.user?.id) {
    const eventName = `user_notification_${authStore.user.id}`;
    
    if (currentSocketListener) {
      socket.off(currentSocketListener.eventName, currentSocketListener.handler);
    }

    const handler = (data) => {

      showToast(`O seu pedido #${data.orderId} (Comanda: ${data.comanda}) está PRONTO!`, 'success');
    };

    socket.on(eventName, handler);
    currentSocketListener = { eventName, handler };
      }
};

const removeNotificationListener = () => {
  const socket = getSocket();
  if (socket && currentSocketListener) {
    socket.off(currentSocketListener.eventName, currentSocketListener.handler);
    currentSocketListener = null;
  }
};

watch(() => authStore.user, (newUser) => {
  if (newUser) {
    setupNotificationListener();
  } else {
    removeNotificationListener();
  }
}, { deep: true });

onMounted(() => {
  setTimeout(() => {
    if (authStore.user) {
      setupNotificationListener();
    }
  }, 500);
});

onUnmounted(() => {
  removeNotificationListener();
});
</script>

<template>
  <RouterView />
  <ToastMessage />
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');

body {
  margin: 0;
  font-family: 'Inter', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>