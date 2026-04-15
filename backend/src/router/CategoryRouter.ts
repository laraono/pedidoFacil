import express, { Request, Response } from 'express';
import { categoryController } from '../controller';
import { catchAsync } from '../middleware';

// 🔥 Importações da nossa Blindagem
import { validateRequest } from '../middleware/validateRequest';
import { createCategorySchema } from '../dto/category/CreateCategoryDTO';

const authenticate = require('../middleware/authenticate');
const roleAccessControl = require('../middleware/roleAccessControl');

export const categoryRouter = express.Router();

categoryRouter.get('/categories', authenticate, roleAccessControl.checkPermission('CARDAPIO'), catchAsync((req: Request, res: Response) => categoryController.listCategories(req, res)));

categoryRouter.post('/categories', authenticate, roleAccessControl.checkPermission('CARDAPIO'), validateRequest(createCategorySchema), catchAsync((req: Request, res: Response) => categoryController.createCategory(req, res)));

categoryRouter.put('/categories/:id', authenticate, roleAccessControl.checkPermission('CARDAPIO'), validateRequest(createCategorySchema), catchAsync((req: Request, res: Response) => categoryController.updateCategory(req, res)));

categoryRouter.delete('/categories/:id', authenticate, roleAccessControl.checkPermission('CARDAPIO'), catchAsync((req: Request, res: Response) => categoryController.deleteCategory(req, res)));

categoryRouter.patch('/categories/:id/restore', authenticate, roleAccessControl.checkPermission('CARDAPIO'), catchAsync((req: Request, res: Response) => categoryController.restoreCategory(req, res)));