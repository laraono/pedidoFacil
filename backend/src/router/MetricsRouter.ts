import { Router } from 'express';
import { MetricsController } from '../controller/MetricsController';
import authenticate from '../middleware/authenticate'; 
import { checkPermission } from '../middleware/roleAccessControl'; 

const metricsRouter = Router();
const metricsController = new MetricsController();


metricsRouter.get(
    '/', 
    authenticate, 
    checkPermission('DASHBOARD_VIEW', 'ALL'), 
    metricsController.getMetrics
);

export { metricsRouter };