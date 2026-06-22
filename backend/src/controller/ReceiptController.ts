import { Request, Response } from 'express';
import { ReceiptService } from '../service/ReceiptService';
import { catchAsync } from '../middleware/error/catchAsync';
import rateLimit from 'express-rate-limit'

export const receiptLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    handler: (req: Request, res: Response) => {
        res.status(429).json({
            error: 'Muitas tentativas. Tente novamente mais tarde.',
            retryAfter: Math.ceil(((req as any).rateLimit.resetTime - Date.now()) / 1000)
        })
    }
})

export class ReceiptController {
    constructor(private receiptService: ReceiptService) {}

    create = catchAsync(async (req: Request, res: Response) => {
        const establishmentId = (req as any).usuario.estabelecimento;
        const { paymentId, cpfcnpj } = req.body;
        const receipt = await this.receiptService.generateReceipt(paymentId, establishmentId, cpfcnpj);
        return res.status(201).json(receipt);
    });

    list = catchAsync(async (req: Request, res: Response) => {
        const establishmentId = (req as any).usuario.estabelecimento;
        const { status, startDate, endDate } = req.query;
        const receipts = await this.receiptService.listReceipts(establishmentId, { status, startDate, endDate });
        return res.json(receipts);
    });

    delete = catchAsync(async (req: Request, res: Response) => {
        const establishmentId = (req as any).usuario.estabelecimento;
        const { id } = req.params;
        await this.receiptService.cancelReceipt(Number(id), establishmentId);
        return res.status(204).send();
    });
}