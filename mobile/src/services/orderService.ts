import { appConfig } from './apiConfig';
import type { CartItem } from '../contexts/CartContext';

const totemHeaders = (): Record<string, string> => {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (appConfig.selfServiceCode) h['x-totem-code'] = appConfig.selfServiceCode;
  return h;
};

export async function submitOrder({ cartItems, description = null }: {
  cartItems: CartItem[]
  description?: string | null
}): Promise<any> {
  const itens = cartItems.map(item => ({
    productId: item.id,
    productVariationId: item.size?.id || null,
    quantity: item.quantity,
    observation: item.observation || '',
  }));

  const body = {
    itens,
    description,
  };

  const response = await fetch(
    `${appConfig.API_URL}/totem/orders`,
    { method: 'POST', headers: totemHeaders(), body: JSON.stringify(body) },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ao enviar pedido: ${response.status} — ${errorText}`);
  }

  return await response.json();
}

export async function registerTotemPayment({ comandaId, orderId, type, amount }: {
  comandaId: number;
  orderId: number;
  type: string;
  amount: number;
}): Promise<void> {
  const response = await fetch(
    `${appConfig.API_URL}/totem/comanda/${comandaId}/payment`,
    { method: 'POST', headers: totemHeaders(), body: JSON.stringify({ orderId, type, amount }) },
  );
  if (!response.ok) throw new Error(await response.text());
}
