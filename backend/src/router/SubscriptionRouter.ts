import express from 'express';
import { authenticate } from '../middleware/authenticate';
import { checkPermission } from '../middleware/roleAccessControl';
import { Permission } from '../enum';
import { subscriptionController } from '../controller';
import { validateRequest } from '../middleware/validateRequest';
import { createSubscriptionSchema } from '../dto/subscription/CreateSubscriptionDTO';
import { restoreSubscriptionSchema } from '../dto/subscription/RestoreSubscriptionDTO';

const subscriptionRouter = express.Router();

subscriptionRouter.get('/subscriptions/', authenticate, subscriptionController.listSubscriptions);
subscriptionRouter.get('/plans/:planId/subscriptions/', authenticate, subscriptionController.listSubscriptionsByPlan);
subscriptionRouter.get('/plans/:planId/subscriptions/:subscriptionId', authenticate, subscriptionController.getSubscription);
subscriptionRouter.post('/process-order', authenticate, validateRequest(createSubscriptionSchema), subscriptionController.processCardInfo);
subscriptionRouter.post('/process-order/:subscriptionId', authenticate, validateRequest(restoreSubscriptionSchema), subscriptionController.restoreSubscription);
subscriptionRouter.put('/plans/:planId/subscriptions/:subscriptionId', authenticate, subscriptionController.updateSubscriptionPrice);
subscriptionRouter.get('/process-oauth', subscriptionController.processCardInfo)
subscriptionRouter.get('/subscriptions/establishment', authenticate, checkPermission(Permission.ASSINATURA), subscriptionController.getEstablishmentSubscription)
subscriptionRouter.get('/subscriptions/history', authenticate, checkPermission(Permission.ASSINATURA), subscriptionController.getEstablishmentHistory)
subscriptionRouter.patch('/subscriptions/change-plan', authenticate, checkPermission(Permission.ASSINATURA), subscriptionController.changePlan)
subscriptionRouter.post('/subscriptions/:subscriptionId/cancel', authenticate, checkPermission(Permission.ASSINATURA), subscriptionController.cancelSubcription)
subscriptionRouter.get('/subscriptions/admin/metrics', authenticate, checkPermission(Permission.ASSINATURA), subscriptionController.getAdminMetrics)

export { subscriptionRouter };
