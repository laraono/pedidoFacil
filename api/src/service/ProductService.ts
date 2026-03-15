import { CreateProduct } from "../dto";
import { AddonRepository, ProductRepository, SizeRepository } from "../repository";
import { CategoryService } from "./CategoryService";

export class ProductService {

    private addonRepository: AddonRepository
    private categoryService: CategoryService
    private productRepository: ProductRepository
    private sizeRepository: SizeRepository

    constructor(
        addonRepository: AddonRepository,
        categoryService: CategoryService, 
        productRepository: ProductRepository, 
        sizeRepository: SizeRepository
    ) {
        this.addonRepository = addonRepository
        this.categoryService = categoryService
        this.productRepository = productRepository
        this.sizeRepository = sizeRepository
    }

    async createProduct(params: CreateProduct) {
        const {addons, product, sizes} = params

        const category = await this.categoryService.getCategory(product.categoryId)

        if(!category) {
            return
        }

        const createdProduct = await this.productRepository.createProduct(product) 

        if(createdProduct) {
            addons.forEach(async (add) => {
                await this.addonRepository.createAddon({...add, product: createdProduct})
            })

            sizes.forEach(async (size) => {
                await this.sizeRepository.createSize({...size, product: createdProduct})
            })
        }

        return createdProduct.id
    }

    async listProducts() {
        return await this.productRepository.listProducts()
    }

    async getProduct(productId: number) {
        return await this.getProduct(productId)
    }
}