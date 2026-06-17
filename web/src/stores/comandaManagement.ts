import { defineStore } from 'pinia';
import { ref } from 'vue';
import { comandaApi } from '@/services/comandaApi';

export interface ComandaOrder {
  price: number;
  [key: string]: any;
}

export interface Comanda {
  id: number;
  label: string;
  customerName?: string;
  isAutoatendimento?: boolean;
  orders: ComandaOrder[];
  total: number;
  closedAt?: any;
  paymentDetails?: any;
  discountType?: string | null;
  discountValue?: number | null;
  coupon?: any | null;
}

export const useComandaStore = defineStore('comanda', () => {

    const comandas = ref<Comanda[]>([]);

    async function loadComandas() {
        try {
            const response = await comandaApi.listOpen();
            if (!response) return;

            comandas.value = response.map((c: any) => ({
                id: c.id,
                label: c.description,
                customerName: c.customerName ?? undefined,
                isAutoatendimento: !!c.isAutoatendimento,
                total: Number(c.total),
                orders: c.pedidos || [],
                discountType: c.discountType || c.Tipo_Desconto_Aplicado || null,
                discountValue: Number(c.discountValue || c.Valor_Desconto_Aplicado || 0),
                coupon: c.coupon || null,
            }));
        } catch (error) {
            console.error("Erro ao carregar comandas do banco:", error);
        }
    }

    function createComanda(label?: string): Comanda {
        const id = Date.now();
        const comanda: Comanda = { orders: [], id, label: label || `#${id}`, total: 0 };
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