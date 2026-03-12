import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useComandaStore = defineStore('comanda', () => {

    const comandas = ref([])

    function addComanda(order) {
        comandas.value.push({ orders: [order], id: comandas.value.length, total: order.price });
    };

    function updateComanda(id, order, totalPrice) {
        const index = comandas.value.findIndex(c => c.id === id);

        if (index !== -1) {
            comandas.value[index].orders.push(order)
            comandas.value[index].total += totalPrice
        }

    };

    function removeComanda(id) {
        comandas.value = comandas.value.filter(c => c.id !== id);
    };

    return {
        comandas,
        addComanda,
        updateComanda,
        removeComanda
    };
});