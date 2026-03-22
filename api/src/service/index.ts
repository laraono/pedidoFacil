import { categoryRepository, comandaRepository, orderRepository, productOrderRepository, productRepository, productVariationRepository } from '../repository'
import { CategoryService } from './CategoryService'
import { ComandaService } from './ComandaService'
import { OrderService } from './OrderService'
import { ProductService } from './ProductService'

const categoryService: CategoryService = new CategoryService(categoryRepository)
const comandaService: ComandaService = new ComandaService(comandaRepository)
const productService: ProductService = new ProductService(categoryService, productRepository, productVariationRepository)
const orderService: OrderService = new OrderService(orderRepository, productOrderRepository, productVariationRepository, comandaService, productService)

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