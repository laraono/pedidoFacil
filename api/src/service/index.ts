import { addonRepository, categoryRepository, comandaRepository, orderRepository, productOrderRepository, productRepository, sizeRepository } from '../repository'
import { CategoryService } from './CategoryService'
import { ComandaService } from './ComandaService'
import { OrderService } from './OrderService'
import { ProductService } from './ProductService'

const categoryService: CategoryService = new CategoryService(categoryRepository)
const comandaService: ComandaService = new ComandaService(comandaRepository)
const productService: ProductService = new ProductService(addonRepository, categoryService, productRepository, sizeRepository)
const orderService: OrderService = new OrderService(addonRepository, orderRepository, productOrderRepository, sizeRepository, comandaService, productService)

export {
    categoryService,
    comandaService,
    orderService,
    productService
}

export {
    CategoryService,
    ComandaService,
    OrderService, 
    ProductService
}