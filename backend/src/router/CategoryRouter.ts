import express from 'express'
import { categoryController } from '../controller';
import { validateCreateCategory } from '../validator';
import { catchAsync } from '../middleware';
const authenticate = require('../middleware/authenticate');
const roleAccessControl = require('../middleware/roleAccessControl');

export const categoryRouter = express.Router();

categoryRouter.get('/categories', authenticate, roleAccessControl.checkPermission('CARDAPIO'), catchAsync((req, res) => categoryController.listCategories(req, res)))
categoryRouter.post('/categories', authenticate, roleAccessControl.checkPermission('CARDAPIO'), validateCreateCategory, catchAsync((req, res) => categoryController.createCategory(req, res)))
categoryRouter.put('/categories/:id', authenticate, roleAccessControl.checkPermission('CARDAPIO'), catchAsync((req, res) => categoryController.updateCategory(req, res)))
categoryRouter.delete('/categories/:id', authenticate, roleAccessControl.checkPermission('CARDAPIO'), catchAsync((req, res) => categoryController.deleteCategory(req, res)))
categoryRouter.patch('/categories/:id/restore', authenticate, roleAccessControl.checkPermission('CARDAPIO'), catchAsync((req, res) => categoryController.restoreCategory(req, res)))