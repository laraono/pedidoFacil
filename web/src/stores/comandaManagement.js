import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useComandaStore = defineStore('comanda', () => {
    const comandas = ref([]);

    // Centraliza o cálculo para garantir precisão decimal
    const calculateTotal = (orders) => {
        return orders.reduce((acc, order) => acc + (order.price || 0), 0);
    };

    const addComanda = (order) => {
        const newId = comandas.value.length > 0 
            ? Math.max(...comandas.value.map(c => c.id)) + 1 
            : 1;

        comandas.value.push({ 
            id: newId, 
            orders: [order], 
            total: order.price,
            createdAt: new Date().toISOString()
        });
    };

    const updateComanda = (id, newOrder) => {
        const comanda = comandas.value.find(c => c.id === id);
        if (comanda) {
            comanda.orders.push(newOrder);
            // Recalcula o total na store, evitando erros da UI
            comanda.total = calculateTotal(comanda.orders);
        }
    };

    return { comandas, addComanda, updateComanda };
});