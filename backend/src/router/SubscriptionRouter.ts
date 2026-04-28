
import { Router } from 'express';
import authenticate from '../middleware/authenticate';
import { subscriptionController } from '../controller';
import { validateCreateSubscription } from '../validator';

const subscriptionRouter = Router();

subscriptionRouter.use(authenticate);

subscriptionRouter.get('/subscriptions/', subscriptionController.listSubscriptions);
subscriptionRouter.get('/plans/:planId/subscriptions/', subscriptionController.listSubscriptionsByPlan);
subscriptionRouter.get('/plans/:planId/subscriptions/:subscriptionId', subscriptionController.getSubscription);
subscriptionRouter.post('/process-order', validateCreateSubscription, subscriptionController.processCardInfo);
subscriptionRouter.delete('/plans/:planId/subscriptions/:subscriptionId', subscriptionController.deleteSubcription);
subscriptionRouter.put('/plans/:planId/subscriptions/:subscriptionId', subscriptionController.updateSubscriptionPrice);
subscriptionRouter.post('/plans/:planId/subscriptions/:subscriptionId/cancel', subscriptionController.cancelSubcription);
subscriptionRouter.get('/process-oauth', subscriptionController.processCardInfo)

export { subscriptionRouter };