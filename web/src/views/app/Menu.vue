<script setup>
import localStorageService from '@/services/localStorageService';
import { useColorStore } from '@/stores/color';
import { ref, computed, onMounted } from 'vue';

const colorStore = useColorStore()

const imageUrl = ref('');

const backgroundStyle = computed(() => {
  return {
    backgroundImage: imageUrl.value 
      ? `url(${imageUrl.value})` 
      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  };
});

onMounted(() => {
  const savedImage = localStorageService.getImage();

  console.log(colorStore.corCategorias)
  
  if (savedImage) {
    imageUrl.value = savedImage;
  }
});

</script>

<template>
  <div 
    class="relative w-full h-30  overflow-hidden  group"
    :style="backgroundStyle"
  >
    <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
    
    <div class="relative h-full flex items-center justify-center p-8 text-white">

      <h2 class="text-3xl md:text-4xl font-bold mb-4 drop-shadow-lg">
        title
      </h2>
    
    </div>
    
  </div>

  <div class="flex w-full h-screen">
        <div 
            class="w-60 h-full transform transition-all duration-300"
            :style="{ background: colorStore.corCategorias }"
        >
        
        </div>
        <div 
            class="flex-1 h-full transform transition-all duration-300"
            :style="{ background: colorStore.corFundo }"
        >
        
        </div>
  </div>
  
</template>