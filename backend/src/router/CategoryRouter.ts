import express, { Request, Response } from 'express';
import multer from 'multer';
import { categoryController } from '../controller';
import { validateCreateCategory, validateDeleteCategory, validateListCategories, validateUpdateCategory } from '../validator';
import { catchAsync, subscriptionMiddleware } from '../middleware';

const authenticate = require('../middleware/authenticate');
const roleAccessControl = require('../middleware/roleAccessControl');

export const categoryRouter = express.Router();
const upload = multer()

categoryRouter.get('/categories', authenticate, subscriptionMiddleware, roleAccessControl.checkPermission('CARDAPIO'), validateListCategories, catchAsync((req: Request, res: Response) => categoryController.listCategories(req, res)))

categoryRouter.post('/categories', authenticate, subscriptionMiddleware, roleAccessControl.checkPermission('CARDAPIO'), upload.single('image'), validateCreateCategory, catchAsync((req: Request, res: Response) => categoryController.createCategory(req, res)))

categoryRouter.get('/categories/active', authenticate, subscriptionMiddleware, roleAccessControl.checkPermission('CARDAPIO'), validateListCategories, catchAsync((req: Request, res: Response) => categoryController.listActivieCategories(req, res)))

categoryRouter.put('/categories/:categoryId', authenticate, subscriptionMiddleware, roleAccessControl.checkPermission('CARDAPIO'), upload.single('image'), validateUpdateCategory, catchAsync((req: Request, res: Response) => categoryController.updateCategory(req, res)))

categoryRouter.delete('/categories/:categoryId', authenticate, subscriptionMiddleware, roleAccessControl.checkPermission('CARDAPIO'), validateDeleteCategory, catchAsync((req: Request, res: Response) => categoryController.deleteCategory(req, res)))
;

categoryRouter.put('/categories/:id', authenticate, subscriptionMiddleware, roleAccessControl.checkPermission('CARDAPIO'), catchAsync((req: Request, res: Response) => categoryController.updateCategory(req, res)));

categoryRouter.delete('/categories/:id', authenticate, subscriptionMiddleware, roleAccessControl.checkPermission('CARDAPIO'), catchAsync((req: Request, res: Response) => categoryController.deleteCategory(req, res)));
