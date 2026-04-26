import { Router } from 'express';
import authenticate from '../middleware/authenticate';
import { paymentController } from '../controller';

const paymentRouter = Router();

paymentRouter.get('/', authenticate, paymentController.listPayments);
paymentRouter.get('/:paymentId', authenticate, paymentController.getPaymentDetails);
paymentRouter.post('/:paymentId/refund', authenticate, paymentController.refundPayment);

export { paymentRouter };