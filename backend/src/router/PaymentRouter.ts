import { Router } from 'express';
import { paymentLimiter, PaymentController } from '../controller';
import { PaymentService } from '../service/PaymentService';
import { AppDataSource } from '../database';
import authenticate from '../middleware/authenticate';

const paymentRouter = Router();

const paymentService = new PaymentService(AppDataSource);
const paymentController = new PaymentController(paymentService);

paymentRouter.get('/', authenticate, paymentLimiter, paymentController.listPayments);
paymentRouter.get('/:paymentId', authenticate, paymentLimiter, paymentController.getPaymentDetails);
paymentRouter.post('/:paymentId/refund', authenticate, paymentLimiter, paymentController.refundPayment);

export { paymentRouter };