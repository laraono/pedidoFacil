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

        const createdProduct = await this.productRepository.createProduct(product) 

        if(createdProduct) { 
            productVariations.forEach(async (productVariation) => {
                await this.productVariationRepository.createProductVariation({...productVariation, product: createdProduct})
            })
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
}