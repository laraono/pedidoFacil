<script setup>
import { useRouter } from 'vue-router'
import { ShieldCheck, User } from 'lucide-vue-next'; 
import { Users } from 'lucide-vue-next'

import usersImage from '@/assets/image 30.png'

const router = useRouter()

function handleEdit() {
  router.push('/app/settings/users')
}
</script>

<template>
  <div class="h-full flex flex-col bg-white rounded-2xl shadow-md hover:shadow-xl border border-gray-100 transition-all duration-300 overflow-hidden group">
    <div class="p-8 flex-grow flex flex-col items-center text-center">
      <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-2">
        <div class="p-2 bg-green-50 rounded-lg text-[#00D26A]">
          <User :size="24" />
        </div>
        <span>Usuários</span>
      </h3>
      <div class="w-full h-48 mb-6 bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
        <img 
          :src="usersImage" 
          alt="Usuários" 
          class="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500" 
        />
      </div>
      <p class="text-gray-500 mb-6 leading-relaxed">
        Gerencie os usuários e cargos.
      </p>

      <button
        @click="handleEdit"
        class="mt-auto w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
      >
        Editar
      </button>
    </div>
  </div>
</template>