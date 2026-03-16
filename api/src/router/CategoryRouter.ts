import express from 'express'
import { categoryController } from '../controller';
import { validateCreateCategory } from '../validator';

export const categoryRouter = express.Router();

categoryRouter.get('/categories', validateCreateCategory, (req, res) => categoryController.listCategories(req, res))

categoryRouter.post('/categories', (req, res) => categoryController.createCategory(req, res))