import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { request } from '@/services/api';
import { connectSocket, getSocket } from '@/services/socket';

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'finished' | 'cancelled';

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

export interface KitchenOrderItem {
  name: string;
  variationName: string;
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
  userId?: number;
  user?: { id: number };
  source?: string;
}

export const useKitchenStore = defineStore('kitchen', () => {
  const orders = ref<KitchenOrder[]>([]);

  const pendingOrders = computed(() => orders.value.filter(o => o.status === 'pending'));
  const preparingOrders = computed(() => orders.value.filter(o => o.status === 'preparing'));
  const readyOrders = computed(() => orders.value.filter(o => o.status === 'ready'));

  async function fetchOrders() {
    try {
      const data = await request('/orders');
      if (!data) return;
      let allOrders: KitchenOrder[] = [];

      data.forEach((pedido: any) => {
        const mappedStatus = dbToFrontMap[pedido.status?.nome];
        if (mappedStatus && mappedStatus !== 'finished' && mappedStatus !== 'cancelled') {
          const rawDate = pedido.created_at;
          const parsedDate = rawDate
            ? new Date(typeof rawDate === 'string' ? rawDate.replace(' ', 'T') : rawDate)
            : null;
          const createdAt = parsedDate && !isNaN(parsedDate.getTime()) ? parsedDate : new Date();

          allOrders.push({
            id: pedido.id,
            comandaId: pedido.comanda?.id || 0,
            comanda: pedido.comanda?.description || `Totem #${pedido.id}`,
            waiter: pedido.serviceType === 'AUTOATENDIMENTO' || pedido.serviceType === 'TOTEM' || pedido.serviceType === 'Autoatendimento' ? 'Totem' : (pedido.serviceType || 'Balcão'),
            source: pedido.serviceType === 'Autoatendimento' ? 'totem' : undefined,
            status: mappedStatus,
            createdAt,
            userId: pedido.createdBy?.id,
            user: pedido.createdBy ? { id: pedido.createdBy.id } : undefined,
            items: pedido.productOrders?.map((po: any) => ({
              name: po.product?.name || 'Produto Excluído',
              variationName: po.productVariation?.name || '',
              amount: po.quantity,
              obs: po.observation || '',
            })) || []
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
        body: { status: newDbStatus } as any 
      });
      
      order.status = targetFrontendCol;

      if (targetFrontendCol === 'finished' || targetFrontendCol === 'cancelled') {
        orders.value = orders.value.filter(o => o.id !== id);
      }
    } catch (error) {
      console.error("Erro ao mover pedido:", error);
      order.status = previousStatus; 
    }
  }

  async function finishOrder(id: number, cancelReason: string | null = null) {
    const order = orders.value.find(o => o.id === id);
    if (!order) return;

    try {
      if (cancelReason) {
        await request(`/commands/${order.comandaId}/orders/${id}/cancel`, {
          method: 'POST',
          body: JSON.stringify({ cancellationDescription: cancelReason }),
        });
      } else {
        await request(`/commands/${order.comandaId}/orders/${id}`, {
          method: 'PUT',
          body: JSON.stringify({ status: 'Finalizado' }),
        });
      }
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
        waiter: data.source === 'totem' ? 'Totem' : (data.source || 'Caixa/Web'),
        source: data.source || undefined,
        status: 'pending',
        createdAt: data.createdAt ? (() => { const d = new Date(typeof data.createdAt === 'string' ? data.createdAt.replace(' ', 'T') : data.createdAt); return isNaN(d.getTime()) ? new Date() : d; })() : new Date(),
        userId: data.userId || data.user?.id,
        user: data.user ? { id: data.user.id } : undefined,
        items: (data.items || []).map((i: any) => ({
          name: i.name || 'Produto',
          variationName: i.variationName || '',
          amount: i.quantity || 1,
          obs: i.observation || '',
        })),
      };

      addOrder(newOrder);
      if (typeof onNewOrder === 'function') onNewOrder(newOrder);
    });

    socket.on('order_status_updated', (data: any) => {
      console.log('[Kitchen Socket] Status atualizado:', data);
      
      const order = orders.value.find(o => o.id === data.orderId);
      if (!order) return;

      const mappedStatus = dbToFrontMap[data.status];
      if (mappedStatus) {
        order.status = mappedStatus;

        if (mappedStatus === 'finished' || mappedStatus === 'cancelled') {
          orders.value = orders.value.filter(o => o.id !== data.orderId);
        }
      }
    });
  }

  function destroyKitchenSocket() {
    const socket = getSocket();
    if (socket) {
      socket.off('new_order');
      socket.off('order_status_updated');
    }
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