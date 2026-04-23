import { Request, Response } from 'express';
import { PaymentService } from '../service/PaymentService';
import { catchAsync } from '../middleware/error/catchAsync';

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

        const payment = await this.paymentService.getPaymentById(Number(paymentId), establishmentId);
        return res.status(200).json(payment);
    });

    refundPayment = catchAsync(async (req: Request, res: Response) => {
        const establishmentId = (req as any).usuario.estabelecimento;
        const { paymentId } = req.params;
        const { reason } = req.body;

        const result = await this.paymentService.refundPayment(Number(paymentId), establishmentId, reason);
        return res.status(200).json(result);
    });
}