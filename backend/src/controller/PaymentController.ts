import { Request, Response } from 'express';
import { PaymentService } from '../service/PaymentService';
import { catchAsync } from '../middleware/error/catchAsync';
import rateLimit from 'express-rate-limit'
import { auditLog } from '../utils/logger';

export const paymentLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 300,
    handler: (req: Request, res: Response) => {
        res.status(429).json({
            error: 'Muitas tentativas. Tente novamente mais tarde.',
            retryAfter: Math.ceil(((req as any).rateLimit.resetTime - Date.now()) / 1000)
        })
    }
})

export class PaymentController {
    private paymentService: PaymentService;

    constructor(paymentService: PaymentService) {
        this.paymentService = paymentService;
    }

    listPayments = catchAsync(async (req: Request, res: Response) => {
        const establishmentId = (req as any).usuario.estabelecimento;
        
        const filters = req.query; 

        const payments = await this.paymentService.listPayments(establishmentId, filters);
        return res.status(200).json(payments);
    });

    getPaymentDetails = catchAsync(async (req: Request, res: Response) => {
        const establishmentId = (req as any).usuario.estabelecimento;
        const { paymentId } = req.params;
        try {
            const payment = await this.paymentService.getPaymentById(Number(paymentId), establishmentId);
            return res.status(200).json(payment);
        } catch (error) {
            return res.status(404).json({ error: 'Pagamento não encontrado.' });
        }
    });

    refundPayment = catchAsync(async (req: Request, res: Response) => {
        const establishmentId = (req as any).usuario.estabelecimento;
        const { paymentId } = req.params;
        try {
            const payment = await this.paymentService.getPaymentById(Number(paymentId), establishmentId);
            
            auditLog('refund_payment.success', {
                paymentId,
                establishmentId,
                ip: req.ip,
                timestamp: new Date().toISOString(),
            });

            return res.status(200).json(payment);
        } catch (error) {
            auditLog('refund_payment.failure', {
                paymentId,
                establishmentId,
                ip: req.ip,
                timestamp: new Date().toISOString(),
            });
            return res.status(404).json({ error: 'Pagamento não encontrado.' });
        }
    });

}