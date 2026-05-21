import express, { Request, Response } from 'express';
import { menuController } from '../controller';
import { catchAsync } from '../middleware';

export const menuRouter = express.Router();

menuRouter.get('/menu', catchAsync((req: Request, res: Response) => menuController.getMenu(req, res)));
