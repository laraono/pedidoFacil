import express, { Request, Response } from 'express';
import { productController } from '../controller';
import { catchAsync, subscriptionMiddleware } from '../middleware';
import { validateUpload } from '../middleware/validateUpload';
import { validateRequest } from '../middleware/validateRequest';
import { authenticate } from '../middleware/authenticate';
import { verifyCategoryTenancy, verifyProductTenancy } from '../middleware/tenant';
import { checkPermission } from '../middleware/roleAccessControl';
import { Permission } from '../enum';
import { createProductSchema } from '../dto/product/CreateProductDTO';
import { updateProductSchema } from '../dto/product/UpdateProductDTO';

export const productRouter = express.Router();

productRouter.post(
  '/products',
  authenticate,
  subscriptionMiddleware,
  checkPermission(Permission.CARDAPIO),
  validateUpload.single('imagem'),
  validateRequest(createProductSchema),
  catchAsync((req: Request, res: Response) => productController.createProduct(req, res))
);

productRouter.get(
  '/products',
  authenticate,
  subscriptionMiddleware,
  checkPermission(Permission.CARDAPIO),
  catchAsync((req: Request, res: Response) => productController.listProducts(req, res))
);

productRouter.get(
  '/categories/:categoryId/products',
  authenticate,
  subscriptionMiddleware,
  verifyCategoryTenancy('categoryId'),
  checkPermission(Permission.CARDAPIO),
  catchAsync((req: Request, res: Response) => productController.listProductsByCategory(req, res))
);

productRouter.get(
  '/categories/:categoryId/products/active',
  authenticate,
  subscriptionMiddleware,
  verifyCategoryTenancy('categoryId'),
  checkPermission(Permission.CARDAPIO),
  catchAsync((req: Request, res: Response) => productController.listProductsByCategory(req, res))
);

productRouter.put(
  '/categories/:categoryId/products/:productId',
  authenticate,
  subscriptionMiddleware,
  verifyCategoryTenancy('categoryId'),
  checkPermission(Permission.CARDAPIO),
  validateUpload.single('imagem'),
  validateRequest(updateProductSchema),
  catchAsync((req: Request, res: Response) => productController.updateProduct(req, res))
);

productRouter.put(
  '/categories/:categoryId/products/:productId/status',
  authenticate,
  subscriptionMiddleware,
  verifyCategoryTenancy('categoryId'),
  checkPermission(Permission.CARDAPIO),
  catchAsync((req: Request, res: Response) => productController.updateProduct(req, res))
);

productRouter.delete(
  '/categories/:categoryId/products/:productId',
  authenticate,
  subscriptionMiddleware,
  verifyCategoryTenancy('categoryId'),
  checkPermission(Permission.CARDAPIO),
  catchAsync((req: Request, res: Response) => productController.deleteProduct(req, res))
);

productRouter.put(
  '/products/:id',
  authenticate,
  subscriptionMiddleware,
  verifyProductTenancy('id'),
  checkPermission(Permission.CARDAPIO),
  validateUpload.single('imagem'),
  validateRequest(updateProductSchema),
  catchAsync((req: Request, res: Response) => productController.updateProduct(req, res))
);

productRouter.delete(
  '/products/:id',
  authenticate,
  subscriptionMiddleware,
  verifyProductTenancy('id'),
  checkPermission(Permission.CARDAPIO),
  catchAsync((req: Request, res: Response) => productController.deleteProduct(req, res))
);

productRouter.patch(
  '/products/:id/restore',
  authenticate,
  subscriptionMiddleware,
  verifyProductTenancy('id'),
  checkPermission(Permission.CARDAPIO),
  catchAsync((req: Request, res: Response) => productController.restoreProduct(req, res))
);