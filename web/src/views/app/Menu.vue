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
    <div class="h-screen flex flex-col font-inter overflow-hidden">
        
        <header 
            class="relative h-16 md:h-20 flex-shrink-0 overflow-hidden border-b border-white/10"
            :style="backgroundStyle"
        >
            <div class="absolute inset-0 bg-black/50 z-0"></div>

            <div class="relative z-10 flex items-center justify-between w-full h-full px-4 md:px-8">
                <div class="flex items-center gap-3 md:gap-4">
                    <div class="bg-blue-600 p-1.5 md:p-2 rounded-xl text-white shadow-lg">
                        <Utensils :size="20" />
                    </div>
                    <h1 class="text-white font-bold text-lg md:text-2xl tracking-tight">
                        {{ establishmentName }}
                    </h1>
                </div>
                <div class="text-white/70 text-sm font-medium hidden sm:block">
                    Cardápio Digital
                </div>
            </div>
        </header>

        <main class="flex-grow flex flex-col md:flex-row p-3 md:p-6 gap-4 overflow-hidden">
    
            <aside 
                class="w-full md:w-32 lg:w-48 flex flex-col rounded-2xl md:rounded-[2rem] border border-gray-200/60 overflow-hidden shrink-0"
            >
                <header 
                    class="hidden md:flex p-4 items-center justify-center border-b border-gray-200/50"
                    :style="{ background: localStorageService.getButtonColors()}"
                >
                    <h2 class="font-extrabold text-gray-500 text-xs uppercase tracking-widest">Categorias</h2>
                </header>

                <div 
                    class="flex flex-row md:flex-col p-2 md:p-3 overflow-x-auto md:overflow-y-auto custom-scrollbar gap-2 md:space-y-3 flex-grow" 
                    :style="{ background: localStorageService.getCategoryColors()}"
                >
                    <button 
                        v-for="category in menuStore.categories" 
                        :key="category.id"
                        @click="selectCategory(category.id)" 
                        class="relative flex flex-row md:flex-col items-center flex-shrink-0 min-w-[100px] md:min-w-0 p-2 md:p-4 rounded-xl md:rounded-2xl transition-all duration-200"
                        :class="activeCategoryId === category.id 
                        ? 'bg-white shadow-sm ring-1 ring-black/5' 
                        : 'bg-white/30 text-gray-500'"
                    >
                        <div 
                            class="w-8 h-8 md:w-12 md:h-12 mr-2 md:mr-0 md:mb-2 rounded-full flex items-center justify-center overflow-hidden"
                        >
                            <img :src="category.image" class="w-full h-full object-cover" />
                        </div>
                        <span class="text-[10px] md:text-xs font-bold uppercase text-center leading-tight truncate">
                            {{ category.name }}
                        </span>
                    </button>
                </div>
            </aside>

            <section 
                class="flex-1 flex flex-col rounded-2xl md:rounded-[2rem] border border-gray-200/60 overflow-hidden"
                :style="{ background: localStorageService.getBackgroundColors()}"
            >
                <header class="p-3 md:p-5 flex justify-between items-center z-10 border-b border-gray-200/50" :style="{ background: localStorageService.getButtonColors()}">
                    <div class="flex items-center gap-2 md:gap-3">
                        <div class="w-1.5 md:w-3 h-5 md:h-8 rounded-full " :style="{ background: localStorageService.getCategoryColors()}"></div>
                        <h2 class="font-extrabold text-gray-700 text-sm md:text-lg uppercase">Produtos</h2>
                    </div>
                    <span class="bg-white/80 text-gray-600 font-bold px-2 py-0.5 rounded-full text-[10px] md:text-sm">
                        {{ products.length }} itens
                    </span>
                </header>

                <div class="flex-grow p-3 md:p-6 overflow-y-auto custom-scrollbar">
                    <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 md:gap-6">
                        <div v-for="product in products" :key="product.id" class="h-full">
                            <button
                                @click="isOpen = true; selectedProduct = product"
                                class="bg-white rounded-xl md:rounded-2xl border border-gray-200/60 flex flex-col h-full w-full overflow-hidden text-left"
                            >
                                <div class="h-28 md:h-40 overflow-hidden relative">
                                    <img :src="product.image" class="w-full h-full object-cover" />
                                </div>
                                
                                <div class="p-2 md:p-4 flex flex-col flex-grow">
                                    <h3 class="text-gray-800 font-bold text-xs md:text-base line-clamp-1">{{ product.name }}</h3>
                                    <p class="hidden md:block text-gray-500 text-xs line-clamp-2">{{ product.description }}</p>
                                    <div class="mt-2 md:mt-4 font-bold text-blue-600 text-sm">
                                        R$ {{ product.sizes[0].price }}
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    </div>
</template>

<style scoped>
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
</style>