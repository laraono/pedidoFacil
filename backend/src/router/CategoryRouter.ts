import express, { Request, Response } from 'express';
import { categoryController } from '../controller';
<<<<<<< HEAD
import { catchAsync } from '../middleware';

// 🔥 Importações da nossa Blindagem
import { validateRequest } from '../middleware/validateRequest';
import { createCategorySchema } from '../dto/category/CreateCategoryDTO';

=======
import { validateCreateCategory } from '../validator';
import { catchAsync } from '../middleware';
>>>>>>> feature-104
const authenticate = require('../middleware/authenticate');
const roleAccessControl = require('../middleware/roleAccessControl');

export const categoryRouter = express.Router();

<<<<<<< HEAD
categoryRouter.get('/categories', authenticate, roleAccessControl.checkPermission('CARDAPIO'), catchAsync((req: Request, res: Response) => categoryController.listCategories(req, res)));

categoryRouter.post('/categories', authenticate, roleAccessControl.checkPermission('CARDAPIO'), validateRequest(createCategorySchema), catchAsync((req: Request, res: Response) => categoryController.createCategory(req, res)));

categoryRouter.put('/categories/:id', authenticate, roleAccessControl.checkPermission('CARDAPIO'), validateRequest(createCategorySchema), catchAsync((req: Request, res: Response) => categoryController.updateCategory(req, res)));

categoryRouter.delete('/categories/:id', authenticate, roleAccessControl.checkPermission('CARDAPIO'), catchAsync((req: Request, res: Response) => categoryController.deleteCategory(req, res)));

categoryRouter.patch('/categories/:id/restore', authenticate, roleAccessControl.checkPermission('CARDAPIO'), catchAsync((req: Request, res: Response) => categoryController.restoreCategory(req, res)));
=======
categoryRouter.get(
  '/categories',
  authenticate,
  roleAccessControl.checkPermission('CARDAPIO'),
  catchAsync((req: Request, res: Response) =>
    categoryController.listCategories(req, res),
  ),
);

categoryRouter.post(
  '/categories',
  authenticate,
  roleAccessControl.checkPermission('CARDAPIO'),
  validateCreateCategory,
  catchAsync((req: Request, res: Response) =>
    categoryController.createCategory(req, res),
  ),
);

categoryRouter.put(
  '/categories/:id',
  authenticate,
  roleAccessControl.checkPermission('CARDAPIO'),
  catchAsync((req: Request, res: Response) =>
    categoryController.updateCategory(req, res),
  ),
);

categoryRouter.delete(
  '/categories/:id',
  authenticate,
  roleAccessControl.checkPermission('CARDAPIO'),
  catchAsync((req: Request, res: Response) =>
    categoryController.deleteCategory(req, res),
  ),
);

categoryRouter.patch(
  '/categories/:id/restore',
  authenticate,
  roleAccessControl.checkPermission('CARDAPIO'),
  catchAsync((req: Request, res: Response) =>
    categoryController.restoreCategory(req, res),
  ),
);
>>>>>>> feature-104
