import express, { Request, Response } from 'express';
import { menuController } from '../controller';
import { catchAsync, subscriptionMiddleware } from '../middleware';
const authenticate = require('../middleware/authenticate');

export const menuRouter = express.Router();

menuRouter.use(subscriptionMiddleware)

menuRouter.get('/menu', catchAsync((req: Request, res: Response) => menuController.getMenu(req, res)));