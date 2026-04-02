import { Router } from 'express';
import { metricsController } from '../controller'; // Instanciado no index
import authenticate from '../middleware/authenticate';

const metricsRouter = Router();

metricsRouter.use(authenticate);
metricsRouter.get('/receipts', metricsController.getReceiptMetrics);

export { metricsRouter };