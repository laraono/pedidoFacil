import { Router } from 'express';
import { metricsController } from '../controller';
import { authenticate } from '../middleware/authenticate';
import { subscriptionMiddleware } from '../middleware';
import { checkPermission } from '../middleware/roleAccessControl';

const metricsRouter = Router();

metricsRouter.use(authenticate, subscriptionMiddleware);
metricsRouter.get('/receipts', checkPermission('RELATORIOS'), metricsController.getReceiptMetrics);
metricsRouter.get('/dashboard', checkPermission('RELATORIOS'), metricsController.getDashboardOverview);

export { metricsRouter };
