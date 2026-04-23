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

const categoryRepository: CategoryRepository = new CategoryRepository(AppDataSource)
const comandaRepository: ComandaRepository = new ComandaRepository(AppDataSource)
const orderRepository: OrderRepository = new OrderRepository(AppDataSource)
const productRepository: ProductRepository = new ProductRepository(AppDataSource)
const productOrderRepository: ProductOrderRepository = new ProductOrderRepository(AppDataSource)
const productVariationRepository: ProductVariationRepository = new ProductVariationRepository(AppDataSource)
const productVariationOrderRepository: ProductVariationOrderRepository = new ProductVariationOrderRepository(AppDataSource)
const refreshTokenRepository: RefreshTokenRepository = new RefreshTokenRepository(AppDataSource)
const roleRepository: RoleRepository = new RoleRepository(AppDataSource)
const userRepository: UserRepository = new UserRepository(AppDataSource)

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
    userRepository
}

export {
    CategoryRepository, ComandaRepository, OrderRepository, ProductRepository, ProductOrderRepository, ProductVariationRepository,
    ProductVariationOrderRepository, RefreshTokenRepository, RoleRepository, UserRepository
}