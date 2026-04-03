import { AppDataSource } from '../database'
import { categoryRepository, comandaRepository, establishmentRepository, orderRepository, productOrderRepository, productRepository, productVariationRepository, refreshTokenRepository, userRepository } from '../repository'
import { AuthService } from './AuthService'
import { CategoryService } from './CategoryService'
import { ComandaService } from './ComandaService'
import { OrderService } from './OrderService'
import { ProductService } from './ProductService'

const authService: AuthService = new AuthService(AppDataSource, userRepository, refreshTokenRepository)
const categoryService: CategoryService = new CategoryService(categoryRepository, establishmentRepository, productRepository)
const comandaService: ComandaService = new ComandaService(comandaRepository, establishmentRepository, orderRepository, userRepository)
const productService: ProductService = new ProductService(categoryService, establishmentRepository, productRepository, productVariationRepository)
const orderService: OrderService = new OrderService(AppDataSource, establishmentRepository, orderRepository, userRepository, comandaService)

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