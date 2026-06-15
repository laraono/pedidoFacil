import { appConfig } from './apiConfig';
import type { CartItem } from '../contexts/CartContext';

export async function submitOrder({ cartItems, customerName = null }: {
  cartItems: CartItem[]
  customerName?: string | null
}): Promise<any> {
  const itens = cartItems.map(item => ({
    productId: item.id,
    productVariationId: item.size?.id || null,
    quantity: item.quantity,
    observation: item.observation || '',
  }));

  const body = {
    itens,
    description: customerName,
    customerName,
  };

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (appConfig.selfServiceCode) {
    headers['x-totem-code'] = appConfig.selfServiceCode;
  }

  const response = await fetch(
    `${appConfig.API_URL}/totem/orders`,
    { method: 'POST', headers, body: JSON.stringify(body) },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ao enviar pedido: ${response.status} — ${errorText}`);
  }

  return await response.json();
}
