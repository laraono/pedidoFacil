import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { request } from '@/services/api';
import { comandaApi } from '@/services/comandaApi';
import { connectSocket, disconnectSocket, getSocket } from '@/services/socket';

const dbToFrontMap: Record<string, OrderStatus> = {
  'Aguardando_Preparo': 'pending',
  'Em_Preparo': 'preparing',
  'Pronto': 'ready',
  'Finalizado': 'finished',
  'Cancelado': 'cancelled'
};

const frontToDbMap: Record<string, string> = {
  'pending': 'Aguardando_Preparo',
  'preparing': 'Em_Preparo',
  'ready': 'Pronto',
  'finished': 'Finalizado',
  'cancelled': 'Cancelado'
};

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'finished' | 'cancelled';

export interface KitchenOrderItem {
  name: string;
  amount: number;
  obs: string;
}

export interface KitchenOrder {
  id: number;
  comandaId: number;
  comanda: string;
  waiter: string;
  status: OrderStatus;
  createdAt: Date;
  items: KitchenOrderItem[];
}

export const useKitchenStore = defineStore('kitchen', () => {
  const orders = ref<KitchenOrder[]>([]);

    function initKitchenSocket(onNewOrder) {
        connectSocket('kitchen');
        const socket = getSocket();

        socket.on('new_order', (data) => {
            console.log('[Kitchen Socket] Novo pedido recebido:', data);

  async function fetchOrders() {
    try {
      const comandas = await comandaApi.listByStatus('Aberta');
      let allOrders: KitchenOrder[] = [];

      comandas.forEach((comanda: any) => {
        if (comanda.pedidos && comanda.pedidos.length > 0) {
          comanda.pedidos.forEach((pedido: any) => {
            const mappedStatus = dbToFrontMap[pedido.status];
            if (mappedStatus && mappedStatus !== 'finished' && mappedStatus !== 'cancelled') {
              allOrders.push({
                id: pedido.id,
                comandaId: comanda.id,
                comanda: comanda.description || `Comanda #${comanda.id}`,
                waiter: pedido.serviceType || 'Garçom',
                status: mappedStatus,
                createdAt: pedido.created_at ? new Date(pedido.created_at) : new Date(),
                items: pedido.productOrders?.map((po: any) => ({
                  name: po.product?.name || 'Item',
                  amount: po.quantity,
                  obs: po.observation || ''
                })) || []
              });
            }
          });
        }
      });

      orders.value = allOrders;
    } catch (error) {
      console.error("Erro ao buscar pedidos da cozinha:", error);
    }
  }

  function addOrder(order: KitchenOrder) {
    const already = orders.value.find(o => o.id === order.id);
    if (!already) {
      orders.value.push({ ...order, status: order.status || 'pending' });
    }
  }

  async function moveOrder(id: number, targetFrontendCol: OrderStatus) {
    const order = orders.value.find(o => o.id === id);
    if (!order) return;

    const previousStatus = order.status;
    const newDbStatus = frontToDbMap[targetFrontendCol];

    try {
      await request(`/commands/${order.comandaId}/orders/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newDbStatus })
      });
      
      order.status = targetFrontendCol;

      if (targetFrontendCol === 'finished' || targetFrontendCol === 'cancelled') {
        finishOrder(id);
      }

    } catch (error) {
      console.error("Erro ao mover pedido:", error);
      order.status = previousStatus; 
    }
  }

  async function finishOrder(id: number, cancelReason: string | null = null) {
    const order = orders.value.find(o => o.id === id);
    if (!order) return;

    const finalStatus = cancelReason ? 'Cancelado' : 'Finalizado';

    try {
      await request(`/commands/${order.comandaId}/orders/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          status: finalStatus,
          cancellationDescription: cancelReason
        })
      });
      
      orders.value = orders.value.filter(o => o.id !== id);
    } catch (error) {
      console.error("Erro ao finalizar pedido:", error);
    }
  }

  function initKitchenSocket(onNewOrder?: (order: KitchenOrder) => void) {
    connectSocket('kitchen');
    const socket = getSocket();

    if (!socket) return;

    socket.on('new_order', (data: any) => {
      console.log('[Kitchen Socket] Novo pedido recebido:', data);

      const newOrder: KitchenOrder = {
        id: data.orderId,
        comandaId: data.comandaId,
        comanda: data.comandaLabel,
        waiter: data.source === 'mobile' ? 'Totem' : (data.source || 'Caixa/Web'),
        status: 'pending',
        createdAt: new Date(data.createdAt),
        items: (data.items || []).map((i: any) => ({
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
    fetchOrders,
    addOrder,
    moveOrder,
    finishOrder,
    initKitchenSocket,
    destroyKitchenSocket
  };
});
