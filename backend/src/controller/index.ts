import { 
    authService, 
    categoryService, 
    comandaService, 
    employeeService, 
    orderService, 
    productService, 
    profileService, 
    couponService, 
    establishmentService,
    roleService,
    receiptService,    
    metricsService      
} from '../service'

import { AuthController } from './AuthController'
import { CategoryController } from './CategoryController'
import { ComandaController } from './ComandaController'
import { OrderController } from './OrderController'
import { ProductController } from './ProductController'
import { EmployeeController } from './EmployeeController'
import { ProfileController } from './ProfileController'
import { CouponController } from './CouponController'
import { EstablishmentController } from './EstablishmentController'
import { RoleController } from './RoleController'
import { ReceiptController } from './ReceiptController'
import { MetricsController } from './MetricsController' 

const authController = new AuthController(authService)
const categoryController = new CategoryController(categoryService)
const comandaController = new ComandaController(comandaService)
const orderController = new OrderController(orderService)
const productController = new ProductController(productService)
const couponController = new CouponController(couponService)
const establishmentController = new EstablishmentController(establishmentService)
const roleController = new RoleController(roleService)
const employeeController = new EmployeeController(employeeService) 
const profileController = new ProfileController(profileService) 

const receiptController = new ReceiptController(receiptService)
const metricsController = new MetricsController(metricsService)

export {
    authController,
    categoryController,
    comandaController,
    orderController,
    productController,
    employeeController,
    profileController,
    couponController,
    establishmentController,
    roleController,
    receiptController,
    metricsController
}

export {
    AuthController,
    CategoryController,
    ComandaController,
    OrderController,
    ProductController,
    EmployeeController,
    ProfileController,
    CouponController,
    EstablishmentController,
    RoleController,
    ReceiptController,
    MetricsController
}

export { loginLimiter } from './AuthController'