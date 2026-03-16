import express from 'express'
import { productController } from '../controller';
import { validateCreateProduct } from '../validator/product';

export const productRouter = express.Router();

productRouter.post('/products', validateCreateProduct, (req, res) => productController.createProduct(req, res));

productRouter.get('/products', (req, res) => productController.listProducts(req, res));

productRouter.post('/categories/:categoryId/products', (req, res) => productController.listProductsByCategory(req, res));
