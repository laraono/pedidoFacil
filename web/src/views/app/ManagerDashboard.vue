<script setup>
import { useAuthStore } from '@/stores/auth';
import { PERMISSIONS } from '@/utils/permissions';

import CardEstabelecimento from '@/components/dashboard/ConfigEstablishmentCard.vue';
import CardCargos from '@/components/dashboard/ConfigRolesCard.vue';
import CardCardapio from '@/components/dashboard/ConfigMenuCard.vue';

const auth = useAuthStore();
</script>

<template>
  <div class="min-h-screen bg-white">
    
    <main class="max-w-7xl mx-auto py-16 px-6 lg:px-8">
      
      <div class="text-center mb-16 space-y-4 animate-fade-in-down">
        <h2 class="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight">
          Configurações do <span class="text-black font-extrabold">Sistema</span>
        </h2>
        <p class="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
          Gerencie as informações fundamentais do seu estabelecimento, permissões da equipe e o seu cardápio digital.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full animate-fade-in-up items-stretch">
        
        <div v-if="auth.hasPermission(PERMISSIONS.CONFIGURACAO)" class="h-full transition-transform duration-300 hover:-translate-y-1">
          <CardEstabelecimento class="h-full flex flex-col justify-between text-center shadow-md hover:shadow-xl transition-shadow duration-300 rounded-2xl border border-gray-100 bg-white p-6" />
        </div>

        <div v-if="auth.hasPermission(PERMISSIONS.CONFIGURACAO)" class="h-full transition-transform duration-300 hover:-translate-y-1">
          <CardCargos class="h-full flex flex-col justify-between text-center shadow-md hover:shadow-xl transition-shadow duration-300 rounded-2xl border border-gray-100 bg-white p-6" />
        </div>

        <div v-if="auth.hasPermission(PERMISSIONS.CONFIGURACAO)" class="h-full transition-transform duration-300 hover:-translate-y-1">
          <CardCardapio class="h-full flex flex-col justify-between text-center shadow-md hover:shadow-xl transition-shadow duration-300 rounded-2xl border border-gray-100 bg-white p-6" />
        </div>

      </div>

      <div v-if="!auth.hasPermission(PERMISSIONS.CONFIGURACAO)" class="text-center py-20 opacity-50">
        <p class="text-gray-400">Você não possui permissões para visualizar estas configurações.</p>
      </div>

    </main>
  </div>
</template>

<style scoped>
/* Animações sutis de entrada */
@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in-down {
  animation: fadeInDown 0.6s ease-out forwards;
}

.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out forwards;
  animation-delay: 0.2s;
  opacity: 0;
  animation-fill-mode: forwards;
}

/* DICA EXTRA:
   Se os botões dentro dos componentes (CardEstabelecimento, etc) não estiverem
   descendo para o fundo, você pode forçar via CSS profundo (deep selector)
   assumindo que o botão seja a última tag ou tenha uma classe específica.
*/
:deep(.card-content) {
    flex-grow: 1; /* Força o texto a ocupar o espaço, empurrando o botão pra baixo */
}
:deep(button), :deep(a.button) {
    margin-top: auto; /* Garante margem automática no topo do botão */
}
</style>