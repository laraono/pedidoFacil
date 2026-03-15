import express from 'express'
import { productController } from '../controller';

export const productRouter = express.Router();

productRouter.post('/products', productController.createProduct);