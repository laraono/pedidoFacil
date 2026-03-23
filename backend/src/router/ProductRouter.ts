import express from 'express'
import { productController } from '../controller';
import { validateCreateProduct } from '../validator/product';
import { catchAsync } from '../middleware';

export const productRouter = express.Router();

productRouter.post('/products', validateCreateProduct, catchAsync((req, res) => productController.createProduct(req, res)));

productRouter.get('/products', catchAsync((req, res) => productController.listProducts(req, res)));

productRouter.post('/categories/:categoryId/products', catchAsync((req, res) => productController.listProductsByCategory(req, res)));
