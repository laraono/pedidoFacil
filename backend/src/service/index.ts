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

const authService = new AuthService(AppDataSource, userRepository);
const categoryService = new CategoryService(categoryRepository);

const receiptService = new ReceiptService(
  receiptRepository,
  paymentRepository,
  establishmentRepository,
);

const metricsService = new MetricsService(receiptRepository);

const comandaService = new ComandaService(
  comandaRepository,
  userRepository,
  paymentRepository,
  receiptService,
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
const profileService = new ProfileService(userRepository);

const establishmentService = new EstablishmentService(
  establishmentRepository,
  userRepository,
  configurationRepository,
  roleRepository,
);

const employeeService = new EmployeeService(userRepository, roleRepository);

const menuService = new MenuService(categoryRepository, productRepository);

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
};
