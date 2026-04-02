import { AppDataSource } from '../database'
import { CategoryRepository } from './CategoryRepository'
import { ComandaRepository } from './ComandaRepository'
import { OrderRepository } from './OrderRepository'
import { ProductOrderRepository } from './ProductOrderRepository'
import { ProductRepository } from './ProductRepository'
import { ProductVariationOrderRepository } from './ProductVariationOrderRepository'
import { ProductVariationRepository } from './ProductVariationRepository'
import { RefreshTokenRepository } from './RefreshTokenRepository'
import { RoleRepository } from './RoleRepository'
import { UserRepository } from './UserRepository'
import { CouponRepository } from './CouponRepository'
import { EstablishmentRepository } from './EstablishmentRepository'
import { ConfigurationRepository } from './ConfigurationRepository'

const categoryRepository = new CategoryRepository(AppDataSource)
const comandaRepository = new ComandaRepository(AppDataSource)
const orderRepository = new OrderRepository(AppDataSource)
const productRepository = new ProductRepository(AppDataSource)
const productOrderRepository = new ProductOrderRepository(AppDataSource)
const productVariationRepository = new ProductVariationRepository(AppDataSource)
const productVariationOrderRepository = new ProductVariationOrderRepository(AppDataSource)
const refreshTokenRepository = new RefreshTokenRepository(AppDataSource)
const roleRepository = new RoleRepository(AppDataSource)
const userRepository = new UserRepository(AppDataSource)
const couponRepository = new CouponRepository(AppDataSource)
const establishmentRepository = new EstablishmentRepository(AppDataSource)
const configurationRepository = new ConfigurationRepository(AppDataSource)

export {
    categoryRepository,
    comandaRepository,
    orderRepository,
    productRepository,
    productOrderRepository,
    productVariationRepository,
    productVariationOrderRepository,
    refreshTokenRepository,
    roleRepository,
    userRepository,
    couponRepository,
    establishmentRepository,
    configurationRepository
}

export {
    CategoryRepository, ComandaRepository, OrderRepository, ProductRepository, ProductOrderRepository, ProductVariationRepository,
    ProductVariationOrderRepository, RefreshTokenRepository, RoleRepository, UserRepository, CouponRepository,
    EstablishmentRepository, ConfigurationRepository
}