import { CategoryRepository, ProductRepository } from "../repository";
import { ProductStatus } from "../enum";

export class MenuService {
    constructor(
        private categoryRepository: CategoryRepository,
        private productRepository: ProductRepository
    ) {}

    async getFullMenu(establishmentId: number, editMode: boolean = false) {
        const categories = await this.categoryRepository.find({
            where: { establishment: { id: establishmentId } },
            withDeleted: editMode,
            order: { id: 'ASC' }
        });

        const products = await this.productRepository.find({
            where: { 
                category: { establishment: { id: establishmentId } },
                ...(editMode ? {} : { status: ProductStatus.ATIVO })
            },
            relations: ['category', 'productVariations'],
            withDeleted: editMode,
            order: { name: 'ASC' }
        });

        const categoryIdsWithProducts = new Set(products.map(p => p.category?.id));
        const filteredCategories = editMode
            ? categories
            : categories.filter(c => categoryIdsWithProducts.has(c.id));

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