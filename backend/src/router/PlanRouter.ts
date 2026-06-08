import express from 'express';
import { planController } from '../controller';

const planRouter = express.Router();

planRouter.get('/plans', planController.listPlans);
planRouter.get('/plans/:planId', planController.getPlan);

export { planRouter };
