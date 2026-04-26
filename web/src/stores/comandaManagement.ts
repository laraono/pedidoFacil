import { defineStore } from 'pinia';
import { ref } from 'vue';
import { comandaApi } from '@/services/comandaApi';

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

    async function loadComandas() {
        try {
            const response = await comandaApi.listByStatus('Aberta');
            
            comandas.value = response.map(c => ({
                id: c.id,
                label: c.description, 
                total: Number(c.total),
                orders: c.pedidos || [] 
            }));
        } catch (error) {
            console.error("Erro ao carregar comandas do banco:", error);
        }
    }

    function createComanda(label) {
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
        loadComandas, 
        createComanda,
        addComanda,
        updateComanda,
        removeComanda
    };
});