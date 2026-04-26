import { Request, Response } from 'express';
import { SubscriptionService } from '../service/SubscriptionService';
import { catchAsync } from '../middleware/error/catchAsync';
import { MercadoPagoService } from '../service';

export class SubscriptionController {
    private subscriptionService: SubscriptionService;

    constructor(subscriptionService: SubscriptionService) {
        this.subscriptionService = subscriptionService
    }

    listSubscriptions = catchAsync(async (req: Request, res: Response) => {
        const subscriptions = await this.subscriptionService.listSubscriptions();
        return res.status(200).send(subscriptions);
    });

    listSubscriptionsByPlan = catchAsync(async (req, res: Response) => {
        const subscriptions = await this.subscriptionService.listSubscriptionsByPlan(req.params.planId);
        return res.status(200).send(subscriptions);
    });

    getEstablishmentSubscription = catchAsync(async (req, res: Response) => {
        const subscription = await this.subscriptionService.getEstablishmentSubscription(req.usuario.estabelecimento);
        return res.status(200).json(subscription);
    });

    getSubscription = catchAsync(async (req, res: Response) => {
        const subscription = await this.subscriptionService.getSubscription(req.params.subscriptionId);
        return res.status(200).json(subscription);
    });

    cancelSubcription = catchAsync(async (req, res: Response) => {
        await this.subscriptionService.cancelSubscription(req.params.subscriptionId);
        return res.sendStatus(204)
    });

    deleteSubcription = catchAsync(async (req, res: Response) => {
        await this.subscriptionService.deleteSubscription(req.params.subscriptionId);
        return res.sendStatus(204)
    });

    processCardInfo  = catchAsync(async (req: Request, res: Response) => {
        const {data, params} = req.body
        const result = await this.subscriptionService.processCardInfo(data, params);
        return res.status(200).json(result);
    });

}