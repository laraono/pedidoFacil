import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { connectSocket, disconnectSocket, getSocket } from '../services/socket';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const STATUS_MAP = {
    pending:   'Aguardando_Preparo',
    preparing: 'Em_Preparo',
    ready:     'Pronto',
    finished:  'Finalizado',
    cancelled: 'Cancelado',
};

export const useKitchenStore = defineStore('kitchen', () => {

    const orders = ref([]);

    const pendingOrders   = computed(() => orders.value.filter(o => o.status === 'pending'));
    const preparingOrders = computed(() => orders.value.filter(o => o.status === 'preparing'));
    const readyOrders     = computed(() => orders.value.filter(o => o.status === 'ready'));

    function addOrder(order) {
        const already = orders.value.find(o => o.id === order.id);
        if (!already) {
            orders.value.push({ ...order, status: order.status || 'pending' });
        }
    }

    function finishOrder(id) {
        orders.value = orders.value.filter(o => o.id !== id);
    }

    async function moveOrder(id, newLocalStatus, comandaId, authToken) {
        const order = orders.value.find(o => o.id === id);
        if (!order) return;

        const previousStatus = order.status;
        order.status = newLocalStatus;

        try {
            const backendStatus = STATUS_MAP[newLocalStatus];
            if (!backendStatus) throw new Error(`Status inválido: ${newLocalStatus}`);

            await axios.put(
                `${API_URL}/api/v1/commands/${comandaId}/orders/${id}`,
                { status: backendStatus },
                {
                    headers: { Authorization: `Bearer ${authToken}` },
                    withCredentials: true,
                }
            );

            if (newLocalStatus === 'finished' || newLocalStatus === 'cancelled') {
                finishOrder(id);
            }

        } catch (err) {
            console.error('[Kitchen] Erro ao atualizar status:', err);
            order.status = previousStatus;
        }
    }

    function initKitchenSocket(onNewOrder) {
        connectSocket('kitchen');
        const socket = getSocket();

        socket.on('new_order', (data) => {
            console.log('[Kitchen Socket] Novo pedido recebido:', data);

            const newOrder = {
                id: data.orderId,
                comandaId: data.comandaId,
                comanda: data.comandaLabel,
                waiter: data.source === 'mobile' ? 'Totem' : 'Garçom',
                status: 'pending',
                createdAt: new Date(data.createdAt),
                items: (data.items || []).map(i => ({
                    name: i.productName || `Produto #${i.productId}`,
                    amount: i.quantity,
                    obs: i.observation || '',
                })),
            };

            addOrder(newOrder);

            if (typeof onNewOrder === 'function') onNewOrder(newOrder);
        });
    }

    function destroyKitchenSocket() {
        const socket = getSocket();
        if (socket) socket.off('new_order');
        disconnectSocket();
    }

    return {
        orders,
        pendingOrders,
        preparingOrders,
        readyOrders,
        addOrder,
        finishOrder,
        moveOrder,
        initKitchenSocket,
        destroyKitchenSocket,
    };
});
