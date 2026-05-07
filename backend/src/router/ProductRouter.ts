import express, { Request, Response } from 'express';
import { productController } from '../controller';
import { catchAsync, subscriptionMiddleware } from '../middleware';
import { validateUpload } from '../middleware/validateUpload';
import { validateRequest } from '../middleware/validateRequest';
import { createProductSchema } from '../dto/product/CreateProductDTO';
import { updateProductSchema } from '../dto/product/UpdateProductDTO';
import { validateListProductsByCategories } from '../validator/product';
const authenticate = require('../middleware/authenticate');
const tenant = require('../middleware/tenant');
const roleAccessControl = require('../middleware/roleAccessControl');

export const productRouter = express.Router();

productRouter.post(
  '/products',
  authenticate,
  subscriptionMiddleware,
  roleAccessControl.checkPermission('CARDAPIO'),
  validateUpload.single('imagem'),
  validateRequest(createProductSchema),
  catchAsync((req: Request, res: Response) => productController.createProduct(req, res))
);

productRouter.get(
  '/products',
  authenticate,
  subscriptionMiddleware,
  roleAccessControl.checkPermission('CARDAPIO'),
  catchAsync((req: Request, res: Response) => productController.listProducts(req, res))
);

productRouter.get(
  '/categories/:categoryId/products',
  authenticate,
  subscriptionMiddleware,
  tenant.verifyTenancy('CATEGORIA', 'categoryId'),
  roleAccessControl.checkPermission('CARDAPIO'),
  catchAsync((req: Request, res: Response) => productController.listProductsByCategory(req, res))
);

productRouter.get(
  '/categories/:categoryId/products/active',
  authenticate,
  subscriptionMiddleware,
  roleAccessControl.checkPermission('CARDAPIO'),
  validateListProductsByCategories,
  catchAsync((req: Request, res: Response) => productController.listProductsByCategory(req, res))
);

productRouter.put(
  '/categories/:categoryId/products/:productId',
  authenticate,
  subscriptionMiddleware,
  roleAccessControl.checkPermission('CARDAPIO'),
  validateUpload.single('imagem'),
  catchAsync((req: Request, res: Response) => productController.updateProduct(req, res))
);

productRouter.put(
  '/categories/:categoryId/products/:productId/status',
  authenticate,
  subscriptionMiddleware,
  roleAccessControl.checkPermission('CARDAPIO'),
  catchAsync((req: Request, res: Response) => productController.updateProduct(req, res))
);

productRouter.delete(
  '/categories/:categoryId/products/:productId',
  authenticate,
  subscriptionMiddleware,
  roleAccessControl.checkPermission('CARDAPIO'),
  catchAsync((req: Request, res: Response) => productController.deleteProduct(req, res))
);

productRouter.put(
  '/products/:id',
  authenticate,
  subscriptionMiddleware,
  roleAccessControl.checkPermission('CARDAPIO'),
  validateUpload.single('imagem'),
  validateRequest(updateProductSchema),
  catchAsync((req: Request, res: Response) => productController.updateProduct(req, res))
);

productRouter.delete(
  '/products/:id',
  authenticate,
  subscriptionMiddleware,
  roleAccessControl.checkPermission('CARDAPIO'),
  catchAsync((req: Request, res: Response) => productController.deleteProduct(req, res))
);

productRouter.patch(
  '/products/:id/restore',
  authenticate,
  subscriptionMiddleware,
  roleAccessControl.checkPermission('CARDAPIO'),
  catchAsync((req: Request, res: Response) => productController.restoreProduct(req, res))
);
