import express, { Request, Response } from 'express';
import { categoryController } from '../controller';
import { catchAsync } from '../middleware';
import { validateUpload } from '../middleware/validateUpload'; 
import { validateRequest } from '../middleware/validateRequest';
import { createCategorySchema } from '../dto/category/CreateCategoryDTO';
import { updateCategorySchema } from '../dto/category/UpdateCategoryDTO'; 

import { authenticate } from '../middleware/authenticate';
import { checkPermission } from '../middleware/roleAccessControl';

export const categoryRouter = express.Router();

categoryRouter.get(
  '/categories',
  authenticate,
  checkPermission('CARDAPIO'),
  catchAsync((req: Request, res: Response) =>
    categoryController.listCategories(req, res),
  ),
);

categoryRouter.post(
  '/categories',
  authenticate,
  checkPermission('CARDAPIO'),
  validateUpload.single('imagem'), 
  validateRequest(createCategorySchema), 
  catchAsync((req: Request, res: Response) =>
    categoryController.createCategory(req, res),
  ),
);

categoryRouter.put(
  '/categories/:id',
  authenticate,
  checkPermission('CARDAPIO'),
  validateUpload.single('imagem'), 
  validateRequest(updateCategorySchema), 
  catchAsync((req: Request, res: Response) =>
    categoryController.updateCategory(req, res),
  ),
);

categoryRouter.delete(
  '/categories/:id',
  authenticate,
  checkPermission('CARDAPIO'),
  catchAsync((req: Request, res: Response) =>
    categoryController.deleteCategory(req, res),
  ),
);

categoryRouter.patch(
  '/categories/:id/restore',
  authenticate,
  checkPermission('CARDAPIO'),
  catchAsync((req: Request, res: Response) =>
    categoryController.restoreCategory(req, res),
  ),
);