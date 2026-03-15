import express from 'express'
import { categoryController } from '../controller';

export const categoryRouter = express.Router();

categoryRouter.get('/categories',categoryController.listCategories);

categoryRouter.post('/categories', categoryController.createCategory);