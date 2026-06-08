import { Request, Response } from 'express';
import { WebhookService } from '../service/WebhookService';
import { catchAsync } from '../middleware/error/catchAsync';

export class WebhookController {
    constructor(private webhookService: WebhookService) {}

    handlePayment = catchAsync(async (req: Request, res: Response) => {
        const eventId = req.body?.data?.id;
        const eventType: string = req.body?.type ?? 'payment';
        if (eventId) {
            await this.webhookService.handleEvent(eventId, eventType);
        }
        return res.sendStatus(200);
    });
}