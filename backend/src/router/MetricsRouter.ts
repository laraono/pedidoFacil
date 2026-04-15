import { Router } from 'express';
import { metricsController } from '../controller'; 
import authenticate from '../middleware/authenticate';

const metricsRouter = Router();

metricsRouter.use(authenticate);
metricsRouter.get('/receipts', metricsController.getReceiptMetrics);
metricsRouter.get('/dashboard', metricsController.getDashboardOverview);

export { metricsRouter };