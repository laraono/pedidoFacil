import express, { Request, Response } from 'express';
import { productController } from '../controller';
<<<<<<< HEAD
import { catchAsync } from '../middleware';

import { validateRequest } from '../middleware/validateRequest';
import { createProductSchema } from '../dto/product/CreateProductDTO';

=======
import { validateCreateProduct } from '../validator/product';
import { catchAsync } from '../middleware';
>>>>>>> feature-104
const authenticate = require('../middleware/authenticate');
const tenant = require('../middleware/tenant');
const roleAccessControl = require('../middleware/roleAccessControl');

export const productRouter = express.Router();

productRouter.post(
  '/products', 
  authenticate, 
  roleAccessControl.checkPermission('CARDAPIO'), 
<<<<<<< HEAD
  validateRequest(createProductSchema), 
=======
  validateCreateProduct, 
>>>>>>> feature-104
  catchAsync((req: Request, res: Response) => productController.createProduct(req, res))
);

productRouter.get(
  '/products', 
  authenticate, 
  roleAccessControl.checkPermission('CARDAPIO'), 
  catchAsync((req: Request, res: Response) => productController.listProducts(req, res))
);

productRouter.post(
  '/categories/:categoryId/products', 
  authenticate, 
  tenant.verifyTenancy('CATEGORIA', 'categoryId'),  
  roleAccessControl.checkPermission('CARDAPIO'), 
  catchAsync((req: Request, res: Response) => productController.listProductsByCategory(req, res))
);

productRouter.put(
  '/products/:id', 
  authenticate, 
  roleAccessControl.checkPermission('CARDAPIO'), 
<<<<<<< HEAD
  validateRequest(createProductSchema), 
=======
>>>>>>> feature-104
  catchAsync((req: Request, res: Response) => productController.updateProduct(req, res))
);

productRouter.delete(
  '/products/:id', 
  authenticate, 
  roleAccessControl.checkPermission('CARDAPIO'), 
  catchAsync((req: Request, res: Response) => productController.deleteProduct(req, res))
);

productRouter.patch(
  '/products/:id/restore', 
  authenticate, 
  roleAccessControl.checkPermission('CARDAPIO'), 
  catchAsync((req: Request, res: Response) => productController.restoreProduct(req, res))
<<<<<<< HEAD
);
=======
);
>>>>>>> feature-104
