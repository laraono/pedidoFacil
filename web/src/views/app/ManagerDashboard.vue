<script setup>
import { useAuthStore } from '@/stores/auth';
import { PERMISSIONS } from '@/utils/permissions';

import CardEstabelecimento from '@/components/dashboard/ConfigEstablishmentCard.vue';
import CardCargos from '@/components/dashboard/ConfigRolesCard.vue';
import CardCardapio from '@/components/dashboard/ConfigMenuCard.vue';
import CardCategorias from '@/components/dashboard/ConfigCategoriesCard.vue';
import CardProdutos from '@/components/dashboard/ConfigProductsCard.vue';
import CardUsers from '@/components/dashboard/ConfigUsersCard.vue'

const auth = useAuthStore();
</script>

<template>
  <main class="max-w-7xl mx-auto py-12 px-4">
    <h2 class="text-4xl font-bold text-center mb-10 text-gray-800">
      Personalize seu Sistema
    </h2>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 items-stretch">
      <CardEstabelecimento v-if="auth.hasPermission(PERMISSIONS.CONFIGURACAO)" />
      <CardCargos v-if="auth.hasPermission(PERMISSIONS.CONFIGURACAO)" />
      <CardUsers v-if="auth.hasPermission(PERMISSIONS.CONFIGURACAO)" />
      <CardCardapio v-if="auth.hasPermission(PERMISSIONS.CONFIGURACAO)" />
      <CardCategorias v-if="auth.hasPermission(PERMISSIONS.CONFIGURACAO)" />
      <CardProdutos v-if="auth.hasPermission(PERMISSIONS.CONFIGURACAO)" />
    </div>
  </main>
</template>
