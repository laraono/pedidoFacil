import { AppDataSource } from '../database'
import { categoryRepository, comandaRepository, orderRepository, productOrderRepository, productRepository, productVariationRepository, refreshTokenRepository, userRepository } from '../repository'
import { AuthService } from './AuthService'
import { CategoryService } from './CategoryService'
import { ComandaService } from './ComandaService'
import { OrderService } from './OrderService'
import { ProductService } from './ProductService'

const authService: AuthService = new AuthService(AppDataSource, userRepository, refreshTokenRepository)
const categoryService: CategoryService = new CategoryService(categoryRepository)
const comandaService: ComandaService = new ComandaService(comandaRepository)
const productService: ProductService = new ProductService(categoryService, productRepository, productVariationRepository)
const orderService: OrderService = new OrderService(orderRepository, productOrderRepository, productVariationRepository, comandaService, productService)

export {
    authService,
    categoryService,
    comandaService,
    orderService,
    productService
}

export {
    AuthService,
    CategoryService,
    ComandaService,
    OrderService,
    ProductService
}