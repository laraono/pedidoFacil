import express from 'express'
import { productController } from '../controller';
import { validateCreateProduct } from '../validator/product';

export const productRouter = express.Router();

productRouter.post('/products', validateCreateProduct, (req, res) => productController.createProduct(req, res));