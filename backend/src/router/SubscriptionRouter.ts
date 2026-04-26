
import { Router } from 'express';
import authenticate from '../middleware/authenticate';
import { subscriptionController } from '../controller';
import { validateCreateSubscription } from '../validator';

const subscriptionRouter = Router();

subscriptionRouter.use(authenticate);

subscriptionRouter.get('/subscriptions/', subscriptionController.listSubscriptions);
subscriptionRouter.get('/plans/:id/subscriptions/', subscriptionController.listSubscriptionsByPlan);
subscriptionRouter.get('/plans/:id/subscriptions/:subscriptionId', subscriptionController.getSubscription);
subscriptionRouter.post('/process-order', validateCreateSubscription, subscriptionController.processCardInfo);
subscriptionRouter.delete('/plans/:id/subscriptions/:id', subscriptionController.deleteSubcription);
subscriptionRouter.post('/plans/:id/subscriptions/:id/cancel', subscriptionController.cancelSubcription);
subscriptionRouter.get('/process-oauth', subscriptionController.processCardInfo)

export { subscriptionRouter };