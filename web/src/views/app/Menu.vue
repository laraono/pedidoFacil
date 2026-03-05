<script setup>
import localStorageService from '@/services/localStorageService';
import { ref, computed, onMounted } from 'vue';
import { useMenuStore } from '@/stores/productsManagement';
import { useComandaStore } from '@/stores/comandaManagement';
import { useKitchenStore } from '@/stores/kitchen';
import { getEstablishmentMock, initMockEstablishment } from '@/mock/stablishmentmock'; 

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
        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
    <div 
        class="relative w-full h-30  overflow-hidden  group"
        :style="backgroundStyle"
    >
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        
        <div class="relative h-full flex items-center justify-center p-8 text-white">

        <h2 class="text-3xl md:text-4xl font-bold mb-4 drop-shadow-lg">
            {{ establishmentName }}
        </h2>
        
        </div>
        
    </div>

    <div class="flex w-full h-lvh">
        <div 
            class="w-32 md:w-32 lg:w-48 h-lvh transform transition-all duration-300 overflow-hidden"
            :style="{ background: localStorageService.getCategoryColors() }"
        >
            <div class="grid grid-cols-1 items-center py-4 h-screen overflow-auto p-4">
                <div v-for="category in menuStore.categories" :key="category.id" >
                    <button @click="selectCategory(category.id)" class="image-button flex flex-col items-center justify-center w-full h-full p-2">
                        <img :src="category.image" class="button-icon w-4/5 h-18 object-contain max-w-full max-h-full"/>
                        <span class="font-semibold text-2xl">{{ category.name }}</span>
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
                            <div class="flex justify-between w-full mb-1">
                                <span class="font-medium">{{ product.name }}</span>
                                <span class="font-semibold"> {{ 'R$ ' + product.sizes[0].price }}</span>
                            </div>
                            <span class="text-sm ">{{ product.description }}</span>
                    </button>
                </div>            
            </div>
        
        </div>

        <div v-if="hasOrder" class="fixed bottom-0 w-full bg-black">

            <div class="bg-gray-700 w-full py-2 px-4">
                <div class="grid grid-cols-4">
                    <div class="font-bold text-xl text-white">Produto</div>
                    <div class="font-bold text-xl text-white">Tamanho</div>
                    <div class="font-bold text-xl text-white">Quantidade</div>
                    <div class="font-bold text-xl text-white">Preço</div>
                </div>
            </div>
    
            <div class="p-4">
                    
                <div class="grid grid-cols-4 gap-2">
                    <template v-for="item in items">
                        <div class="font-medium text-white p-2">{{ item.name }}</div>
                        <div class="font-medium text-white p-2">{{ item.size }}</div>
                        <div class="font-medium text-white p-2">{{ item.amount }}</div>
                        <div class="font-medium text-white p-2">R${{ item.price }}</div>
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
            <div v-if="isOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
                <div class="bg-white p-4 rounded-lg max-w-2xl w-full">
                    <h2 class="text-black font-bold">{{ selectedProduct.name }}</h2>
                    <div class="flex justify-between w-full mb-1" v-for="(size, index) in selectedProduct.sizes">
                        <span class="font-medium text-black">{{ size.name }}</span>
                        <span class="font-medium text-black"> {{ 'R$ ' + size.price }}</span>
                        
                        <div class="flex items-center gap-2">
                            <button 
                                @click="saveAmount(-1, selectedProduct, size)" 
                                class="w-8 h-8 rounded-full font-bold text-lg flex items-center justify-center transition-colors"
                                :style="{background: localStorageService.getButtonColors()}"
                            >
                                -
                            </button>
                            <span class="font-medium text-black w-8 text-center"> {{ amount[selectedProduct.name + '-' + size.name] || 0 }}</span>
                            <button 
                                @click="saveAmount(1, selectedProduct, size)" 
                                class="w-8 h-8 rounded-full font-bold text-lg flex items-center justify-center transition-colors"
                                :style="{background: localStorageService.getButtonColors()}"
                            >
                                +
                            </button>
                        </div>

                    </div>

                    <div class="flex justify-between w-full mb-1">
                        <button @click="cancelOrder" :style="{background: localStorageService.getButtonColors()}" class="text-black p-2 rounded">Cancelar</button>
                        <button @click="saveOrder" :style="{background: localStorageService.getButtonColors()}" class="text-black p-2 rounded">Salvar Pedido</button>
                    </div>
                </div>
            </div>
        </Teleport>


        <Teleport to="body">
            <div v-if="orderEnded" class="fixed inset-0 flex items-center justify-center p-4">
                <div class="bg-white p-4 rounded-lg max-w-4xl w-full ">
                    <div class="flex item-start justify-center">
                        <h2 class="text-black font-bold text-2xl">Comandas Abertas</h2>
                    </div>
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                        <div class="flex item-start justify-between mb-1 bg-green-600 p-4 rounded-lg" v-for="comanda in comandaStore.comandas">
                            <button @click="updateComanda(comanda.id, items)" class="w-full">
                                    <div class="bg-green-500 w-full py-2 px-4">
                                        <h2 class="text-white font-bold text-lg">{{ 'Comanda ' + comanda.id }}</h2>
                                    </div>
                                <div class="flex flex-col w-full p-2" v-for="order in comanda.orders">
                                    <div class="flex flex-col w-full p-2" v-for="item in order.items">
                                        <div class="flex justify-between w-full">
                                            <span class="font-bold text-white">{{ item.amount + 'x' }}</span>
                                            <span class="font-bold text-white">{{ item.name }}</span>
                                        </div>
                                    </div>
                                </div>          
                                <span class="font-medium text-white text-right block w-full p-2 rounded"> 
                                    {{ 'R$ ' + comanda.total }}
                                </span>
                            </button>
                        </div>
                    </div>

                    <div class="flex justify-between w-full mb-1">
                        <button 
                            @click="addComanda(items)"
                            :style="{background: localStorageService.getButtonColors()}" class="text-black p-2"
                        >
                            Criar Comanda
                        </button>

                        <button 
                            @click="orderEnded = false" 
                            :style="{background: localStorageService.getButtonColors()}" class="text-black p-2"
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>

    
    </div>
    
</template>