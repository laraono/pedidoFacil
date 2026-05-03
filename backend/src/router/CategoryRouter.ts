import express, { Request, Response } from 'express';
import { categoryController } from '../controller';
import { validateCreateCategory, validateDeleteCategory, validateListCategories, validateUpdateCategory } from '../validator';
import { catchAsync, subscriptionMiddleware } from '../middleware';
import multer from 'multer';

const authenticate = require('../middleware/authenticate');
const roleAccessControl = require('../middleware/roleAccessControl');

export const categoryRouter = express.Router();
const upload = multer()

categoryRouter.get('/categories', authenticate, subscriptionMiddleware, roleAccessControl.checkPermission('CARDAPIO'), validateListCategories, catchAsync((req: Request, res: Response) => categoryController.listCategories(req, res)));

categoryRouter.post('/categories', authenticate, roleAccessControl.checkPermission('CARDAPIO'), validateCreateCategory, catchAsync((req: Request, res: Response) => categoryController.createCategory(req, res)));

categoryRouter.put('/categories/:id', authenticate, roleAccessControl.checkPermission('CARDAPIO'), catchAsync((req: Request, res: Response) => categoryController.updateCategory(req, res)));

categoryRouter.delete('/categories/:id', authenticate, roleAccessControl.checkPermission('CARDAPIO'), catchAsync((req: Request, res: Response) => categoryController.deleteCategory(req, res)));

categoryRouter.patch('/categories/:id', authenticate, roleAccessControl.checkPermission('CARDAPIO'), catchAsync((req: Request, res: Response) => categoryController.restoreCategory(req, res)));