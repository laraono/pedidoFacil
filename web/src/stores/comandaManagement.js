import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useComandaStore = defineStore('comanda', () => {

    const comandas = ref([]);

    function createComanda(label) {
        const id = Date.now();
        const comanda = { orders: [], id, label: label || `Comanda #${id}`, total: 0 };
        comandas.value.push(comanda);
        return comanda;
    }

    function addComanda(order, label) {
        const comanda = createComanda(label);
        comanda.orders.push(order);
        comanda.total = order.price;
        return comanda;
    }

    function updateComanda(id, order) {
        const comanda = comandas.value.find(c => c.id === id);
        if (comanda) {
            comanda.orders.push(order);
            comanda.total += order.price;
        }
    }

    function removeComanda(id) {
        comandas.value = comandas.value.filter(c => c.id !== id);
    }

    return {
        comandas,
        createComanda,
        addComanda,
        updateComanda,
        removeComanda
    };
});
