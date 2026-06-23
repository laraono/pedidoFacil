import { Router, Request, Response } from 'express';
import { catchAsync } from '../middleware/error/catchAsync';
import { authenticateAdmin } from '../middleware/authenticateAdmin';
import { AdminController } from '../controller/AdminController';
import { AdminService } from '../service/AdminService';
import { AdminSubscriptionMetricsService } from '../service/AdminSubscriptionMetricsService';
import { AppDataSource } from '../database/data-source';
import { planController, subscriptionController, establishmentController } from '../controller';
import { adminSubscriptionMetricsRepository, subscriptionPaymentRepository } from '../repository';

const adminService = new AdminService(AppDataSource);
const adminController = new AdminController(adminService);
const adminMetricsService = new AdminSubscriptionMetricsService(adminSubscriptionMetricsRepository, subscriptionPaymentRepository);

const adminRouter = Router();

adminRouter.use(authenticateAdmin);

adminRouter.post('/plans', planController.createPlan);
adminRouter.put('/plans/:planId', planController.updatePlan);
adminRouter.delete('/plans/:planId', planController.deletePlan);

adminRouter.get('/admins', adminController.list);
adminRouter.get('/admins/master-id', adminController.getMasterId);
adminRouter.get('/admins/:adminId', adminController.getById);
adminRouter.post('/admins', adminController.create);
adminRouter.put('/admins/:adminId', adminController.update);
adminRouter.delete('/admins/:adminId', adminController.delete);

adminRouter.get('/establishments', establishmentController.listForAdmin);
adminRouter.get('/establishments/:id', establishmentController.getDetailForAdmin);

adminRouter.get('/subscriptions', subscriptionController.listSubscriptions);

adminRouter.get(
    '/metrics/subscriptions',
    catchAsync(async (req: Request, res: Response) => {
        const period = (req.query.period as '3m' | '6m' | '12m' | 'all') || '12m';
        const metrics = await adminMetricsService.getMetrics(period);
        return res.status(200).json(metrics);
    })
);

export { adminRouter };
