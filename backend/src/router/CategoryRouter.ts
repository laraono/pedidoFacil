import express from 'express'
import { categoryController } from '../controller';
import { validateCreateCategory } from '../validator';
import { catchAsync } from '../middleware';

export const categoryRouter = express.Router();

categoryRouter.get('/categories', authenticate, catchAsync((req, res) => categoryController.listCategories(req, res)))

categoryRouter.post('/categories', authenticate, validateCreateCategory, catchAsync((req, res) => categoryController.createCategory(req, res)))