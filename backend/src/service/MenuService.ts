import { CategoryRepository, ProductRepository } from "../repository";
import { ProductStatus } from "../enum";

export class MenuService {
    constructor(
        private categoryRepository: CategoryRepository,
        private productRepository: ProductRepository
    ) {}

    async getFullMenu(establishmentId: number, editMode: boolean = false) {
        // 1. Busca Categorias
        // No editMode trazemos as deletadas (soft delete) também
        const categories = await this.categoryRepository.find({
            where: { establishment: { id: establishmentId } },
            withDeleted: editMode,
            order: { id: 'ASC' }
        });

        // 2. Busca Produtos com suas Variações
        const products = await this.productRepository.find({
            where: { 
                establishment: { id: establishmentId },
                // Se não for editMode, filtra apenas os Ativos
                ...(editMode ? {} : { status: ProductStatus.ATIVA })
            },
            relations: ['category', 'productVariations'],
            withDeleted: editMode,
            order: { name: 'ASC' }
        });

        // 3. Formata a resposta para o Frontend (Agrupando por categoria se quiser, ou lista flat)
        return {
            categories,
            products: products.map(p => ({
                ...p,
                basePrice: Number(p.basePrice), // Garante que preço vá como número
                productVariations: p.productVariations?.map(v => ({
                    ...v,
                    addPrice: Number(v.addPrice)
                }))
            }))
        };
    }
}