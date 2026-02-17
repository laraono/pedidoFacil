<script setup>
import { useRouter } from 'vue-router'
import { Briefcase } from 'lucide-vue-next'

import rolesImage from '@/assets/image 27.png'

const router = useRouter()

function handleEdit() {
  router.push('/app/settings/roles')
}
</script>

<template>
  <div class="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow">
    <div class="p-6">
      <h3 class="text-xl font-bold text-gray-800 mb-2 flex items-center space-x-2">
        <Briefcase :size="20" class="text-blue-600" />
        <span>Cargos e Permissões</span>
      </h3>
      <div class="h-40 my-4 bg-gray-200 rounded-md overflow-hidden">
        <img
          :src="rolesImage"
          alt="Cargos e Permissões"
          class="w-full h-full object-cover object-center"
        />
      </div>
      <p class="text-sm text-gray-600 mb-6">
        Configure e edite os cargos e permissões do seu estabelecimento.
      </p>
      <button
        @click="handleEdit"
        class="w-full py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
      >
        Editar
      </button>
    </div>
  </div>
</template>
