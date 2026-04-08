import express from 'express';
import { menuController } from '../controller';
import { catchAsync } from '../middleware';
const authenticate = require('../middleware/authenticate');

export const menuRouter = express.Router();

menuRouter.get('/menu', catchAsync((req, res) => menuController.getMenu(req, res)));