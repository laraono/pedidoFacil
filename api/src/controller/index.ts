import { categoryService, comandaService } from '../service'
import { CategoryController } from './CategoryController'
import { ComandaController } from './ComandaController'

export {CategoryController} from './CategoryController'
export {ComandaController} from './ComandaController'

const categoryController: CategoryController = new CategoryController(categoryService)
const comandaController: ComandaController = new ComandaController(comandaService)

export {
    categoryController,
    comandaController
}