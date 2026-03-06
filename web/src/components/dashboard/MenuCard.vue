<script setup>
import { useRouter } from 'vue-router';
import { Utensils } from 'lucide-vue-next';
import menu from '@/assets/menu.png'; 

const router = useRouter();

function handleEdit() {
    router.push('/app/menu');
}
</script>

<template>
    <div class="h-full flex flex-col bg-white rounded-2xl shadow-md hover:shadow-xl border border-gray-100 transition-all duration-300 overflow-hidden group">
        
        <div class="p-8 flex-grow flex flex-col items-center text-center">
        
        <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-2">
            <div class="p-2 bg-green-50 rounded-lg text-[#00D26A]">
            <Utensils :size="24" />
            </div>
            <span>Cardápio</span>
        </h3>

        <div class="w-full h-48 mb-6 bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
            <img 
            :src="menu" 
            alt="Cardápio" 
            class="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500" 
            />
        </div>

        <p class="text-gray-500 mb-6 leading-relaxed">
            Analise o Cardápio e escolha o pedido
        </p>

        <button
            @click="handleEdit"
            class="mt-auto w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
        >
            Faça um pedido
        </button>
        </div>
    </div>
</template>