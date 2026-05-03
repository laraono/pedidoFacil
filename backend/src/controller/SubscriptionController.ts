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
        console.log(subscription)
        return res.status(200).send(subscription);
    });

    getEstablishmentHistory = catchAsync(async (req, res: Response) => {
        const subscription = await this.subscriptionService.getEstablishmentHistory(req.usuario.estabelecimento);
        console.log(subscription)
        return res.status(200).send(subscription);
    });

    getSubscription = catchAsync(async (req, res: Response) => {
        const subscription = await this.subscriptionService.getSubscription(req.params.subscriptionId);
        return res.status(200).send(subscription);
    });

    cancelSubcription = catchAsync(async (req, res: Response) => {
        await this.subscriptionService.cancelSubscription(req.params.subscriptionId);
        return res.sendStatus(204)
    });

    deleteSubcription = catchAsync(async (req, res: Response) => {
        await this.subscriptionService.deleteSubscription(req.params.subscriptionId);
        return res.sendStatus(204)
    });

    processCardInfo  = catchAsync(async (req, res: Response) => {
        await this.subscriptionService.processCardInfo(req.body, req.params);
        return res.sendStatus(204);
    });

    restoreSubscription  = catchAsync(async (req, res: Response) => {
        await this.subscriptionService.restoreSubscription(req.body, req.params);
        return res.sendStatus(204);
    });

    updateSubscriptionPrice =  catchAsync(async (req, res: Response) => {
        const result = await this.subscriptionService.updateSubscriptionPrice(req.params.subscriptionId, req.body.amount);
        return res.sendStatus(204);
    });

}