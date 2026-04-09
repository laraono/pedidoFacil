import { Router } from 'express';
import { PaymentController } from '../controller';
import { PaymentService } from '../service/PaymentService';
import { AppDataSource } from '../database';
import authenticate from '../middleware/authenticate';

const paymentRouter = Router();

const paymentService = new PaymentService(AppDataSource);
const paymentController = new PaymentController(paymentService);

paymentRouter.get('/', authenticate, paymentController.listPayments);
paymentRouter.get('/:paymentId', authenticate, paymentController.getPaymentDetails);
paymentRouter.post('/:paymentId/refund', authenticate, paymentController.refundPayment);

export { paymentRouter };