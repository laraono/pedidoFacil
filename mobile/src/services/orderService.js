import { API_URL } from './apiConfig';

export async function submitOrder({ comandaId, comandaLabel, cartItems, authToken }) {

    const itens = cartItems.map(item => ({
        productId: item.id,
        productVariationId: item.size?.id || null,
        productName: item.name,
        quantity: item.quantity,
        observation: item.observation || '',
    }));

    const body = {
        status: 'Aguardando_Preparo',
        source: 'mobile',
        comandaLabel: comandaLabel || `Comanda #${comandaId}`,
        itens,
    };

    const headers = {
        'Content-Type': 'application/json',
    };

    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(
        `${API_URL}/api/v1/commands/${comandaId}/orders`,
        {
            method: 'POST',
            headers,
            credentials: 'include',
            body: JSON.stringify(body),
        }
    );

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ao enviar pedido: ${response.status} — ${errorText}`);
    }

    return await response.json();
}