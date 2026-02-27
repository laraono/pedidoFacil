<script setup>
import localStorageService from '@/services/localStorageService';
import { ref, computed, onMounted } from 'vue';
import { useMenuStore } from '@/stores/productsManagement';
import { useComandaStore } from '@/stores/comandaManagement';
import { useKitchenStore } from '@/stores/kitchen';

const imageUrl = ref('');

const produtos = ref([]);

const selectedProduto = ref({})

const amount = ref([])

const isOpen = ref(false)

const hasPedido = ref(false)

const pedidoEnded = ref(false)

const itens = ref([])

const order = ref({})

const menuStore = useMenuStore();

const comandaStore = useComandaStore();

const kitchenStore = useKitchenStore()

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
    
    const existingItemIndex = itens.value.findIndex(
        item => item.produto === product.name && item.size === size.name
    )

    if(amount.value[key] !== 0) {
        if (existingItemIndex !== -1) {
            itens.value[existingItemIndex].amount = amount.value[key]
            itens.value[existingItemIndex].price = amount.value[key] * size.price
        } else {
            itens.value.push({
                name: product.name, 
                tamanho: size.name, 
                qtd: amount.value[key],
                preco: amount.value[key] * size.price
            })

        }
    }
}

const endOrder = () => {

    let total = 0

    itens.value.map((item) => console.log(item.preco))

    itens.value.map((item) =>  total += item.preco)

    order.value = {
      mesa: `Mesa ${Math.floor(Math.random() * 20) + 1}`,
      garcom: 'Sistema',
      status: 'pending',
      createdAt: new Date(),
      preco: total,
      itens: itens.value
    };

    pedidoEnded.value = true
    amount.value = []

}

const cancelOrder = () => {
    isOpen.value = false

    itens.value = []
    amount.value = []
}

const saveOrder = () => {    
    hasPedido.value = true
    isOpen.value = false
    amount.value = []
}

const calculateTotal = () => {
    return itens.value.reduce((sum, item) => sum + (item.preco || 0), 0)
}


const addComanda = () => {
    comandaStore.addComanda(order.value)

    kitchenStore.addOrder(order.value)

    order.value = ({})

    hasPedido.value =false
}

const updateComanda = (id, order) => {
    comandaStore.updateComanda(id, order, calculateTotal())

    itens.value = []

    hasPedido.value = false    
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
            <div class="flex flex-col  items-center py-4 h-screen overflow-auto p-4">
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
                    <button 
                        @click="isOpen = true, selectedProduto = produto" class="image-button flex flex-col items-center justify-center w-full h-full p-4 " 
                        :style="{background: localStorageService.getButtonColors()}"
                    >
                            <img :src="produto.image" class="button-icon object-contain max-w-full max-h-full"/>
                            <div class="flex justify-between w-full mb-1">
                                <span class="font-medium">{{ produto.name }}</span>
                                <span class="font-semibold"> {{ 'R$ ' + produto.sizes[0].price }}</span>
                            </div>
                            <span class="text-sm ">{{ produto.description }}</span>
                    </button>
                </div>            
            </div>
        
        </div>

        <div v-if="hasPedido" class="fixed bottom-0 w-full bg-black p-4">
            <div class="flex justify-between w-full mb-1">
                <span class="font-bold text-white"> Produto </span>
                <span class="font-bold text-white"> Tamanho </span>
                <span class="font-bold text-white"> Quantidade </span>
                <span class="font-bold text-white"> Preço </span>

            </div>
            <div class="flex justify-between w-full mb-1" v-for="item in itens">
                <span class="font-medium text-white">{{ item.produto }}</span>
                <span class="font-medium text-white">{{ item.tamanho }}</span>
                <span class="font-medium text-white">{{ item.qtd }}</span>
                <span class="font-medium text-white"> {{'R$' + item.preco }}</span>
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

        <Teleport to="body">
            <div v-if="isOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
                <div class="bg-white p-4 rounded-lg max-w-2xl w-full">
                    <h2 class="text-black font-bold">{{ selectedProduto.name }}</h2>
                    <div class="flex justify-between w-full mb-1" v-for="(size, index) in selectedProduto.sizes">
                        <span class="font-medium text-black">{{ size.name }}</span>
                        <span class="font-medium text-black"> {{ 'R$ ' + size.price }}</span>
                        <div class="flex justify-between">
                            <button @click="saveAmount(-1, selectedProduto, size)" class="font-medium text-black"> - </button>
                            <span class="font-medium text-black"> {{ amount[selectedProduto.name + '-' + size.name] || 0   }}</span>
                            <button @click="saveAmount(1, selectedProduto, size)" class="font-medium text-black"> + </button>
                        </div>
                        
                    </div>
                    <div class="flex justify-between w-full mb-1">
                        <button @click="cancelOrder" :style="{background: localStorageService.getButtonColors()}" class="text-black p-2">Cancelar</button>
                        <button @click="saveOrder" :style="{background: localStorageService.getButtonColors()}" class="text-black p-2">Salvar Pedido</button>
                    </div>
                </div>
            </div>
        </Teleport>


        <Teleport to="body">
            <div v-if="pedidoEnded" class="fixed inset-0 flex items-center justify-center p-4">
                <div class="bg-white p-4 rounded-lg max-w-4xl w-full ">
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                        <div class="flex item-start justify-between mb-1 bg-green-600 p-4 rounded-lg" v-for="comanda in comandaStore.comandas">
                            <button @click="updateComanda(comanda.id, itens)" class="w-full">
                                    <h2 class="text-white font-bold text-lg">{{ 'Comanda ' + comanda.id }}</h2>
                                <div class="flex flex-col w-full p-2" v-for="order in comanda.orders">
                                    <div class="flex flex-col w-full p-2" v-for="item in order.itens">
                                        <div class="flex justify-between w-full">
                                            <span class="font-bold text-white">{{ item.qtd + 'x' }}</span>
                                            <span class="font-bold text-white">{{ item.name }}</span>
                                        </div>
                                    </div>
                                </div>          
                                <span class="font-medium text-white text-right block w-full p-2"> 
                                    {{ 'R$ ' + comanda.total }}
                                </span>
                            </button>
                        </div>
                    </div>

                    <div class="flex justify-between w-full mb-1">
                        <button 
                            @click="addComanda(itens)"
                            :style="{background: localStorageService.getButtonColors()}" class="text-black p-2"
                        >
                            Criar Comanda
                        </button>

                        <button 
                            @click="pedidoEnded = false" 
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