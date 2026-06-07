import { AppDataSource } from '../database';
import { CategoryRepository } from './CategoryRepository';
import { ComandaRepository } from './ComandaRepository';
import { EstablishmentRepository } from './EstablishmentRepository'
import { OrderRepository } from './OrderRepository';
import { ProductOrderRepository } from './ProductOrderRepository';
import { ProductRepository } from './ProductRepository';
import { ProductVariationRepository } from './ProductVariationRepository';
import { RefreshTokenRepository } from './RefreshTokenRepository';
import { RoleRepository } from './RoleRepository';
import { UserRepository } from './UserRepository';
import { CouponRepository } from './CouponRepository';
import { ConfigurationRepository } from './ConfigurationRepository';
import { ReceiptRepository } from './ReceiptRepository';
import { PaymentRepository } from './PaymentRepository'; 
import { PlanRepository } from './PlanRepository';
import { SubscriptionRepository } from './SubscriptionRepository';
import { RegisterRepository } from './RegisterRepository';
import { MetricsRepository } from './MetricsRepository';
import { SubscriptionPaymentRepository } from './SubscriptionPaymentRepository';

const categoryRepository = new CategoryRepository(AppDataSource);
const metricsRepository = new MetricsRepository(AppDataSource);
const comandaRepository = new ComandaRepository(AppDataSource);
const establishmentRepository: EstablishmentRepository = new EstablishmentRepository(AppDataSource)
const orderRepository = new OrderRepository(AppDataSource);
const productRepository = new ProductRepository(AppDataSource);
const productOrderRepository = new ProductOrderRepository(AppDataSource);
const productVariationRepository = new ProductVariationRepository(
    AppDataSource,
);
const refreshTokenRepository = new RefreshTokenRepository(AppDataSource);
const roleRepository = new RoleRepository(AppDataSource);
const userRepository = new UserRepository(AppDataSource);
const couponRepository = new CouponRepository(AppDataSource);
const configurationRepository = new ConfigurationRepository(AppDataSource);
const receiptRepository = new ReceiptRepository(AppDataSource);
const paymentRepository = new PaymentRepository(AppDataSource); 
const planRepository = new PlanRepository(AppDataSource)
const subscriptionRepository = new SubscriptionRepository(AppDataSource)
const registerRepository = new RegisterRepository(AppDataSource)
const subscriptionPaymentRepository = new SubscriptionPaymentRepository(AppDataSource)

export {
    categoryRepository,
    comandaRepository,
    establishmentRepository,
    orderRepository,
    productRepository,
    productOrderRepository,
    productVariationRepository,
    refreshTokenRepository,
    roleRepository,
    userRepository,
    couponRepository,
    configurationRepository,
    receiptRepository,
    metricsRepository,
    paymentRepository,
    planRepository,
    subscriptionRepository,
    registerRepository,
    subscriptionPaymentRepository
};

export {
    CategoryRepository,
    ComandaRepository,
    OrderRepository,
    ProductRepository,
    ProductOrderRepository,
    ProductVariationRepository,
    RefreshTokenRepository,
    RoleRepository,
    UserRepository,
    CouponRepository,
    EstablishmentRepository,
    ConfigurationRepository,
    ReceiptRepository,
    PaymentRepository,
    PlanRepository,
    SubscriptionRepository,
    RegisterRepository,
    SubscriptionPaymentRepository
};
