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
    ProfileService
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
    roleController
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
    RoleController
}

export { loginLimiter } from './AuthController'