import express from 'express';
import { planController } from '../controller';
import { authenticate } from '../middleware/authenticate';

const planRouter = express.Router();

planRouter.get('/plans', planController.listPlans);
planRouter.get('/plans/:planId', planController.getPlan);
planRouter.put('/plans/:planId', authenticate, planController.updatePlan);
planRouter.post('/plans', authenticate,planController.createPlan);
planRouter.delete('/plans/:planId', authenticate, planController.deletePlan);


export { planRouter };