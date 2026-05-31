import express from 'express';
import { authenticate } from '../middleware/authenticate';
import { subscriptionController } from '../controller';
import { validateRequest } from '../middleware/validateRequest';
import { createSubscriptionSchema } from '../dto/subscription/CreateSubscriptionDTO';
import { restoreSubscriptionSchema } from '../dto/subscription/RestoreSubscriptionDTO';
import { listSubscriptionsSchema } from '../dto/subscription/ListSubscriptionsDTO';

const subscriptionRouter = express.Router();

subscriptionRouter.get(
  '/subscriptions/',
  authenticate,
  subscriptionController.listSubscriptions,
);

subscriptionRouter.get(
  '/plans/:planId/subscriptions/',
  authenticate,
  subscriptionController.listSubscriptionsByPlan,
);

subscriptionRouter.get(
  '/plans/:planId/subscriptions/:subscriptionId',
  authenticate,
  subscriptionController.getSubscription,
);

subscriptionRouter.get(
  '/subscriptions/establishment',
  authenticate,
  validateRequest(listSubscriptionsSchema),
  subscriptionController.getEstablishmentSubscription,
);

subscriptionRouter.get(
  '/subscriptions/history',
  authenticate,
  validateRequest(listSubscriptionsSchema),
  subscriptionController.getEstablishmentHistory,
);

subscriptionRouter.post(
  '/process-order',
  authenticate,
  validateRequest(createSubscriptionSchema),
  subscriptionController.processCardInfo,
);

subscriptionRouter.post(
  '/process-order/:subscriptionId',
  authenticate,
  validateRequest(restoreSubscriptionSchema),
  subscriptionController.restoreSubscription,
);

subscriptionRouter.get(
  '/process-oauth',
  subscriptionController.processCardInfo,
);

subscriptionRouter.put(
  '/plans/:planId/subscriptions/:subscriptionId',
  authenticate,
  subscriptionController.updateSubscriptionPrice,
);

subscriptionRouter.patch(
  '/subscriptions/schedule-plan',
  authenticate,
  subscriptionController.schedulePlan,
);

subscriptionRouter.post(
  '/subscriptions/:subscriptionId/cancel',
  authenticate,
  subscriptionController.cancelSubcription,
);

subscriptionRouter.delete(
  '/plans/:planId/subscriptions/:subscriptionId',
  authenticate,
  subscriptionController.deleteSubcription,
);

export { subscriptionRouter };