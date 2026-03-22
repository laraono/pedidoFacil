import { AppDataSource } from '../database'
import { CategoryRepository } from './CategoryRepository'
import { ComandaRepository } from './ComandaRepository'
import { OrderRepository } from './OrderRepository'
import { ProductOrderRepository } from './ProductOrderRepository'
import { ProductRepository } from './ProductRepository'
import { ProductVariationOrderRepository } from './ProductVariationOrderRepository'
import { ProductVariationRepository } from './ProductVariationRepository'

const categoryRepository: CategoryRepository = new CategoryRepository(AppDataSource)
const comandaRepository: ComandaRepository = new ComandaRepository(AppDataSource)
const orderRepository: OrderRepository = new OrderRepository(AppDataSource)
const productRepository: ProductRepository = new ProductRepository(AppDataSource)
const productOrderRepository: ProductOrderRepository = new ProductOrderRepository(AppDataSource)
const productVariationRepository: ProductVariationRepository = new ProductVariationRepository(AppDataSource)
const productVariationOrderRepository: ProductVariationOrderRepository = new ProductVariationOrderRepository(AppDataSource)

export {
    categoryRepository,
    comandaRepository,
    orderRepository,
    productRepository,
    productOrderRepository,
    productVariationRepository,
    productVariationOrderRepository
}

export {
    CategoryRepository, ComandaRepository, OrderRepository, ProductRepository, ProductOrderRepository, ProductVariationRepository,
    ProductVariationOrderRepository
}