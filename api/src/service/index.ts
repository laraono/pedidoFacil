import { addonRepository, categoryRepository, comandaRepository, productRepository, sizeRepository } from '../repository'
import { CategoryService } from './CategoryService'
import { ComandaService } from './ComandaService'
import { ProductService } from './ProductService'

const categoryService: CategoryService = new CategoryService(categoryRepository)
const comandaService: ComandaService = new ComandaService(comandaRepository)
const productService: ProductService = new ProductService(addonRepository, categoryService, productRepository, sizeRepository)

export {
    categoryService,
    comandaService,
    productService
}

export {
    CategoryService,
    ComandaService, 
    ProductService
}