import { Request, Response, NextFunction } from 'express';
import { ReceiptService } from '../service/ReceiptService';

const receiptService = new ReceiptService();

export class ReceiptController {
    
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const establishmentId = (req as any).usuario.estabelecimento;
            const { paymentId, cpfcnpj } = req.body;

            if (!paymentId) {
                return res.status(400).json({ error: 'O ID do pagamento é obrigatório.' });
            }

            const receipt = await receiptService.generateReceipt(paymentId, establishmentId, cpfcnpj);
            
            return res.status(201).json(receipt);
        } catch (error) {
            next(error);
        }
    }

    async getDetails(req: Request, res: Response, next: NextFunction) {
        try {
            const establishmentId = (req as any).usuario.estabelecimento;
            const receiptId = Number(req.params.id);

            const receiptDetails = await receiptService.getReceiptDetails(receiptId, establishmentId);
            
            return res.status(200).json(receiptDetails);
        } catch (error) {
            next(error);
        }
    }

    async list(req: Request, res: Response, next: NextFunction) {
        try {
            const establishmentId = (req as any).usuario.estabelecimento;

            const receipts = await receiptService.listEstablishmentReceipts(establishmentId);
            
            return res.status(200).json(receipts);
        } catch (error) {
            next(error);
        }
    }
}