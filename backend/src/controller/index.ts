import { authService, categoryService, comandaService, orderService, productService } from '../service'
import { AuthController } from './AuthController'
import { CategoryController } from './CategoryController'
import { ComandaController } from './ComandaController'
import { OrderController } from './OrderController'
import { ProductController } from './ProductController'
import { EmployeeController } from './EmployeeController'

const authController: AuthController = new AuthController(authService)
const categoryController: CategoryController = new CategoryController(categoryService)
const comandaController: ComandaController = new ComandaController(comandaService)
const orderController: OrderController = new OrderController(orderService)
const productController: ProductController = new ProductController(productService)
const employeeController: EmployeeController = new EmployeeController()

export {
    authController,
    categoryController,
    comandaController,
    orderController,
    productController,
    employeeController
}

export {
    AuthController,
    CategoryController,
    ComandaController,
    OrderController,
    ProductController,
    EmployeeController
}

export { loginLimiter } from './AuthController'