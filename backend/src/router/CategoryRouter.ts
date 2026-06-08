import express, { Request, Response } from 'express';
import { categoryController } from '../controller';
import { catchAsync } from '../middleware';
import { validateUpload } from '../middleware/validateUpload';
import { validateRequest } from '../middleware/validateRequest';
import { createCategorySchema } from '../dto/category/CreateCategoryDTO';
import { updateCategorySchema } from '../dto/category/UpdateCategoryDTO';
import { authenticate } from '../middleware/authenticate';
import { checkPermission } from '../middleware/roleAccessControl';
import { subscriptionMiddleware } from '../middleware';

export const categoryRouter = express.Router();

categoryRouter.use(authenticate, subscriptionMiddleware);

categoryRouter.get(
  '/categories',
  checkPermission('CARDAPIO'),
  catchAsync((req: Request, res: Response) =>
    categoryController.listCategories(req, res),
  ),
);

categoryRouter.post(
  '/categories',
  checkPermission('CARDAPIO'),
  validateUpload.single('imagem'),
  validateRequest(createCategorySchema),
  catchAsync((req: Request, res: Response) =>
    categoryController.createCategory(req, res),
  ),
);

categoryRouter.put(
  '/categories/:id',
  checkPermission('CARDAPIO'),
  validateUpload.single('imagem'),
  validateRequest(updateCategorySchema),
  catchAsync((req: Request, res: Response) =>
    categoryController.updateCategory(req, res),
  ),
);

categoryRouter.patch(
  '/categories/:id/deactivate',
  checkPermission('CARDAPIO'),
  catchAsync((req: Request, res: Response) =>
    categoryController.deactivateCategory(req, res),
  ),
);

categoryRouter.patch(
  '/categories/:id/reactivate',
  checkPermission('CARDAPIO'),
  catchAsync((req: Request, res: Response) =>
    categoryController.reactivateCategory(req, res),
  ),
);

categoryRouter.delete(
  '/categories/:id',
  checkPermission('CARDAPIO'),
  catchAsync((req: Request, res: Response) =>
    categoryController.deleteCategory(req, res),
  ),
);
