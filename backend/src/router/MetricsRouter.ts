import { Router } from 'express';
import { metricsController } from '../controller';
import { authenticate } from '../middleware/authenticate';
import { subscriptionMiddleware } from '../middleware';

const metricsRouter = Router();

metricsRouter.use(authenticate, subscriptionMiddleware);
metricsRouter.get('/receipts', metricsController.getReceiptMetrics);
metricsRouter.get('/dashboard', metricsController.getDashboardOverview);

export { metricsRouter };