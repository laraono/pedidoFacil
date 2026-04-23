import express from 'express'
import { productController } from '../controller';
import { validateCreateProduct } from '../validator/product';
import { catchAsync } from '../middleware';
const authenticate = require('../middleware/authenticate');
const tenant = require('../middleware/tenant');
const roleAccessControl = require('../middleware/roleAccessControl');

export const productRouter = express.Router();

productRouter.post('/products', authenticate, roleAccessControl.checkPermission('CARDAPIO'), validateCreateProduct, catchAsync((req, res) => productController.createProduct(req, res)));

productRouter.get('/products', authenticate, roleAccessControl.checkPermission('CARDAPIO'), catchAsync((req, res) => productController.listProducts(req, res)));

productRouter.post('/categories/:categoryId/products', authenticate, tenant.verifyTenancy('CATEGORIA', 'categoryId'),  roleAccessControl.checkPermission('CARDAPIO'), catchAsync((req, res) => productController.listProductsByCategory(req, res)));
