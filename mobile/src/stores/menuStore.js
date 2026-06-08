import { appConfig } from '../services/apiConfig';

export async function fetchFullMenu() {
    try {
        const url = `${appConfig.API_URL}/menu?establishmentId=${appConfig.ESTABLISHMENT_ID}`;
        console.log(`[MenuStore] Fazendo requisição para: ${url}`); 

        const response = await fetch(url, {
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