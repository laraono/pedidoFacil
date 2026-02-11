<script setup>
// O componente RouterView é importado automaticamente em projetos Vite+Vue Router 
import { RouterView } from 'vue-router'; 
// Importe a Store de Autenticação para usá-la globalmente se precisar de um header
// import { useAuthStore } from '@/stores/auth'; 
// const authStore = useAuthStore();
</script>

<template>
  <!-- 
    RouterView irá renderizar o componente da rota atual (ex: LandingPage, Login.vue, OrderQueue.vue)
    O restante do app deve ser construído dentro dos componentes de rota.
  -->
  <RouterView />
</template>

<style>
/* Estilos globais para garantir que o Tailwind CSS e a fonte Inter funcionem */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');

/* Configuração básica para o corpo da página */
body {
  margin: 0;
  font-family: 'Inter', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Opcional: Estilo de transição para as rotas */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>