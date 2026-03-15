import { AppDataSource } from '../database'
import { ComandaRepository } from './ComandaRepository'
import { OrderRepository } from './OrderRepository'

export {ComandaRepository} from './ComandaRepository'
export {OrderRepository} from './OrderRepository'

const comandaRepository: ComandaRepository = new ComandaRepository(AppDataSource)
const orderRepository: OrderRepository = new OrderRepository(AppDataSource)

export {
    comandaRepository,
    orderRepository
}