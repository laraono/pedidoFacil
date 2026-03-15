import { comandaService } from '../service'
import { ComandaController } from './ComandaController'

export {ComandaController} from './ComandaController'

const comandaController: ComandaController = new ComandaController(comandaService)

export {
    comandaController
}