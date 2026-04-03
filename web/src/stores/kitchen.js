import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { request } from '@/services/api';
import { comandaApi } from '@/services/comandaApi';

export const useKitchenStore = defineStore('kitchen', () => {
  const orders = ref([]);

  const dbToFrontMap = {
    'Aguardando_Preparo': 'pending',
    'Em_Preparo': 'preparing',
    'Pronto': 'ready'
  };

  const frontToDbMap = {
    'pending': 'Aguardando_Preparo',
    'preparing': 'Em_Preparo',
    'ready': 'Pronto'
  };

  const pendingOrders = computed(() => orders.value.filter(o => o.status === 'pending'));
  const preparingOrders = computed(() => orders.value.filter(o => o.status === 'preparing'));
  const readyOrders = computed(() => orders.value.filter(o => o.status === 'ready'));

  async function fetchOrders() {
    try {
      const comandas = await comandaApi.listByStatus('Aberta');
      let allOrders = [];

      comandas.forEach(comanda => {
        if (comanda.pedidos && comanda.pedidos.length > 0) {
          comanda.pedidos.forEach(pedido => {
            if (dbToFrontMap[pedido.status]) {
              allOrders.push({
                id: pedido.id,
                comandaId: comanda.id,
                comanda: comanda.description || `Comanda #${comanda.id}`,
                waiter: pedido.serviceType,
                status: dbToFrontMap[pedido.status],
                createdAt: pedido.created_at || new Date(),
                items: pedido.productOrders?.map(po => ({
                  name: po.product?.name || 'Item',
                  amount: po.quantity,
                  obs: po.observation
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

  async function moveOrder(id, targetFrontendCol) {
    const order = orders.value.find(o => o.id === id);
    if (!order) return;

    const newDbStatus = frontToDbMap[targetFrontendCol];

    try {
      await request(`/commands/${order.comandaId}/orders/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newDbStatus })
      });
      
      order.status = targetFrontendCol;
    } catch (error) {
      console.error("Erro ao mover pedido:", error);
    }
  }

  async function finishOrder(id, cancelReason = null) {
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

  function incomingOrderMock() {
    fetchOrders();
    return true; 
  }

  return {
    orders,
    pendingOrders,
    preparingOrders,
    readyOrders,
    fetchOrders,
    moveOrder,
    finishOrder,
    incomingOrderMock
  };
});