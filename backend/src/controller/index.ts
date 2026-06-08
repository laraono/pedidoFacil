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
    metricsService,
    menuService,
    paymentService,
    subscriptionService,
    planService,
    webhookService
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
import { MenuController } from './MenuController'
import { PaymentController } from './PaymentController'
import { SubscriptionController } from './SubscriptionController'
import { PlanController } from './PlanController'
import { WebhookController } from './WebhookController'

const authController = new AuthController(authService)
const categoryController = new CategoryController(categoryService)
const comandaController = new ComandaController(comandaService)
const orderController = new OrderController(orderService)
const productController = new ProductController(productService)
const couponController = new CouponController(couponService)
const establishmentController = new EstablishmentController(establishmentService, subscriptionService)
const roleController = new RoleController(roleService)
const employeeController = new EmployeeController(employeeService) 
const profileController = new ProfileController(profileService)
const receiptController = new ReceiptController(receiptService)
const metricsController = new MetricsController(metricsService)
const menuController = new MenuController(menuService) 
const paymentController = new PaymentController(paymentService) 
const subscriptionController = new SubscriptionController(subscriptionService)
const planController = new PlanController(planService)
const webhookController = new WebhookController(webhookService)

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
    metricsController,
    menuController,
    paymentController,
    planController,
    subscriptionController,
    webhookController
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
    MetricsController,
    MenuController,
    PaymentController,
    PlanController,
    SubscriptionController,
    WebhookController
}

export { authLimiter } from './AuthController'
export { menuLimiter } from './MenuController'
export { paymentLimiter } from './PaymentController'
export { receiptLimiter } from './ReceiptController'
export { roleLimiter } from './RoleController'
export { couponLimiter } from './CouponController'
