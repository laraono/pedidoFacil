import { Establishment, Product } from "../database";
import { CreateProduct, EditProduct, EditProductParams, ProductParams } from "../dto";
import { ProductStatus } from "../enum";
import { AppError } from "../middleware";
import { EstablishmentRepository, ProductRepository, ProductVariationRepository } from "../repository";
import { CategoryService } from "./CategoryService";
import { ensureBucketExists, generateUniqueImageKey, getImageContentType, uploadToS3 } from "./S3Service";

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

        const imageUrl = await this.saveImage(product, establishment.name)

        const productParams = {
            ...product, 
            establishment, 
            category,
            image: imageUrl
        }

        const createdProduct = await this.productRepository.createProduct(productParams) 

        if(createdProduct && productVariations) { 
            productVariations.forEach(async (productVariation) => {
                await this.productVariationRepository.createProductVariation({...productVariation, product: createdProduct})
            })
        }

        return createdProduct.id
    }

    async listProducts({establishmentId}:{establishmentId: number}) {
        const products = await this.productRepository.listProducts(establishmentId)

        const establishment = await this.establishmentRepository.getEstablishment(establishmentId)
    
        if(!establishment) {
            throw new AppError("Estabelecimento não encontrado", 400)
        }

        products.map( (product) => {
            if(product.image) {
                const imageURL = this.getImage(establishment.name, product.image)

                product.image = imageURL
            }
        })

        return products
    }

    async listProductsByCategory(categoryId: number, establishmentId: number) {
        const products = await this.productRepository.listProductsByCategory(categoryId, establishmentId)

        const establishment = await this.establishmentRepository.getEstablishment(establishmentId)
    
        if(!establishment) {
            throw new AppError("Estabelecimento não encontrado", 400)
        }

        products.map( (product) => {
            if(product.image) {
                const imageURL = this.getImage(establishment.name, product.image)

                product.image = imageURL
            }
        })

        return products
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

        const establishment = await this.establishmentRepository.getEstablishment(params.product.establishmentId)
    
        if(!establishment) {
            throw new AppError("Estabelecimento não encontrado", 400)
        }

        if(product.productVariations.length > 0 && params.productVariations.length === 0) {
            await this.deleteProductVariations(product)
        }

        if(params.productVariations) {
            params.productVariations.forEach(async (variation) => {
                const {id, ...editParams} = variation
                if(id)
                    await this.productVariationRepository.updateProductVariation(id, editParams)
                else
                    await this.productVariationRepository.createProductVariation({...editParams, product})
            })
        }

        const category = await this.categoryService.getCategory(params.product.categoryId)

        if(!product) {
            throw new AppError('Categoria não existe', 400)
        }

        const imageUrl = await this.saveImage(params.product, establishment.name)

        const editParams: EditProductParams = {
            basePrice: params.product.basePrice,
            category,
            name: params.product.name,
            description: params.product.description,
            image: imageUrl
        }

        await this.productRepository.updateProduct(productId, editParams)

    }

    async updateProductStatus(productId: number, status: ProductStatus) {
        await this.productRepository.updateProductStatus(productId, status)
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

    getImage(name: string, image: string) {
        const bucketName = name.toLocaleLowerCase()

        const endpoint = process.env.LOCALSTACK_ENDPOINT || 'http://localhost:4566';
        return `${endpoint}/${bucketName}/${image}`;
    
    }

    async saveImage(product: ProductParams, name: string) {
        if(!product.image) return ''

        console.log('nome da empresa', name)
        const bucketName = name.toLocaleLowerCase()

        await ensureBucketExists(bucketName)

        const imageKey = generateUniqueImageKey(product.image);

        try {
            const result = await uploadToS3({
                bucket: bucketName, 
                key: imageKey, 
                body: product.image,
                contentType: getImageContentType(product.image)
            })

            if (!result.Location) 
                throw new AppError("Falha ao obter URL da imagem", 500);

            return imageKey

        } catch(error) {
            throw new AppError(`Erro ao salvar imagem: ${error.message}`, 500)
        }
    }
}