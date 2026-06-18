import { CreateProductDTO } from "../dto/product/CreateProductDTO";
import { AppError } from "../middleware/error/AppError";
import { ProductRepository, ProductVariationRepository } from "../repository";
import { CategoryService } from "./CategoryService";

export class ProductService {
    private categoryService: CategoryService
    private productRepository: ProductRepository
    private productVariationRepository: ProductVariationRepository

    constructor(
        categoryService: CategoryService, 
        productRepository: ProductRepository, 
        productVariationRepository: ProductVariationRepository
    ) {
        this.categoryService = categoryService
        this.productRepository = productRepository
        this.productVariationRepository = productVariationRepository
    }

    async createProduct(params: CreateProductDTO) {
        const { product, productVariations } = params

        const category = await this.categoryService.getCategory(product.categoryId)

        if (!category) {
            throw new AppError('Categoria não existe', 400)
        }

        const result: any = await this.productRepository.createProduct({
            ...product,
            category: category
        } as any) 

        const createdProduct = Array.isArray(result) ? result[0] : result;

        if (createdProduct && productVariations) { 
            for (const variation of productVariations) {
                await this.productVariationRepository.createProductVariation({
                    ...variation,
                    product: { id: createdProduct.id },
                    ativo: true
                } as any)
            }
        }

        return createdProduct.id
    }

    async listProducts(establishmentId: number, page: number = 1, limit: number = 10, status?: string) {
        return await this.productRepository.listProducts(establishmentId, page, limit, status);
    }

    async listProductsByCategory(categoryId: number, establishmentId: number, page: number = 1, limit: number = 10) {
        return await this.productRepository.listProductsByCategory(categoryId, establishmentId, page, limit);
    }

    async listDeletedProducts(establishmentId: number, page: number = 1, limit: number = 10) {
        return await this.productRepository.listDeletedProducts(establishmentId, page, limit);
    }
 
    async getProduct(productId: number) {
        return await this.productRepository.getProduct(productId)
    }

    async updateProduct(productId: number, data: any) {
        const updateData: any = {};
        
        if (data.name !== undefined) updateData.name = data.name;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.price !== undefined) updateData.basePrice = data.price;
        if (data.image !== undefined) updateData.image = data.image;
        if (data.categoryId !== undefined) updateData.category = { id: data.categoryId };
        
        if (data.available !== undefined) {
            updateData.ativo = data.available;
        }

        await this.productRepository.updateProduct(productId, updateData);

        if (data.sizes && Array.isArray(data.sizes)) {
            await this.productVariationRepository.softDeleteVariationsByProduct(productId);
            
            for (const size of data.sizes) {
                await this.productVariationRepository.createProductVariation({
                    name: size.name,
                    addPrice: size.price,
                    ativo: true,
                    product: { id: productId }
                } as any);
            }
        }
    }

    async softDeleteProduct(productId: number) {
        const product = await this.productRepository.getProduct(productId);
        if (!product || product.ativo) {
            throw new AppError('Apenas produtos inativos podem ser excluídos.', 400);
        }
        const hasActiveOrders = await this.productRepository.hasActiveOrders(productId);
        if (hasActiveOrders) {
            throw new AppError('Não é possível excluir um produto com pedidos em andamento.', 409);
        }
        await this.productRepository.softDeleteProduct(productId);
    }

    async restoreProduct(productId: number) {
        await this.productRepository.restoreProduct(productId);
    }
}