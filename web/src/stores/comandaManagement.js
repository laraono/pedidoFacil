import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useComandaStore = defineStore('comanda', () => {

    const comandas = ref([]);

    const addComanda = (order, totalPrice) => {
        comandas.value.push({ orders: order, id: Date.now(), totalPrice: totalPrice });

        console.log(comandas.value)
    };

    const updateComanda = (id, order, totalPrice) => {
        const index = comandas.value.findIndex(c => c.id === id);
        if (index !== -1) {
            comandas.value[index].orders.push(...order)
            comandas.value[index].totalPrice += totalPrice
        }
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