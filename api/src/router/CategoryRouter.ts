import express from 'express'
import { categoryController } from '../controller';
import { validateCreateCategory } from '../validator';

export const categoryRouter = express.Router();

categoryRouter.get('/categories', (req, res) => categoryController.listCategories(req, res))

categoryRouter.post('/categories', validateCreateCategory, (req, res) => categoryController.createCategory(req, res))