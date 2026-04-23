import { CreateProduct } from "../dto";
import { AppError } from "../middleware";
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

    async createProduct(params: CreateProduct) {
        const {product, productVariations} = params

        const category = await this.categoryService.getCategory(product.categoryId)

        if(!category) {
            throw new AppError('Categoria não existe', 400)
        }

        const createdProduct = await this.productRepository.createProduct({
            ...product,
            category: category
        } as any) 

        if(createdProduct && productVariations) { 
            for (const variation of productVariations) {
                await this.productVariationRepository.createProductVariation({
                    ...variation,
                    product: createdProduct,
                    status: 'Ativo'
                } as any)
            }
        }

        return createdProduct.id
    }

    async listProducts() {
        return await this.productRepository.listProducts()
    }

    async listProductsByCategory(categoryId: number) {
        return await this.productRepository.listProductsByCategory(categoryId)
    }
 
    async getProduct(productId: number) {
        return await this.productRepository.getProduct(productId)
    }

    async listDeletedProducts() {
        return await this.productRepository.listDeletedProducts();
    }

    async updateProduct(productId: number, data: any) {
        const updateData: any = {};
        
        if (data.name !== undefined) updateData.name = data.name;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.price !== undefined) updateData.basePrice = data.price;
        if (data.image !== undefined) updateData.image = data.image;
        if (data.categoryId !== undefined) updateData.category = { id: data.categoryId };
        
        if (data.available !== undefined) {
            updateData.status = data.available ? 'Ativo' : 'Inativo';
        }

        await this.productRepository.updateProduct(productId, updateData);

        if (data.sizes && Array.isArray(data.sizes)) {
            await this.productVariationRepository.softDeleteVariationsByProduct(productId);
            
            for (const size of data.sizes) {
                await this.productVariationRepository.createProductVariation({
                    name: size.name,
                    addPrice: size.price,
                    status: 'Ativo',
                    product: { id: productId }
                } as any);
            }
        }
    }

    async softDeleteProduct(productId: number) {
        await this.productRepository.softDeleteProduct(productId);
    }

    async restoreProduct(productId: number) {
        await this.productRepository.restoreProduct(productId);
    }
}