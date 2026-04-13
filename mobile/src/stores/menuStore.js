import { API_URL } from '../services/apiConfig';

export async function fetchFullMenu() {
    try {
        const response = await fetch(`${API_URL}/menu?establishmentId=1`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

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