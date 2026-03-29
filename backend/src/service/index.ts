import { AppDataSource } from '../database'
import { categoryRepository, comandaRepository, establishemtnRepository, orderRepository, productOrderRepository, productRepository, productVariationRepository, refreshTokenRepository, userRepository } from '../repository'
import { AuthService } from './AuthService'
import { CategoryService } from './CategoryService'
import { ComandaService } from './ComandaService'
import { OrderService } from './OrderService'
import { ProductService } from './ProductService'

const authService: AuthService = new AuthService(AppDataSource, userRepository, refreshTokenRepository)
const categoryService: CategoryService = new CategoryService(categoryRepository, establishemtnRepository)
const comandaService: ComandaService = new ComandaService(comandaRepository, establishemtnRepository, userRepository)
const productService: ProductService = new ProductService(categoryService, establishemtnRepository, productRepository, productVariationRepository)
const orderService: OrderService = new OrderService(AppDataSource, establishemtnRepository, orderRepository, userRepository, comandaService)

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