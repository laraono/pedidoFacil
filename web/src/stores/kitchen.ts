import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { request } from '@/services/api';
import { comandaApi } from '@/services/comandaApi';
import { connectSocket, disconnectSocket, getSocket } from '@/services/socket';

const dbToFrontMap = {
  'Aguardando_Preparo': 'pending',
  'Em_Preparo': 'preparing',
  'Pronto': 'ready',
  'Finalizado': 'finished',
  'Cancelado': 'cancelled'
};

const frontToDbMap = {
  'pending': 'Aguardando_Preparo',
  'preparing': 'Em_Preparo',
  'ready': 'Pronto',
  'finished': 'Finalizado',
  'cancelled': 'Cancelado'
};

export type OrderStatus = 'pending' | 'preparing' | 'ready';

export interface KitchenOrderItem {
  name: string;
  amount: number;
  obs: string;
}

export interface KitchenOrder {
  id: number;
  comanda: string;
  waiter: string;
  status: OrderStatus;
  createdAt: Date;
  items: KitchenOrderItem[];
}

export const useKitchenStore = defineStore('kitchen', () => {
  const orders = ref<KitchenOrder[]>([
    {
      id: 101,
      comanda: 'Mesa 04',
      waiter: 'Carlos',
      status: 'pending',
      createdAt: new Date(Date.now() - 1000 * 60 * 15),
      items: [
        { name: 'X-Bacon', amount: 2, obs: 'Sem cebola' },
        { name: 'Coca-Cola Zero', amount: 2, obs: '' }
      ]
    },
    {
      id: 102,
      comanda: 'Balcão',
      waiter: 'Ana',
      status: 'preparing',
      createdAt: new Date(Date.now() - 1000 * 60 * 5),
      items: [
        { name: 'Isca de Peixe', amount: 1, obs: 'Molho extra' }
      ]
    }
  ]);

  const pendingOrders = computed(() => orders.value.filter(o => o.status === 'pending'));
  const preparingOrders = computed(() => orders.value.filter(o => o.status === 'preparing'));
  const readyOrders = computed(() => orders.value.filter(o => o.status === 'ready'));

  function moveOrder(id: number, newStatus: OrderStatus): void {
    const order = orders.value.find(o => o.id === id);
    if (order) {
      order.status = newStatus;
    }
  }

  function addOrder(order: Omit<KitchenOrder, 'id'>): void {
    orders.value.push({...order, id: orders.value.length + 1});
  }

  function finishOrder(id: number): void {
    orders.value = orders.value.filter(o => o.id !== id);
  }

  // --- SIMULAÇÃO DE WEBSOCKET ---
  // Em produção, isso seria substituído por: socket.on('new_order', (data) => orders.value.push(data))
  function incomingOrderMock(): boolean {
    const newId = Math.floor(Math.random() * 1000) + 200;
    const newOrder: KitchenOrder = {
      id: newId,
      comanda: `Mesa ${Math.floor(Math.random() * 20) + 1}`,
      waiter: 'Sistema',
      status: 'pending',
      createdAt: new Date(),
      items: [
        { name: 'Hambúrguer Artesanal', amount: 1, obs: 'Ao ponto' },
        { name: 'Batata Frita', amount: 1, obs: '' }
      ]
    };
    orders.value.push(newOrder);
    return true;
  }

  return {
    orders,
    pendingOrders,
    preparingOrders,
    readyOrders,
    moveOrder,
    finishOrder,
    initKitchenSocket,
    destroyKitchenSocket
  };
});
