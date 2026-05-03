import { API_URL } from '../services/apiConfig';
import { useNavigation } from '@react-navigation/native';

export async function fetchFullMenu(setErrorMessage) {
    try {
        const navigation = useNavigation()

        const response = await fetch(`${API_URL}/menu?establishmentId=1`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 402) {
            response.json().then(data => {
                setErrorMessage('Há um erro com a sua assinatura. Corrija ele para poder acessar o menu.');
            });
            navigation.navigate('Welcome');;
            return
        };

        setErrorMessage(null)

        if (!response.ok) {
            const errorText = await response.text(); 
            throw new Error(`Status ${response.status} - ${errorText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error("[MenuStore] Erro crítico no fetchFullMenu:", error.message);
        return { categories: [], products: [] };
    }
}