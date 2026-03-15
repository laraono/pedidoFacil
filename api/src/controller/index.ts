import { categoryService, comandaService, orderService, productService } from '../service'
import { CategoryController } from './CategoryController'
import { ComandaController } from './ComandaController'
import { OrderController } from './OrderController'
import { ProductController } from './ProductController'

const categoryController: CategoryController = new CategoryController(categoryService)
const comandaController: ComandaController = new ComandaController(comandaService)
const orderController: OrderController = new OrderController(orderService)
const productController: ProductController = new ProductController(productService)

export {
    categoryController,
    comandaController,
    orderController,
    productController
}

export {
    CategoryController, 
    ComandaController, 
    OrderController,
    ProductController
}