import { Router, Request, Response } from 'express';
import { catchAsync } from '../middleware/error/catchAsync';
import { authenticateAdmin } from '../middleware/authenticateAdmin';
import { AdminController } from '../controller/AdminController';
import { AdminService } from '../service/AdminService';
import { AdminSubscriptionMetricsService } from '../service/AdminSubscriptionMetricsService';
import { AppDataSource } from '../database/data-source';
import { planController, subscriptionController, establishmentController } from '../controller';

const adminService = new AdminService(AppDataSource);
const adminController = new AdminController(adminService);
const adminMetricsService = new AdminSubscriptionMetricsService(AppDataSource);

const adminRouter = Router();

adminRouter.get('/public/plans', planController.listPlans);

adminRouter.use(authenticateAdmin);

adminRouter.get('/plans', planController.listPlans);
adminRouter.get('/plans/:planId', planController.getPlan);
adminRouter.post('/plans', planController.createPlan);
adminRouter.put('/plans/:planId', planController.updatePlan);
adminRouter.delete('/plans/:planId', planController.deletePlan);

adminRouter.get('/admins', adminController.list);
adminRouter.get('/admins/:adminId', adminController.getById);
adminRouter.post('/admins', adminController.create);
adminRouter.put('/admins/:adminId', adminController.update);
adminRouter.delete('/admins/:adminId', adminController.delete);

adminRouter.get('/establishments', establishmentController.listForAdmin);
adminRouter.get('/establishments/:id', establishmentController.getDetailForAdmin);

adminRouter.get('/subscriptions', subscriptionController.listSubscriptions);
adminRouter.get('/subscriptions/:subscriptionId', subscriptionController.getSubscription);
adminRouter.put('/subscriptions/:subscriptionId/price', subscriptionController.updateSubscriptionPrice);
adminRouter.post('/subscriptions/:subscriptionId/cancel', subscriptionController.cancelSubcription);

adminRouter.get(
    '/metrics/subscriptions',
    catchAsync(async (_req: Request, res: Response) => {
        const metrics = await adminMetricsService.getMetrics();
        return res.status(200).json(metrics);
    })
);

export { adminRouter };
