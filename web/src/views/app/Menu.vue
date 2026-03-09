<script setup>
import localStorageService from '@/services/localStorageService';
import { ref, computed, onMounted } from 'vue';
import { useMenuStore } from '@/stores/productsManagement';
import { getEstablishmentMock, initMockEstablishment } from '@/mock/stablishmentmock';

const establishmentName = ref('Carregando...');

const imageUrl = ref('');

const products = ref([]);

const selectedProduct = ref({})

const isOpen = ref(false)

const menuStore = useMenuStore();


const backgroundStyle = computed(() => {
   return {
       backgroundImage: imageUrl.value
       ? `url(${imageUrl.value})`
       : '#667eea',
       backgroundSize: 'cover',
       backgroundPosition: 'center',
       backgroundRepeat: 'no-repeat'
   };
});


onMounted(async () => {
   const savedImage = localStorageService.getImage();


   products.value = menuStore.products.filter(product => product.categoryId == 1)
  
   if (savedImage) {
       imageUrl.value = savedImage;
   }


   initMockEstablishment();
   try {
       const data = await getEstablishmentMock();
       if (data && data.info) establishmentName.value = data.info.name;
   } catch (error) {
       establishmentName.value = 'Erro ao carregar';
   }
});


const selectCategory = (id) => {
   products.value = menuStore.products.filter(product => product.categoryId == id)
}

</script>


<template>
   <div
       class="relative w-full h-30  overflow-hidden  group"
       :style="backgroundStyle"
   >
       <div class="absolute inset-0 bg-black/80"></div>
      
       <div class="relative h-full flex items-center justify-center p-8 text-white">


       <h2 class="text-3xl md:text-5xl font-bold mb-4 drop-shadow-lg">
           {{ establishmentName }}
       </h2>
      
       </div>
      
   </div>


   <div class="flex w-full h-lvh">
       <div
           class="w-32 md:w-32 lg:w-48 h-lvh transform transition-all duration-300 overflow-hidden"
           :style="{ background: localStorageService.getCategoryColors() }"
       >
           <div class="grid grid-cols-1 content-start py-4 h-screen overflow-auto p-4 divide-y divide-gray-200">
               <div v-for="category in menuStore.categories" :key="category.id" >
                   <button @click="selectCategory(category.id)" class="image-button flex flex-col items-center justify-center w-full h-full p-2">
                       <img :src="category.image" class="button-icon w-4/5 h-18 object-contain max-w-full max-h-full"/>
                       <span class="font-semibold md:text-2xl lg:text-xl">{{ category.name }}</span>
                   </button>
               </div>           
           </div>
       </div>


       <div
           class="flex-1 h-lvh transform transition-all duration-300 overflow-y-auto"
           :style="{ background: localStorageService.getBackgroundColors() }"
       >
           <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5 gap-3 p-4">
               <div v-for="product in products" :key="product.id" >
                   <button
                       @click="isOpen = true, selectedProduct = product" class="image-button flex flex-col items-center justify-center w-full h-full p-4 rounded"
                       :style="{background: localStorageService.getButtonColors()}"
                   >
                           <img :src="product.image" class="button-icon object-contain max-w-full max-h-full"/>
                           <div class="flex justify-between items-baseline w-full mb-1">
                               <span class="font-medium text-xl">{{ product.name }}</span>
                               <span class="font-semibold text-right">R$ {{ product.sizes[0].price }}</span>
                           </div>
                           <span class="text-sm ">{{ product.description }}</span>
                   </button>
               </div>           
           </div>
      
       </div>



   </div>
  
</template>

