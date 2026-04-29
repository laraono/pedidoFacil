import { Request, Response } from 'express';
import { ReceiptService } from '../service/ReceiptService';
import { catchAsync } from '../middleware/error/catchAsync';

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

    cancel = catchAsync(async (req: Request, res: Response) => {
        const establishmentId = (req as any).usuario.estabelecimento;
        const { id } = req.params;
        await this.receiptService.cancelReceipt(Number(id), establishmentId);
        return res.status(204).send();
    });

    reissue = catchAsync(async (req: Request, res: Response) => {
        const establishmentId = (req as any).usuario.estabelecimento;
        const { id } = req.params;
        const receipt = await this.receiptService.reissueReceipt(Number(id), establishmentId);
        return res.json(receipt);
    });
}