import { Router } from 'express';
import { MetricsController } from '../controller/MetricsController';
import authenticate from '../middleware/authenticate'; 
import { checkPermission } from '../middleware/roleAccessControl'; 

const metricsRouter = Router();
const metricsController = new MetricsController();

/**
 * ROTA DE DASHBOARD GERENCIAL
 * Exemplo de uso: GET /api/metricas?startDate=2026-03-01&endDate=2026-03-31
 */
metricsRouter.get(
    '/', 
    authenticate, 
    checkPermission('DASHBOARD_VIEW', 'ALL'), 
    metricsController.getMetrics
);

export { metricsRouter };