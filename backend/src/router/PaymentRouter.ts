import { Router } from 'express';
import { paymentLimiter, paymentController } from '../controller';
import { authenticate } from '../middleware/authenticate';
import { subscriptionMiddleware } from '../middleware';

const paymentRouter = Router();

paymentRouter.get('/', authenticate, subscriptionMiddleware, paymentLimiter, paymentController.listPayments);
paymentRouter.get('/:paymentId', authenticate, subscriptionMiddleware, paymentLimiter, paymentController.getPaymentDetails);
paymentRouter.post('/:paymentId/refund', authenticate, subscriptionMiddleware, paymentLimiter, paymentController.refundPayment);

export { paymentRouter };