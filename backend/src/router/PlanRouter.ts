import { Router } from 'express';
import authenticate from '../middleware/authenticate';
import { planController } from '../controller';

const planRouter = Router();


planRouter.get('/plans', planController.listPlans);
planRouter.get('/plans/:planId', planController.getPlan);
planRouter.put('/plans/:planId', planController.updatePlan);
planRouter.post('/plans', planController.createPlan);
planRouter.delete('/plans', planController.deletePlan);


export { planRouter };