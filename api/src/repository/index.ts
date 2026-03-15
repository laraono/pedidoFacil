import { AppDataSource } from '../database'
import { ComandaRepository } from './ComandaRepository'

export {ComandaRepository} from './ComandaRepository'

const comandaRepository: ComandaRepository = new ComandaRepository(AppDataSource)

export {
    comandaRepository
}