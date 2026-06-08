import { Router } from 'express';
import { paymentLimiter, paymentController } from '../controller';
import { authenticate } from '../middleware/authenticate';
import { subscriptionMiddleware } from '../middleware';

const paymentRouter = Router();

paymentRouter.use(authenticate, subscriptionMiddleware)

paymentRouter.get('/', authenticate, paymentLimiter, paymentController.listPayments);
paymentRouter.get('/:paymentId', authenticate, paymentLimiter, paymentController.getPaymentDetails);
paymentRouter.post('/:paymentId/refund', authenticate, paymentLimiter, paymentController.refundPayment);

export { paymentRouter };