import { appConfig } from './apiConfig';

export async function submitOrder({ cartItems, customerName = null }) {

    const itens = cartItems.map(item => ({
        productId: item.id,
        productVariationId: item.size?.id || null,
        productName: item.name,
        quantity: item.quantity,
        observation: item.observation || '',
    }));

    const body = { itens, customerName };

    const headers = {
        'Content-Type': 'application/json',
        'x-totem-code': appConfig.selfServiceCode
    };

    const response = await fetch(
        `${appConfig.API_URL}/totem/orders`,
        {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
        }
    );

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ao enviar pedido: ${response.status} — ${errorText}`);
    }

    return await response.json();
}