import { AppDataSource } from '../database';
import {
    categoryRepository,
    comandaRepository,
    orderRepository,
    productRepository,
    productVariationRepository,
    userRepository,
    couponRepository,
    establishmentRepository,
    configurationRepository,
    roleRepository,
    receiptRepository,
    paymentRepository,
    planRepository,
    subscriptionRepository,
    registerRepository,
} from '../repository';

import { AuthService } from './AuthService';
import { CategoryService } from './CategoryService';
import { ComandaService } from './ComandaService';
import { OrderService } from './OrderService';
import { ProductService } from './ProductService';
import { EmployeeService } from './EmployeeService';
import { ProfileService } from './ProfileService';
import { CouponService } from './CouponService';
import { EstablishmentService } from './EstablishmentService';
import { RoleService } from './RoleService';
import { ReceiptService } from './ReceiptService';
import { MetricsService } from './MetricsService';
import { MenuService } from './MenuService';
import { PaymentService } from './PaymentService';
import { SubscriptionService } from './SubscriptionService';
import { MercadoPagoService } from './MercadoPagoService';
import { PlanService } from './PlanService';

const authService = new AuthService(AppDataSource, userRepository);
const mercadoPagoService = new MercadoPagoService()

const categoryService = new CategoryService(categoryRepository, establishmentRepository, productRepository);

const metricsService = new MetricsService(receiptRepository, AppDataSource);

const receiptService = new ReceiptService(receiptRepository, paymentRepository, establishmentRepository);
const paymentService = new PaymentService(AppDataSource, mercadoPagoService, paymentRepository, orderRepository);

const comandaService = new ComandaService(
    AppDataSource, 
    paymentService,
    receiptService,
    comandaRepository, 
    establishmentRepository,
    orderRepository,
    userRepository
);

const productService = new ProductService(
    categoryService,
    establishmentRepository,
    productRepository,
    productVariationRepository
);
const orderService = new OrderService(
    AppDataSource,
    establishmentRepository,
    orderRepository,
    userRepository,
    comandaService,
);
const couponService = new CouponService(couponRepository);
const roleService = new RoleService(roleRepository, userRepository);
const profileService = new ProfileService(userRepository);

const establishmentService = new EstablishmentService(
  establishmentRepository,
  userRepository,
  configurationRepository,
  registerRepository,
  roleRepository,
  mercadoPagoService
);

const employeeService = new EmployeeService(userRepository, roleRepository);

const menuService = new MenuService(categoryRepository, productRepository);

const subscriptionService = new SubscriptionService(
    planRepository,
    establishmentRepository,
    subscriptionRepository,
    mercadoPagoService
)
const planService = new PlanService(planRepository, subscriptionService, mercadoPagoService)

export {
    authService,
    categoryService,
    comandaService,
    orderService,
    productService,
    employeeService,
    profileService,
    couponService,
    establishmentService,
    roleService,
    receiptService,
    metricsService,
    menuService,
    paymentService,
    planService,
    subscriptionService,
    mercadoPagoService
};

export {
    AuthService,
    CategoryService,
    ComandaService,
    OrderService,
    ProductService,
    EmployeeService,
    ProfileService,
    CouponService,
    EstablishmentService,
    RoleService,
    ReceiptService,
    MetricsService,
    MenuService,
    PaymentService,
    PlanService,
    SubscriptionService,
    MercadoPagoService
};
