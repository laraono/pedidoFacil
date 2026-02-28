import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useKitchenStore = defineStore('kitchen', () => {
  const orders = ref([
    {
      id: 101,
      table: 'Mesa 04',
      waiter: 'Carlos',
      status: 'pending', // Estados: pending, preparing, ready
      createdAt: new Date(Date.now() - 1000 * 60 * 15), // 15 min atrás
      items: [
        { name: 'X-Bacon', amount: 2, obs: 'Sem cebola' },
        { name: 'Coca-Cola Zero', amount: 2, obs: '' }
      ]
    },
    {
      id: 102,
      table: 'Balcão',
      waiter: 'Ana',
      status: 'preparing',
      createdAt: new Date(Date.now() - 1000 * 60 * 5), // 5 min atrás
      items: [
        { name: 'Isca de Peixe', amount: 1, obs: 'Molho extra' }
      ]
    }
  ]);

  // Getters para separar as colunas do Kanban
  const pendingOrders = computed(() => orders.value.filter(o => o.status === 'pending'));
  const preparingOrders = computed(() => orders.value.filter(o => o.status === 'preparing'));
  const readyOrders = computed(() => orders.value.filter(o => o.status === 'ready'));

  // Actions
  function moveOrder(id, newStatus) {
    const order = orders.value.find(o => o.id === id);
    if (order) {
      order.status = newStatus;
    }
  }

  function addOrder(order) {
    orders.value.push({...order, id: orders.value.length + 1})
  }

  function finishOrder(id) {
    // Remove da tela (arquiva)
    orders.value = orders.value.filter(o => o.id !== id);
  }

  // --- SIMULAÇÃO DE WEBSOCKET ---
  // Em produção, isso seria substituído por: socket.on('new_order', (data) => orders.value.push(data))
  function incomingOrderMock() {
    const newId = Math.floor(Math.random() * 1000) + 200;
    const newOrder = {
      id: newId,
      mesa: `Mesa ${Math.floor(Math.random() * 20) + 1}`,
      waiter: 'Sistema',
      status: 'pending',
      createdAt: new Date(),
      items: [
        { name: 'Hambúrguer Artesanal', amount: 1, obs: 'Ao ponto' },
        { name: 'Batata Frita', amount: 1, obs: '' }
      ]
    };
    orders.value.push(newOrder);
    return true; // Retorna true para avisar que chegou um novo pedido
  }

  return { 
    orders, 
    pendingOrders, 
    preparingOrders, 
    readyOrders, 
    moveOrder, 
    finishOrder,
    incomingOrderMock,
    addOrder
  };
});