import { API_URL } from './apiConfig';
import { useNavigation } from '@react-navigation/native';

export async function submitOrder({ comandaId, comandaLabel, cartItems, authToken }, setErrorMessage) {

    const navigate = useNavigation()

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
        `${API_URL}/commands/${comandaId}/orders`,
        {
            method: 'POST',
            headers,
            credentials: 'include',
            body: JSON.stringify(body),
        }
    );

    if (response.status === 402) {
        response.json().then(data => {
            setErrorMessage('Há um erro com a sua assinatura. Corrija ele para poder acessar o menu.');
        });
        navigation.navigate('Welcome');;
        return
    };

    setErrorMessage()

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ao enviar pedido: ${response.status} — ${errorText}`);
    }

    return await response.json();
}