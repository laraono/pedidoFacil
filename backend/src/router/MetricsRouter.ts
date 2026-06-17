import { Router } from 'express';
import { metricsController } from '../controller';
import { authenticate } from '../middleware/authenticate';
import { subscriptionMiddleware } from '../middleware';
import { checkPermission } from '../middleware/roleAccessControl';
import { Permission } from '../enum';

const metricsRouter = Router();

metricsRouter.use(authenticate, subscriptionMiddleware);
metricsRouter.get('/receipts', checkPermission(Permission.RELATORIOS), metricsController.getReceiptMetrics);
metricsRouter.get('/dashboard', checkPermission(Permission.RELATORIOS), metricsController.getDashboardOverview);

export { metricsRouter };
