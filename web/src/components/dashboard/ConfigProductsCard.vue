<script setup>
import { useRouter } from 'vue-router'
import { Utensils } from 'lucide-vue-next'
import productImage from '@/assets/atendimento1.png' 

const router = useRouter()
</script>

<template>
  <div class="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow flex flex-col h-full w-full">
    <div class="p-6 flex flex-col flex-grow">
      <h3 class="text-xl font-bold text-gray-800 mb-2 flex items-center space-x-2">
        <Utensils :size="20" class="text-blue-600" />
        <span>Produtos</span>
      </h3>
      <div class="h-40 my-4 bg-blue-50 rounded-md overflow-hidden flex items-center justify-center text-blue-400 flex-shrink-0">
             <Utensils :size="48" />
      </div>
      <p class="text-sm text-gray-600 mb-6 flex-grow">
        Adicione, edite e organize seus pratos, preços e adicionais.
      </p>
      <button @click="router.push('/app/settings/products')" class="w-full py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors mt-auto">
        Gerenciar Produtos
      </button>
    </div>
  </div>
</template>