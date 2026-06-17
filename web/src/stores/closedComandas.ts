import { defineStore } from 'pinia';
import { ref } from 'vue';
import { comandaApi } from '@/services/comandaApi';
import type { Comanda } from './comandaManagement';

export const useClosedComandaStore = defineStore('closedComandas', () => {
  const closedComandas = ref<Comanda[]>([]);

  async function loadClosedComandas() {
    try {
      const response = await comandaApi.listClosed();
      if (!response) return;

      const fetchedComandas = response.map((c: any) => {
        const mappedOrders = (c.pedidos || []).map((p: any) => {
          const items = (p.productOrders || []).map((po: any) => {
            const variationName = po.variations
              ?.map((v: any) => v.productVariation?.name)
              .filter(Boolean)
              .join(', ') || '';
            return {
              name: po.product?.name || 'Item',
              variationName,
              amount: po.quantity || 1,
              price: Number(po.price || 0),
            };
          });
          
          const orderPrice = items.reduce((sum: number, idx: any) => sum + (idx.price * idx.amount), 0);
          
          const orderStatusNome = typeof p.status === 'object' && p.status !== null ? p.status.nome : p.status;
          return {
            id: p.id,
            price: orderPrice,
            items,
            status: orderStatusNome
          };
        });

        const cancelledOrder = (c.pedidos || []).find((p: any) => p.cancellationDescription);
        const comandaStatusNome = typeof c.status === 'object' && c.status !== null ? c.status.nome : c.status;
        const discountTypeNome = c.discountType?.nome;
        const mappedDiscountType = discountTypeNome === 'Percentual' ? 'percent' : (discountTypeNome ? 'value' : null);

        return {
          id: c.id,
          label: c.description || `Comanda #${c.id}`,
          customerName: c.customerName ?? undefined,
          isAutoatendimento: !!c.customerName || (c.description || '').startsWith('Totem #'),
          closedAt: c.deleted_at || c.created_at || new Date(),
          total: Number(c.total),
          status: comandaStatusNome,
          cancelReason: cancelledOrder?.cancellationDescription || undefined,
          orders: mappedOrders,
          paymentDetails: {
            discountType: mappedDiscountType,
            discountValue: Number(c.discountValue || 0),
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