
import express from 'express';
import authenticate from '../middleware/authenticate';
import { subscriptionController } from '../controller';
import { validateCreateSubscription, validateListSubscriptions, validateRestoreSubscription } from '../validator';

const subscriptionRouter = express.Router();

subscriptionRouter.get('/subscriptions/', authenticate, subscriptionController.listSubscriptions);
subscriptionRouter.get('/plans/:planId/subscriptions/', authenticate, subscriptionController.listSubscriptionsByPlan);
subscriptionRouter.get('/plans/:planId/subscriptions/:subscriptionId', authenticate, subscriptionController.getSubscription);
subscriptionRouter.post('/process-order', authenticate, validateCreateSubscription, subscriptionController.processCardInfo);
subscriptionRouter.post('/process-order/:subscriptionId', authenticate, validateRestoreSubscription, subscriptionController.restoreSubscription);
subscriptionRouter.delete('/plans/:planId/subscriptions/:subscriptionId', subscriptionController.deleteSubcription);
subscriptionRouter.put('/plans/:planId/subscriptions/:subscriptionId', subscriptionController.updateSubscriptionPrice);
subscriptionRouter.post('/plans/:planId/subscriptions/:subscriptionId/cancel', authenticate, subscriptionController.cancelSubcription);
subscriptionRouter.get('/process-oauth', subscriptionController.processCardInfo)
subscriptionRouter.get('/subscriptions/establishment', authenticate, validateListSubscriptions, subscriptionController.getEstablishmentSubscription)
subscriptionRouter.get('/subscriptions/history', authenticate, validateListSubscriptions, subscriptionController.getEstablishmentHistory)

export { subscriptionRouter };