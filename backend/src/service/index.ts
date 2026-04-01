import { AppDataSource } from '../database'
import { categoryRepository, comandaRepository, orderRepository, productOrderRepository, productRepository, productVariationRepository, refreshTokenRepository, userRepository } from '../repository'
import { AuthService } from './AuthService'
import { CategoryService } from './CategoryService'
import { ComandaService } from './ComandaService'
import { OrderService } from './OrderService'
import { ProductService } from './ProductService'
import { EmployeeService } from './EmployeeService'


const authService: AuthService = new AuthService(AppDataSource, userRepository)
const categoryService: CategoryService = new CategoryService(categoryRepository)
const comandaService: ComandaService = new ComandaService(comandaRepository, userRepository)
const productService: ProductService = new ProductService(categoryService, productRepository, productVariationRepository)
const orderService: OrderService = new OrderService(AppDataSource, orderRepository, comandaService)
const employeeService: EmployeeService = new EmployeeService()

export {
    authService,
    categoryService,
    comandaService,
    orderService,
    productService,
    employeeService
}

export {
    AuthService,
    CategoryService,
    ComandaService,
    OrderService,
    ProductService,
    EmployeeService
}