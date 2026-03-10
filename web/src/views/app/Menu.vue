<script setup>
import localStorageService from '@/services/localStorageService';
import { ref, computed, onMounted } from 'vue';
import { useMenuStore } from '@/stores/productsManagement';
import { useComandaStore } from '@/stores/comandaManagement';
import { useKitchenStore } from '@/stores/kitchen';
import { getEstablishmentMock, initMockEstablishment } from '@/mock/stablishmentmock'; 
import { Trash2 } from 'lucide-vue-next';

const establishmentName = ref('Carregando...');

const imageUrl = ref('');

const products = ref([]);

const selectedProduct = ref({})

const amount = ref([])

const isOpen = ref(false)

const hasOrder = ref(false)

const orderEnded = ref(false)

const items = ref([])

const order = ref({})

const menuStore = useMenuStore();

const comandaStore = useComandaStore();

const kitchenStore = useKitchenStore()

const gray = '#7a7a7a'

const isSelfService = ref(false)

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

const saveAmount = (change, product, size) => {
    const key = `${product.name}-${size.name}`
  
    if (!amount.value[key]) {
        amount.value[key] = 0
    }

    amount.value[key] += change
    
    if (amount.value[key] < 0) {
        amount.value[key] = 0
        return
    }
    
    const existingItemIndex = items.value.findIndex(
        item => item.name === product.name && item.size === size.name
    )

    if(amount.value[key] === 0) {
    } else {
        if (existingItemIndex !== -1) {
            items.value[existingItemIndex].amount = amount.value[key]
            items.value[existingItemIndex].price = amount.value[key] * size.price
        } else {
            items.value.push({
                name: product.name, 
                size: size.name, 
                amount: amount.value[key],
                price: amount.value[key] * size.price
            })
        }
    }
}

const removeItem = (index) => {
    items.value.splice(index, 1);
    if(items.value.length === 0) {
        hasOrder.value = false
        amount.value = []
    }
}

const endOrder = () => {

    let total = 0

    items.value.map((item) =>  total += item.price)

    order.value = {
        id: Math.floor(Math.random() * 50) + 1,
        table: `table ${Math.floor(Math.random() * 20) + 1}`,
        waiter: 'Sistema',
        status: 'pending',
        createdAt: new Date(),
        price: total,
        items: items.value
    };

    if(isSelfService.value) {
        orderEnded.value = false
        addComanda()
        amount.value = []
    } else {
        orderEnded.value = true
        amount.value = []
    }

}

const cancelOrder = () => {
    isOpen.value = false

    items.value = []
    amount.value = []
}

const saveOrder = () => {
    if(items.value.length > 0) {
        hasOrder.value = true
        isOpen.value = false
        amount.value = []
    }
}

const calculateTotal = () => {
    return items.value.reduce((sum, item) => sum + (item.price || 0), 0)
}

const addComanda = () => {
    if(order.value.items.length > 0) {
        comandaStore.addComanda(order.value)

        kitchenStore.addOrder(order.value)

        order.value = ({})
        items.value = []

        hasOrder.value =false
    }
}

const updateComanda = (id) => {
    if(order.value.items.length > 0) {
        comandaStore.updateComanda(id, order.value, calculateTotal())

        items.value = []
        order.value = ({})

        hasOrder.value = false    
    }
}

</script>

<template>
    <div class="h-screen flex flex-col font-inter overflow-hidden">
        
        <header 
            class="relative h-16 md:h-20 flex-shrink-0 overflow-hidden border-b border-white/10"
            :style="backgroundStyle"
        >
            <div class="absolute inset-0 bg-black/60 z-0"></div>
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

        <main class="flex-grow flex flex-col md:flex-row p-3 md:p-6 gap-4 overflow-hidden bg-gray-50">
            
            <aside 
                class="w-full md:w-32 lg:w-48 flex flex-col rounded-2xl md:rounded-[2rem] border border-gray-200/60 overflow-hidden shrink-0 shadow-sm"
                :style="{ background: localStorageService.getCategoryColors() }"
            >
                <header class="hidden md:flex p-4 items-center justify-center border-b border-gray-200/20">
                    <h2 class="font-extrabold text-gray-500 text-xs uppercase tracking-widest">Categorias</h2>
                </header>

                <div class="flex flex-row md:flex-col p-2 md:p-3 overflow-x-auto md:overflow-y-auto custom-scrollbar gap-2 md:space-y-3">
                    <button 
                        v-for="category in menuStore.categories" 
                        :key="category.id"
                        @click="selectCategory(category.id)" 
                        class="relative flex flex-row md:flex-col items-center flex-shrink-0 min-w-[110px] md:min-w-0 p-2 md:p-4 rounded-xl md:rounded-2xl transition-all duration-200 bg-white/20 hover:bg-white/40"
                    >
                        <div class="w-8 h-8 md:w-12 md:h-12 mr-2 md:mr-0 md:mb-2 rounded-full flex items-center justify-center overflow-hidden bg-white/50">
                            <img :src="category.image" class="w-3/4 h-3/4 object-contain" />
                        </div>
                        <span class="text-[10px] md:text-xs font-bold uppercase text-center leading-tight truncate text-gray-700">
                            {{ category.name }}
                        </span>
                    </button>
                </div>
            </aside>

            <section 
                class="flex-1 flex flex-col rounded-2xl md:rounded-[2rem] border border-gray-200/60 overflow-hidden shadow-sm"
                :style="{ background: localStorageService.getBackgroundColors()}"
            >
                <header class="p-3 md:p-5 flex justify-between items-center z-10 border-b border-gray-200/50" :style="{ background: localStorageService.getButtonColors()}">
                    <div class="flex items-center gap-2 md:gap-3">
                        <div class="w-1.5 md:w-3 h-5 md:h-8 rounded-full bg-white/50"></div>
                        <h2 class="font-extrabold text-gray-700 text-sm md:text-lg uppercase">Produtos</h2>
                    </div>
                    <span class="bg-white/80 text-gray-600 font-bold px-2 py-0.5 rounded-full text-[10px] md:text-sm">
                        {{ products.length }} itens
                    </span>
                </header>

                <div class="flex-grow p-3 md:p-6 overflow-y-auto custom-scrollbar">
                    <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 md:gap-6">
                        <div v-for="product in products" :key="product.id" class="h-full">
                            <button
                                @click="isOpen = true; selectedProduct = product"
                                class="bg-white rounded-xl md:rounded-2xl border border-gray-200/60 flex flex-col h-full w-full overflow-hidden text-left hover:shadow-md transition-shadow group"
                            >
                                <div class="h-28 md:h-40 overflow-hidden relative bg-gray-100">
                                    <img :src="product.image" class="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                </div>
                                
                                <div class="p-2 md:p-4 flex flex-col flex-grow">
                                    <h3 class="text-gray-800 font-bold text-xs md:text-base line-clamp-1">{{ product.name }}</h3>
                                    <p class="hidden md:block text-gray-500 text-xs line-clamp-2 mt-1">{{ product.description }}</p>
                                    <div class="mt-auto pt-2 font-bold text-blue-600 text-sm md:text-base">
                                        R$ {{ product.sizes[0].price }}
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </main>

        <div v-if="hasOrder" class="fixed bottom-0 w-full bg-black max-h-1/2 ">

            <div class="bg-gray-700 w-full py-2 px-4">
                <div class="grid grid-cols-5 ">
                    <div class="font-bold text-xl text-white border-r border-gray-200 text-center">Produto</div>
                    <div class="font-bold text-xl text-white border-r border-gray-200 text-center">Tamanho</div>
                    <div class="font-bold text-xl text-white border-r border-gray-200 text-center">Quantidade</div>
                    <div class="font-bold text-xl text-white border-r border-gray-200 text-center">Preço</div>
                    <div class="font-bold text-xl text-white border-r border-gray-200 text-center">Ações</div>
                </div>
            </div>
    
            <div class="p-4">
                    
                <div class="grid grid-cols-5 gap-2">
                    <template v-for="(item, index) in items" :key="index">
                        <div class="font-medium text-white p-2 border-gray-200 text-center">{{ item.name }}</div>
                        <div class="font-medium text-white p-2 border-gray-200 text-center">{{ item.size }}</div>
                        <div class="font-medium text-white p-2 border-gray-200 text-center">{{ item.amount }}</div>
                        <div class="font-medium text-white p-2 border-gray-200 text-center">R${{ item.price }}</div>
                        <button @click="removeItem(index)" type="button" class="text-red-400 hover:text-red-600 self-end sm:self-center flex items-center justify-center" title="Remover tamanho"><Trash2 :size="16" /></button>
                    </template>
                </div>

                <div class="flex justify-between items-center pt-2 border-t border-gray-700">
                    <div class="text-white">
                        <span class="font-bold">Total: </span>
                        <span class="text-xl font-bold text-green-400">
                            R$ {{ calculateTotal().toFixed(2) }}
                        </span>
                    </div>
                    
                    <button 
                        @click="endOrder"
                        class="font-medium text-white px-6 py-2 rounded transition-colors"
                        :style="{background: localStorageService.getButtonColors()}"
                    > 
                        Finalizar Pedido
                    </button>
                </div>
            </div>
        </div>

        <Teleport to="body">
            <div v-if="isOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 " style="z-index: 9999;">
                <div class="bg-white p-4 rounded-lg max-w-xl w-full gap-2 mb-1">
                    <div class="flex flex-col items-center justify-center gap-2 mb-3">
                        <img :src="selectedProduct.image" class="button-icon w-4/5 h-18 object-contain max-w-full max-h-full"/>
                        <span class="text-lg text-black">{{ selectedProduct.description }}</span>
                    </div>
                    <div class="flex justify-between w-fullgap-2 mb-4 items-baseline" v-for="(size, index) in selectedProduct.sizes">
                        <span class="font-medium text-black">{{ size.name + ' - R$ ' + size.price }}</span>    
                        <span class="font-bold text-black w-8 text-center"> {{ amount[selectedProduct.name + '-' + size.name] || 0 }}</span>                    
                        <div class="flex items-center">
                            <button 
                                @click="saveAmount(-1, selectedProduct, size)" 
                                class="w-8 h-8 font-bold text-lg text-black flex items-center justify-center transition-colors"
                            >
                                -
                            </button>
                            <span class="font-medium text-black w-8 text-center"> | </span>
                            <button 
                                @click="saveAmount(1, selectedProduct, size)" 
                                class="w-8 h-8 font-bold text-lg text-black flex items-center justify-center transition-colors"
                            >
                                +
                            </button>
                        </div>

                    </div>

                    <div class="flex justify-between w-full mb-1">
                        <button @click="cancelOrder" :style="{background: localStorageService.getButtonColors()}" class="text-black p-2 rounded">Cancelar</button>
                        <button @click="saveOrder" :style="{ background: items.length > 0 ? localStorageService.getButtonColors() : 'gray' }" class="text-black p-2 rounded">Salvar Pedido</button>
                    </div>
                </div>
            </div>
        </Teleport>

        <Teleport to="body">
            <div v-if="orderEnded" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="orderEnded = false"></div>
                
                <div class="relative bg-gray-50 rounded-[2rem] shadow-2xl max-w-4xl w-full h-[85vh] flex flex-col overflow-hidden">
                    
                    <header class="p-6 bg-white border-b border-gray-200 flex items-center justify-between">
                        <div>
                            <h2 class="text-2xl font-black text-gray-800 tracking-tight">Comandas Abertas</h2>
                            <p class="text-sm text-gray-500 font-medium">Selecione uma comanda para adicionar os itens</p>
                        </div>
                        <button @click="orderEnded = false" class="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                            <X :size="24" />
                        </button>
                    </header>

                    <div class="flex-grow p-6 overflow-y-auto custom-scrollbar">
                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            
                            <div 
                                v-for="comanda in comandaStore.comandas" 
                                :key="comanda.id"
                                class="group relative bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all overflow-hidden"
                            >
                                <button @click="updateComanda(comanda.id, items)" class="w-full text-left flex flex-col h-full">
                                    <div class="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                                        <span class="text-xs font-black uppercase tracking-widest text-blue-600">Mesa / ID</span>
                                        <span class="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">#{{ comanda.id }}</span>
                                    </div>

                                    <div class="p-4 flex-grow space-y-2">
                                        <div v-for="order in comanda.orders" :key="order.id" class="space-y-1">
                                            <div v-for="item in order.items" :key="item.name" class="flex justify-between text-sm">
                                                <span class="text-gray-500 font-medium">{{ item.amount }}x</span>
                                                <span class="flex-grow ml-2 text-gray-700 truncate">{{ item.name }}</span>
                                            </div>
                                        </div>
                                        <div v-if="comanda.orders.length === 0" class="text-gray-300 italic text-xs py-4 text-center">
                                            Comanda vazia
                                        </div>
                                    </div>

                                    <div class="p-4 mt-auto bg-blue-50/50 flex justify-between items-center group-hover:bg-blue-600 transition-colors">
                                        <span class="text-xs font-bold text-blue-400 group-hover:text-blue-100 uppercase">Total</span>
                                        <span class="text-lg font-black text-blue-700 group-hover:text-white">
                                            R$ {{ comanda.total }}
                                        </span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>

                    <footer class="p-6 bg-white border-t border-gray-200 flex flex-col sm:flex-row gap-3">
                        <button 
                            @click="addComanda(items)"
                            class="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-green-100 transition-all flex items-center justify-center gap-2"
                        >
                            <PlusCircle :size="20" />
                            Criar Nova Comanda
                        </button>

                        <button 
                            @click="orderEnded = false" 
                            class="sm:w-1/3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-4 rounded-2xl transition-all"
                        >
                            Voltar ao Cardápio
                        </button>
                    </footer>
                </div>
            </div>
        </Teleport>
    
    </div>
    
</template>