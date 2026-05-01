import express from 'express';
import { planController } from '../controller';

const planRouter = express.Router();

planRouter.get('/plans', planController.listPlans);
planRouter.get('/plans/:planId', planController.getPlan);
planRouter.put('/plans/:planId', planController.updatePlan);
planRouter.post('/plans', planController.createPlan);
planRouter.delete('/plans/:planId', planController.deletePlan);


export { planRouter };