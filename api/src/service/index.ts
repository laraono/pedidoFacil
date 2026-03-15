import { comandaRepository } from '../repository'
import { ComandaService } from './ComandaService'

export {ComandaService} from './ComandaService'

const comandaService: ComandaService = new ComandaService(comandaRepository)

export {
    comandaService
}