import express from 'express';
import { menuLimiter, menuController } from '../controller';
import { catchAsync } from '../middleware';
const authenticate = require('../middleware/authenticate');

export const menuRouter = express.Router();

menuRouter.get('/menu', menuLimiter, authenticate, catchAsync((req, res) => menuController.getMenu(req, res)));