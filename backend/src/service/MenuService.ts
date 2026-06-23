import { CategoryRepository, ProductRepository } from "../repository";

export class MenuService {
    constructor(
        private categoryRepository: CategoryRepository,
        private productRepository: ProductRepository
    ) {}

    async getFullMenu(establishmentId: number) {
        const categories = await this.categoryRepository.find({
            where: {
                establishment: { id: establishmentId },
                ativo: true
            },
            order: { id: 'ASC' }
        });

        const products = await this.productRepository.find({
            where: {
                category: {
                    establishment: { id: establishmentId },
                    ativo: true
                },
                ativo: true
            },
            relations: ['category', 'productVariations'],
            order: { name: 'ASC' }
        });

        const categoryIdsWithProducts = new Set(products.map(p => p.category?.id));
        const filteredCategories = categories.filter(c => categoryIdsWithProducts.has(c.id));

        return {
            categories: filteredCategories,
            products: products.map(p => ({
                ...p,
                basePrice: Number(p.basePrice), 
                productVariations: p.productVariations?.map(v => ({
                    ...v,
                    addPrice: Number(v.addPrice)
                }))
            }))
        };
    }
}