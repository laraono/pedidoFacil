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
    <div class="flex flex-col h-screen overflow-hidden">
        <div
            class="relative w-full h-30 overflow-hidden flex-shrink-0"
            :style="backgroundStyle"
        >
            <div class="absolute inset-0 bg-black/80"></div>

            <div class="relative h-full flex items-center justify-center p-8 text-white">
                <h2 class="text-3xl md:text-5xl font-bold mb-4 drop-shadow-lg">
                    {{ establishmentName }}
                </h2>
            </div>
            
        </div>

        <div class="flex flex-1 overflow-hidden w-full">
            <div
                class="w-32 md:w-32 lg:w-48 h-full transform transition-all duration-300 overflow-hidden"
                :style="{ background: localStorageService.getCategoryColors() }"
            >
                <div
                    class="w-24 md:w-32 lg:w-48 transform transition-all duration-300 flex flex-col shadow-md z-10"
                    :style="{ background: localStorageService.getCategoryColors() || '#f8fafc' }"
                >
                    <div class="flex-1 overflow-y-auto p-3 space-y-3 hide-scrollbar">
                        
                        <button 
                            v-for="category in menuStore.categories" 
                            :key="category.id"
                            @click="selectCategory(category.id)" 
                            class="relative flex flex-col items-center justify-center w-full p-3 rounded-xl transition-all duration-200 group"
                            :class="activeCategoryId === category.id ? 'bg-white shadow-md scale-105' : 'hover:bg-black/5'"
                        >
                            <div 
                                v-if="activeCategoryId === category.id" 
                                class="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-blue-600 rounded-r-full"
                            ></div>

                            <div 
                                class="w-12 h-12 lg:w-16 lg:h-16 mb-2 rounded-full flex items-center justify-center overflow-hidden transition-transform duration-200"
                                :class="activeCategoryId === category.id ? 'bg-blue-50' : 'bg-transparent group-hover:scale-110'"
                            >
                                <img 
                                    :src="category.image" 
                                    class="w-3/4 h-3/4 object-contain drop-shadow-sm" 
                                    alt="Category Icon"
                                />
                            </div>
                            
                            <span 
                                class="font-semibold text-xs lg:text-sm text-center leading-tight line-clamp-2"
                                :class="activeCategoryId === category.id ? 'text-blue-700 font-bold' : 'text-gray-700'"
                            >
                                {{ category.name }}
                            </span>
                        </button>
                        
                    </div>           
                </div>
            </div>

            <div
                class="flex-1 transform transition-all duration-300 overflow-y-auto"
                :style="{ background: localStorageService.getBackgroundColors() }"
            >
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 p-6">
                    <div v-for="product in products" :key="product.id" class="h-full">
                        <button
                            @click="isOpen = true; selectedProduct = product"
                            class="rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow flex flex-col h-full w-full text-left"
                            :style="{ background: localStorageService.getButtonColors() || '#ffffff' }"
                        >
                            <div class="p-5 flex flex-col flex-grow w-full">
                                
                                <div class="h-40 mb-4 bg-gray-50 rounded-md overflow-hidden flex items-center justify-center flex-shrink-0 w-full">
                                    <img 
                                        :src="product.image" 
                                        class="object-cover w-full h-full"
                                        alt="Imagem do produto"
                                    />
                                </div>
                                
                                <div class="flex justify-between items-start w-full mb-2 gap-2">
                                    <h3 class="text-lg font-bold text-gray-800 leading-tight">
                                        {{ product.name }}
                                    </h3>
                                    <span class="font-semibold text-blue-600 whitespace-nowrap">
                                        R$ {{ product.sizes[0].price }}
                                    </span>
                                </div>
                                
                                <p class="text-sm text-gray-600 mb-4 flex-grow line-clamp-3">
                                    {{ product.description }}
                                </p>

                                <div class="w-full py-2 bg-blue-600/10 text-blue-700 font-semibold rounded-lg text-center hover:bg-blue-600 hover:text-white transition-colors mt-auto">
                                    Ver detalhes
                                </div>
                            </div>
                        </button>
                    </div>           
                </div>
            
            </div>
        </div>
    </div>
</template>
