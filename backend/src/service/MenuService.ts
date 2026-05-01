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
                establishment: { id: establishmentId },
                ...(editMode ? {} : { status: ProductStatus.ATIVA })
            },
            relations: ['category', 'productVariations'],
            withDeleted: editMode,
            order: { name: 'ASC' }
        });

        return {
            categories,
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