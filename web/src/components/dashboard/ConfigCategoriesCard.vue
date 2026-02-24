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
  <div class="h-full flex flex-col bg-white rounded-2xl shadow-md hover:shadow-xl border border-gray-100 transition-all duration-300 overflow-hidden group">
    <div class="p-8 flex-grow flex flex-col items-center text-center">
      <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-2">
        <div class="p-2 bg-green-50 rounded-lg text-[#00D26A]">
          <Tags :size="24" />
        </div>
        <span>Categorias</span>
      </h3>
      <div class="w-full h-48 mb-6 bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
        <img 
          :src="categoriesImage"
          alt="Gerenciar Categorias"
          class="w-full h-full object-cover object-center"
        />
      </div>
      <p class="text-gray-500 mb-6 leading-relaxed">
        Crie e organize as seções do seu cardápio (ex: Lanches, Bebidas, Sobremesas).
      </p>

      <button
        @click="handleEdit"
        class="mt-auto w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
      >
        Gerenciar Categorias
      </button>
    </div>
  </div>
</template>