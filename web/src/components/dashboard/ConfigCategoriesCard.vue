<script setup>
import { useRouter } from 'vue-router'
import { Tags } from 'lucide-vue-next'


import categoriesImage from '@/assets/atendimento1.png'

const router = useRouter()

function handleEdit() {
  router.push('/app/settings/categories')
}
</script>

<template>
  <div class="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow flex flex-col h-full">
    <div class="p-6 flex flex-col flex-grow">
      <h3 class="text-xl font-bold text-gray-800 mb-2 flex items-center space-x-2">
        <Tags :size="20" class="text-blue-600" />
        <span>Categorias</span>
      </h3>

      <div class="h-40 my-4 bg-gray-200 rounded-md overflow-hidden">
        <img
          :src="categoriesImage"
          alt="Gerenciar Categorias"
          class="w-full h-full object-cover object-center"
        />
      </div>

      <p class="text-sm text-gray-600 mb-6 flex-grow">
        Crie e organize as seções do seu cardápio (ex: Lanches, Bebidas, Sobremesas).
      </p>

      <button
        @click="handleEdit"
        class="w-full py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors mt-auto"
      >
        Gerenciar Categorias
      </button>
    </div>
  </div>
</template>