import { Router } from 'express';
import authenticate from '../middleware/authenticate';
import { paymentController } from '../controller';
import { subscriptionMiddleware } from '../middleware';

const paymentRouter = Router();

paymentRouter.use(authenticate, subscriptionMiddleware)

paymentRouter.get('/', authenticate, paymentController.listPayments);
paymentRouter.get('/:paymentId', authenticate, paymentController.getPaymentDetails);
paymentRouter.post('/:paymentId/refund', authenticate, paymentController.refundPayment);

export { paymentRouter };