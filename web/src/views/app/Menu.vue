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

        <main class="flex-grow flex flex-col md:flex-row p-4 md:p-6 gap-4 md:gap-6 overflow-hidden">
        
        <aside 
            class="w-full md:w-32 lg:w-48 flex flex-col rounded-2xl md:rounded-[2rem] border border-gray-200/60 overflow-hidden"
        >
            <header class="p-4 flex items-center justify-center border-b border-gray-200/50">
            <h2 class="font-extrabold text-gray-500 text-xs uppercase tracking-widest">Categorias</h2>
            </header>

            <div class="flex-grow p-3 overflow-y-auto custom-scrollbar space-y-3" :style="{ background: localStorageService.getCategoryColors()}">
                <button 
                    v-for="category in menuStore.categories" 
                    :key="category.id"
                    @click="selectCategory(category.id)" 
                    class="relative flex flex-col items-center justify-center w-full p-4 rounded-2xl transition-all duration-200 group"
                    :class="activeCategoryId === category.id 
                    ? 'bg-white scale-105 border border-gray-100' 
                    : 'hover:bg-white/50 text-gray-500'"
                >
                    <div v-if="activeCategoryId === category.id" class="absolute left-2 w-1.5 h-1.5 bg-blue-600 rounded-full"></div>

                    <div 
                        class="w-12 h-12 mb-2 rounded-full flex items-center justify-center overflow-hidden transition-transform duration-200"
                        :class="activeCategoryId === category.id ? 'bg-blue-50' : 'bg-gray-200/50 group-hover:scale-110'"
                    >
                        <img :src="category.image" class="w-3/4 h-3/4 object-contain" />
                    </div>
                    <span class="text-[10px] md:text-xs font-bold uppercase text-center leading-tight">
                        {{ category.name }}
                    </span>
                </button>
            </div>
        </aside>

        <section 
            class="flex-1 flex flex-col rounded-2xl md:rounded-[2rem] border border-gray-200/60 overflow-hidden"
            :style="{ background: localStorageService.getBackgroundColors()}"
        >
            <header class="p-4 md:p-5 flex justify-between items-center z-10 border-b border-gray-200/50">
                <div class="flex items-center gap-3">
                    <div class="w-2 md:w-3 h-6 md:h-8 bg-blue-500 rounded-full"></div>
                    <h2 class="font-extrabold text-gray-700 text-base md:text-lg uppercase tracking-wide">Produtos</h2>
                </div>
                <span class="bg-white/80 text-gray-600 font-bold px-3 py-1 rounded-full text-sm border border-gray-200">
                    {{ products.length }} itens
                </span>
            </header>

            <div class="flex-grow p-4 md:p-6 overflow-y-auto custom-scrollbar">
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
                    <div v-for="product in products" :key="product.id" class="h-full">
                    <button
                        @click="isOpen = true; selectedProduct = product"
                        class="bg-white rounded-2xl border border-gray-200/60 transition-all duration-300 flex flex-col h-full w-full overflow-hidden group text-left"
                    >
                        <div class="h-40 overflow-hidden relative">
                            <img :src="product.image" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            <div class="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded-lg text-xs font-bold">
                                R$ {{ product.sizes[0].price }}
                            </div>
                        </div>
                        
                        <div class="p-4 flex flex-col flex-grow">
                        <h3 class="text-gray-800 font-bold mb-1 group-hover:text-blue-600 transition-colors">{{ product.name }}</h3>
                        <p class="text-gray-500 text-xs line-clamp-2 flex-grow">{{ product.description }}</p>
                        
                        <div class="mt-4 flex items-center justify-between">
                            <span class="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Ver Detalhes</span>
                            <div class="p-1.5 bg-blue-50 rounded-lg text-blue-600">
                                <List :size="14" />
                            </div>
                        </div>
                        </div>
                    </button>
                    </div>
                </div>

                <div v-if="products.length === 0" class="flex flex-col items-center justify-center h-full text-gray-400 opacity-60 py-20">
                    <ChefHat :size="64" class="mb-4" />
                    <p class="text-xl font-medium">Nenhum produto nesta categoria</p>
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