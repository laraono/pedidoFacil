import { Request, Response } from 'express';
import { WebhookService } from '../service/WebhookService';
import { catchAsync } from '../middleware/error/catchAsync';

export class WebhookController {
    constructor(private webhookService: WebhookService) {}

    handlePayment = catchAsync(async (req: Request, res: Response) => {
        const mercadoPagoId = req.body?.data?.id;
        if (mercadoPagoId) {
            await this.webhookService.handleSubscriptionRenewal(mercadoPagoId);
        }
        return res.sendStatus(200);
    });
}