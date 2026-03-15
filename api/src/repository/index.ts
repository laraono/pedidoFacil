import { AppDataSource } from '../database'
import { AddonRepository } from './AddonRepository'
import { CategoryRepository } from './CategoryRepository'
import { ComandaRepository } from './ComandaRepository'
import { OrderRepository } from './OrderRepository'
import { ProductRepository } from './ProductRepository'
import { SizeRepository } from './SizeRepository'

const addonRepository: AddonRepository = new AddonRepository(AppDataSource)
const categoryRepository: CategoryRepository = new CategoryRepository(AppDataSource)
const comandaRepository: ComandaRepository = new ComandaRepository(AppDataSource)
const orderRepository: OrderRepository = new OrderRepository(AppDataSource)
const productRepository: ProductRepository = new ProductRepository(AppDataSource)
const sizeRepository: SizeRepository = new SizeRepository(AppDataSource)

export {
    addonRepository,
    categoryRepository,
    comandaRepository,
    orderRepository,
    productRepository,
    sizeRepository
}

export {
    AddonRepository, CategoryRepository, ComandaRepository, OrderRepository, ProductRepository, SizeRepository
}