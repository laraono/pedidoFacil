import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useComandaStore = defineStore('comanda', () => {

    const comandas = ref([])
    const orders = ref([])

    const addComanda = (order) => {
        comandas.value.push({ orders: [order], id: Date.now(), total: order.price });
    };

    const updateComanda = (id, order, totalPrice) => {
        console.log('antes do update: ', comandas.value)

        console.log('id - ', id)
        console.log('totalPrice - ', totalPrice)
        console.log('order - ', order)

        const index = comandas.value.findIndex(c => c.id === id);
        console.log('index - ', index)

        if (index !== -1) {
            comandas.value[index].orders.push(order)
            comandas.value[index].total += totalPrice
        }

        console.log('depois do update: ', comandas.value)
    };

    const removeComanda = (id) => {
        comandas.value = comandas.value.filter(c => c.id !== id);
    };

    return {
        comandas,
        addComanda,
        updateComanda,
        removeComanda
    };
});