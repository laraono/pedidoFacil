import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface ComandaOrder {
  price: number;
  [key: string]: unknown;
}

export interface Comanda {
  id: number;
  label: string;
  orders: ComandaOrder[];
  total: number;
}

export const useComandaStore = defineStore('comanda', () => {

    const comandas = ref<Comanda[]>([]);

    function createComanda(label?: string): Comanda {
        const id = Date.now();
        const comanda: Comanda = { orders: [], id, label: label || `Comanda #${id}`, total: 0 };
        comandas.value.push(comanda);
        return comanda;
    }

    function addComanda(order: ComandaOrder, label?: string): Comanda {
        const comanda = createComanda(label);
        comanda.orders.push(order);
        comanda.total = order.price;
        return comanda;
    }

    function updateComanda(id: number, order: ComandaOrder): void {
        const comanda = comandas.value.find(c => c.id === id);
        if (comanda) {
            comanda.orders.push(order);
            comanda.total += order.price;
        }
    }

    function removeComanda(id: number): void {
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
