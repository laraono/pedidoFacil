import express, { Request, Response } from 'express';
import multer from 'multer';
import { productController } from '../controller';
import { validateCreateProduct, validateDeleteProduct, validateListProducts, validateListProductsByCategories } from '../validator/product';
import { catchAsync, subscriptionMiddleware } from '../middleware';
const authenticate = require('../middleware/authenticate');
const tenant = require('../middleware/tenant');
const roleAccessControl = require('../middleware/roleAccessControl');

export const productRouter = express.Router();
const upload = multer()

productRouter.use(subscriptionMiddleware)

productRouter.post('/products', authenticate, roleAccessControl.checkPermission('CARDAPIO'), upload.single('image'), validateCreateProduct, catchAsync((req: Request, res: Response) => productController.createProduct(req, res)));

productRouter.get('/products', authenticate, roleAccessControl.checkPermission('CARDAPIO'), validateListProducts, catchAsync((req: Request, res: Response) => productController.listProducts(req, res)));

productRouter.get('/categories/:categoryId/products', authenticate, roleAccessControl.checkPermission('CARDAPIO'), validateListProductsByCategories, catchAsync((req: Request, res: Response) => productController.listProductsByCategory(req, res)));

productRouter.get('/categories/:categoryId/products/active', authenticate, roleAccessControl.checkPermission('CARDAPIO'), validateListProductsByCategories, catchAsync((req: Request, res: Response) => productController.listActiveProductsByCategory(req, res)));

productRouter.put('/categories/:categoryId/products/:productId', authenticate, roleAccessControl.checkPermission('CARDAPIO'), upload.single('image'), catchAsync((req: Request, res: Response) => productController.updateProduct(req, res)));

productRouter.put('/categories/:categoryId/products/:productId/status', authenticate, roleAccessControl.checkPermission('CARDAPIO'), catchAsync((req: Request, res: Response) => productController.updateProductStatus(req, res)));

productRouter.delete('/categories/:categoryId/products/:productId', authenticate, roleAccessControl.checkPermission('CARDAPIO'), validateDeleteProduct, catchAsync((req: Request, res: Response) => productController.deleteProduct(req, res)));

productRouter.put(
  '/products/:id', 
  authenticate, 
  roleAccessControl.checkPermission('CARDAPIO'), 
  catchAsync((req: Request, res: Response) => productController.updateProduct(req, res))
);

productRouter.delete(
  '/products/:id', 
  authenticate, 
  roleAccessControl.checkPermission('CARDAPIO'), 
  catchAsync((req: Request, res: Response) => productController.deleteProduct(req, res))
);

productRouter.put(
  '/products/:id', 
  authenticate, 
  roleAccessControl.checkPermission('CARDAPIO'), 
  catchAsync((req: Request, res: Response) => productController.updateProduct(req, res))
);

productRouter.delete(
  '/products/:id', 
  authenticate, 
  roleAccessControl.checkPermission('CARDAPIO'), 
  catchAsync((req: Request, res: Response) => productController.deleteProduct(req, res))
);