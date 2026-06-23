import express, { Request, Response } from 'express';
import { menuController, menuLimiter } from '../controller';
import { catchAsync } from '../middleware';

export const menuRouter = express.Router();

menuRouter.get('/menu', menuLimiter, catchAsync((req: Request, res: Response) => menuController.getMenu(req, res)));
