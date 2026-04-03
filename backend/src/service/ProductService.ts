import { Product } from "../database";
import { CreateProduct, EditProduct } from "../dto";
import { AppError } from "../middleware";
import { EstablishmentRepository, ProductRepository, ProductVariationRepository } from "../repository";
import { CategoryService } from "./CategoryService";

export class ProductService {

    private categoryService: CategoryService
    private establishmentRepository: EstablishmentRepository
    private productRepository: ProductRepository
    private productVariationRepository: ProductVariationRepository

    constructor(
        categoryService: CategoryService, 
        establishmentRepository: EstablishmentRepository,
        productRepository: ProductRepository, 
        productVariationRepository: ProductVariationRepository
    ) {
        this.categoryService = categoryService
        this.establishmentRepository = establishmentRepository
        this.productRepository = productRepository
        this.productVariationRepository = productVariationRepository
    }

    async createProduct(params: CreateProduct) {
        const {product, productVariations} = params

        const category = await this.categoryService.getCategory(product.categoryId)

        if(!category) {
            throw new AppError('Categoria não existe', 400)
        }

        const establishment = await this.establishmentRepository.getEstablishment(product.establishmentId)

        if(!establishment) {
            throw new AppError('Estabelecimento não encontrado', 400)
        }

        const createdProduct = await this.productRepository.createProduct({...product, establishment, category}) 

        if(createdProduct && productVariations) { 
            productVariations.forEach(async (productVariation) => {
                await this.productVariationRepository.createProductVariation({...productVariation, product: createdProduct})
            })
        }

        return createdProduct.id
    }

    async listProducts({establishmentId}:{establishmentId: number}) {
        return await this.productRepository.listProducts(establishmentId)
    }

    async listProductsByCategory(categoryId: number, establishmentId: number) {
        return await this.productRepository.listProductsByCategory(categoryId, establishmentId)
    }

    async listActiveProductsByCategory(categoryId: number, establishmentId: number) {
        return await this.productRepository.listActiveProductsByCategory(categoryId, establishmentId)
    }
 
    async getProduct(productId: number) {
        return await this.productRepository.getProduct(productId)
    }

    async updateProduct(productId: number, params: EditProduct) {

        const product = await this.productRepository.getProduct(productId)

        if(!product) {
            throw new AppError('Produto não existe', 400)
        }

        if(product.productVariations && !params.productVariations) {
            await this.deleteProductVariations(product)
        }

        if(params.productVariations) {
            params.productVariations.forEach(async (variation) => {
                const {id, ...editParams} = variation
                await this.productVariationRepository.updateProductVariation(id, editParams)
            })
        }

        const category = await this.categoryService.getCategory(params.product.categoryId)

        if(!product) {
            throw new AppError('Categoria não existe', 400)
        }

        await this.productRepository.updateProduct(productId, {...params.product, category})

    }

    async deleteProduct({productId, categoryId}: {productId: number, categoryId: number}) {
        const category = await this.categoryService.getCategory(categoryId)

        if(!category) {
            throw new AppError('Categoria não existe', 400)
        }

        const product = await this.productRepository.getProduct(productId)

        if(!product) {
            throw new AppError('Produto não existe', 400)
        }

        await this.deleteProductVariations(product)

        await this.productRepository.deleteProduct(productId)
    }

    async deleteProductVariations(product: Product) {
        product.productVariations.forEach(async (variation) => {
            await this.productVariationRepository.deleteProductVariation(variation.id)
        })
    }
}