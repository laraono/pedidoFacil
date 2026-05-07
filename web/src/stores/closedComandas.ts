import { defineStore } from 'pinia';
import { ref } from 'vue';
import { comandaApi } from '@/services/comandaApi';
import type { Comanda } from './comandaManagement';

export const useClosedComandaStore = defineStore('closedComandas', () => {
  const closedComandas = ref<Comanda[]>([]);

  async function loadClosedComandas() {
    try {
      const response = await comandaApi.listByStatus('Fechada');
      if (!response) return;

      const fetchedComandas = response.map((c: any) => {
        const mappedOrders = (c.pedidos || []).map((p: any) => {
          const items = (p.productOrders || []).map((po: any) => ({
            name: po.product?.name || 'Item',
            amount: po.quantity || 1,
            price: Number(po.price || po.Preco_Unitario_Momento || 0)
          }));
          
          const orderPrice = items.reduce((sum: number, idx: any) => sum + (idx.price * idx.amount), 0);
          
          return { id: p.id, price: orderPrice, items };
        });

        return {
          id: c.id,
          label: c.description || `Comanda #${c.id}`,
          customerName: c.customerName ?? undefined,
          isAutoatendimento: !!c.customerName || (c.description || '').startsWith('Totem #'),
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

      fetchedComandas.forEach((fetched: any) => {
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

  function addClosedComanda(comanda: Comanda) {
    const index = closedComandas.value.findIndex(c => c.id === comanda.id);
    if (index === -1) {
      closedComandas.value.push(comanda);
    } else {
      closedComandas.value[index] = comanda;
    }
  }

  function getClosedComandas(): Comanda[] {
    return closedComandas.value;
  }

  return { closedComandas, addClosedComanda, getClosedComandas, loadClosedComandas };
});