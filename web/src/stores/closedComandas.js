import { defineStore } from 'pinia';
import { ref } from 'vue';
import { comandaApi } from '@/services/comandaApi';

export const useClosedComandaStore = defineStore('closedComandas', () => {
  const closedComandas = ref([]);

  async function loadClosedComandas() {
    try {
      const response = await comandaApi.listByStatus('Fechada');

      const fetchedComandas = response.map(c => {
        const mappedOrders = (c.pedidos || []).map(p => {
          const items = (p.productOrders || []).map(po => ({
            name: po.product?.name || 'Item',
            amount: po.quantity || 1,
            price: Number(po.price || po.Preco_Unitario_Momento || 0)
          }));
          
          const orderPrice = items.reduce((sum, idx) => sum + (idx.price * idx.amount), 0);
          
          return { id: p.id, price: orderPrice, items };
        });

        return {
          id: c.id,
          label: c.description || `Comanda #${c.id}`,
          closedAt: c.deleted_at || c.created_at || new Date(),
          total: Number(c.total),
          orders: mappedOrders,
          paymentDetails: {
            discountType: c.Tipo_Desconto_Aplicado || 'percent',
            discountValue: Number(c.Valor_Desconto_Aplicado || 0),
            payments: [{ type: 'Liquidado', amount: Number(c.total) }] 
          }
        };
      });

      fetchedComandas.forEach(fetched => {
        const index = closedComandas.value.findIndex(existing => existing.id === fetched.id);
        if (index === -1) {
          closedComandas.value.push(fetched);
        } else {
          closedComandas.value[index] = { ...fetched, paymentDetails: closedComandas.value[index].paymentDetails };
        }
      });

    } catch (error) {
      console.error('Erro ao carregar histórico de comandas:', error);
    }
  }

  function addClosedComanda(comanda) {
    const index = closedComandas.value.findIndex(c => c.id === comanda.id);
    if (index === -1) {
      closedComandas.value.push(comanda);
    } else {
      closedComandas.value[index] = comanda;
    }
  }

  function getClosedComandas() {
    return closedComandas.value;
  }

  return { closedComandas, addClosedComanda, getClosedComandas, loadClosedComandas };
});