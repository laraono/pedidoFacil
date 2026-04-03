import express from 'express'
import { productController } from '../controller';
import { validateCreateProduct, validateDeleteProduct, validateListProducts, validateListProductsByCategories, validateUpdateProduct } from '../validator/product';
import { catchAsync } from '../middleware';
const authenticate = require('../middleware/authenticate');
const tenant = require('../middleware/tenant');
const roleAccessControl = require('../middleware/roleAccessControl');

export const productRouter = express.Router();

productRouter.post('/products', authenticate, roleAccessControl.checkPermission('CARDAPIO'), validateCreateProduct, catchAsync((req, res) => productController.createProduct(req, res)));

productRouter.get('/products', authenticate, roleAccessControl.checkPermission('CARDAPIO'), validateListProducts, catchAsync((req, res) => productController.listProducts(req, res)));

productRouter.get('/categories/:categoryId/products', authenticate, roleAccessControl.checkPermission('CARDAPIO'), validateListProductsByCategories, catchAsync((req, res) => productController.listProductsByCategory(req, res)));

productRouter.get('/categories/:categoryId/products/active', authenticate, roleAccessControl.checkPermission('CARDAPIO'), validateListProductsByCategories, catchAsync((req, res) => productController.listActiveProductsByCategory(req, res)));

productRouter.put('/categories/:categoryId/products/:productId', authenticate, roleAccessControl.checkPermission('CARDAPIO'), validateUpdateProduct, catchAsync((req, res) => productController.updateProduct(req, res)));

productRouter.delete('/categories/:categoryId/products/:productId', authenticate, roleAccessControl.checkPermission('CARDAPIO'), validateDeleteProduct, catchAsync((req, res) => productController.deleteProduct(req, res)));
