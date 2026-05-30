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
  refreshTokenRepository,
  planRepository,
  subscriptionRepository,
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
import { MercadoPagoService } from './MercadoPagoService';
import { SubscriptionService } from './SubscriptionService';
import { PlanService } from './PlanService';
import { WebhookService } from './WebhookService';  

const categoryService = new CategoryService(categoryRepository);

const metricsService = new MetricsService(receiptRepository, AppDataSource);
const mercadoPagoService = new MercadoPagoService();

const authService = new AuthService(AppDataSource, userRepository, refreshTokenRepository, establishmentRepository, mercadoPagoService);

const receiptService = new ReceiptService(receiptRepository, paymentRepository, establishmentRepository);
const paymentService = new PaymentService(AppDataSource, mercadoPagoService, paymentRepository, orderRepository);

const comandaService = new ComandaService(
    AppDataSource,
    comandaRepository,
    paymentService,
    receiptService
);

const productService = new ProductService(
  categoryService,
  productRepository,
  productVariationRepository,
);
const orderService = new OrderService(
  AppDataSource,
  orderRepository,
  comandaService,
);
const couponService = new CouponService(couponRepository);
const roleService = new RoleService(roleRepository, userRepository);

const establishmentService = new EstablishmentService(
  establishmentRepository,
  userRepository,
  configurationRepository,
  roleRepository,
  mercadoPagoService,
);

const profileService = new ProfileService(userRepository);

const employeeService = new EmployeeService(userRepository, roleRepository);

const menuService = new MenuService(categoryRepository, productRepository);

const subscriptionService = new SubscriptionService(planRepository, subscriptionRepository, mercadoPagoService, AppDataSource);
const planService = new PlanService(planRepository, subscriptionService, mercadoPagoService, AppDataSource);

const webhookService = new WebhookService(subscriptionRepository, mercadoPagoService);

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
  subscriptionService,
  planService,
  mercadoPagoService,
  webhookService
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
  MercadoPagoService,
  SubscriptionService,
  PlanService,
  WebhookService
};
