<!-- components/MenuPreview.vue -->
<template>
  <div class="preview-wrapper rounded-2xl border-2 border-gray-200 overflow-hidden shadow-xl" :style="{ fontFamily }">
    <!-- Header -->
    <header class="h-16 flex items-center px-4" :style="{ backgroundColor: buttonColor }">
      <div class="flex items-center gap-2">
        <div class="bg-white/20 p-2 rounded-lg text-white">
          <Utensils :size="20" />
        </div>
        <h2 class="text-white font-bold">Restaurante Exemplo</h2>
      </div>
    </header>

    <div class="flex flex-row h-64">
      <!-- Categorias (sidebar) -->
      <aside class="w-24 p-2" :style="{ backgroundColor: categoryColor }">
        <div v-for="cat in mockCategories" :key="cat.id" 
          class="p-2 mb-2 rounded-lg bg-white/80 text-xs font-bold text-center cursor-default">
          {{ cat.name }}
        </div>
      </aside>

      <!-- Produtos -->
      <section class="flex-1 p-3 overflow-y-auto" :style="{ backgroundColor: bgColor }">
        <div class="grid grid-cols-2 gap-2">
          <div v-for="prod in mockProducts" :key="prod.id" 
            class="rounded-lg p-2 shadow-sm" 
            :style="{ backgroundColor: cardBg, color: textColor }">
            <div class="h-16 bg-gray-200 rounded mb-2"></div>
            <p class="font-bold text-sm truncate">{{ prod.name }}</p>
            <p class="text-xs opacity-75">R$ {{ prod.price }}</p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Utensils } from 'lucide-vue-next';

const props = defineProps({
  bgColor: String,
  buttonColor: String,
  categoryColor: String,
  textColor: String,
  cardBg: String,
  fontFamily: String
});

// Dados mock
const mockCategories = ref([
  { id: 1, name: 'Lanches' },
  { id: 2, name: 'Bebidas' },
  { id: 3, name: 'Sobremesas' }
]);

const mockProducts = ref([
  { id: 1, name: 'Hambúrguer', price: '25,90' },
  { id: 2, name: 'Refrigerante', price: '7,50' },
  { id: 3, name: 'Sorvete', price: '12,00' },
  { id: 4, name: 'Batata Frita', price: '15,50' }
]);
</script>