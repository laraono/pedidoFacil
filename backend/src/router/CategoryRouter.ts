import express from 'express'
import { categoryController } from '../controller';
import { validateCreateCategory } from '../validator';
import { catchAsync } from '../middleware';

export const categoryRouter = express.Router();

categoryRouter.get('/categories', catchAsync((req, res) => categoryController.listCategories(req, res)))

categoryRouter.post('/categories', validateCreateCategory, catchAsync((req, res) => categoryController.createCategory(req, res)))