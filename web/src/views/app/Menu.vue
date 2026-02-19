<script setup>
import localStorageService from '@/services/localStorageService';
import { ref, computed, onMounted } from 'vue';
import { useMenuStore } from '@/stores/productsManagement';

const imageUrl = ref('');

const produtos = ref([]);

const menuStore = useMenuStore();

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

    produtos.value = menuStore.products.filter(produto => produto.categoryId == 1)
    
    if (savedImage) {
        imageUrl.value = savedImage;
    }
});

const selectCategory = (id) => {
    produtos.value = menuStore.products.filter(produto => produto.categoryId == id)
    console.log(produtos.value)

}

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

    <div class="flex w-full h-lvh">
        <div 
            class="w-60 h-lvh transform transition-all duration-300 overflow-hidden"
            :style="{ background: localStorageService.getCategoryColors() }"
        >
            <div class="flex flex-col  items-center py-4 h-screen overflow-auto">
                <div v-for="category in menuStore.categories" :key="category.id" >
                    <button @click="selectCategory(category.id)" class="image-button flex flex-col items-center justify-center w-full h-full p-2">
                        <img :src="category.image" class="button-icon w-18 h-18 object-contain max-w-full max-h-full"/>
                        <span>{{ category.name }}</span>
                    </button>
                </div>            
            </div>
        </div>

        <div 
            class="flex-1 h-lvh transform transition-all duration-300 overflow-y-auto"
            :style="{ background: localStorageService.getBackgroundColors() }"
        >
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5 gap-3 p-4">
                <div v-for="produto in produtos" :key="produto.id" >
                    <button @click="handleClick" class="image-button flex flex-col items-center justify-center w-full h-full p-4 " :style="{background: localStorageService.getButtonColors()}">
                            <img :src="produto.image" class="button-icon object-contain max-w-full max-h-full"/>
                            <span>{{ produto.name }}</span>
                            <span>{{ produto.description }}</span>
                            <span>{{ produto.sizes[0].price }}</span>
                    </button>
                </div>            
            </div>
        
        </div>


    
    </div>
    
</template>