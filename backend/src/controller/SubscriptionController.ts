import { Request, Response } from 'express';
import { SubscriptionService } from '../service/SubscriptionService';
import { catchAsync } from '../middleware/error/catchAsync';
import { MercadoPagoService } from '../service';
import { auditLog } from '../utils/logger';

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
        return res.status(200).send(subscription);
    });

    getEstablishmentHistory = catchAsync(async (req, res: Response) => {
        const subscription = await this.subscriptionService.getEstablishmentHistory(req.usuario.estabelecimento);
        return res.status(200).send(subscription);
    });

    getSubscription = catchAsync(async (req, res: Response) => {
        const subscription = await this.subscriptionService.getSubscription(req.params.subscriptionId);
        return res.status(200).send(subscription);
    });

    cancelSubcription = catchAsync(async (req, res: Response) => {
        const { subscriptionId } = req.params;
        await this.subscriptionService.cancelSubscription(subscriptionId);
        auditLog('subscription.cancelled', { subscriptionId, userId: (req as any).usuario?.id });
        return res.sendStatus(204)
    });

    processCardInfo  = catchAsync(async (req, res: Response) => {
        await this.subscriptionService.processCardInfo(req.body, req.params);
        return res.sendStatus(204);
    });

    restoreSubscription  = catchAsync(async (req, res: Response) => {
        await this.subscriptionService.restoreSubscription(req.body, req.params);
        auditLog('subscription.restored', { subscriptionId: req.params.subscriptionId, userId: (req as any).usuario?.id });
        return res.sendStatus(204);
    });

    updateSubscriptionPrice =  catchAsync(async (req, res: Response) => {
        const { subscriptionId } = req.params;
        await this.subscriptionService.updateSubscriptionPrice(subscriptionId, req.body.amount);
        auditLog('subscription.price_updated', { subscriptionId, amount: req.body.amount, userId: (req as any).usuario?.id });
        return res.sendStatus(204);
    });

    schedulePlan = catchAsync(async (req, res: Response) => {
        const establishmentId = req.usuario.estabelecimento;
        const { planId } = req.body;
        const updated = await this.subscriptionService.schedulePlan(establishmentId, planId ?? null);
        return res.status(200).json(updated);
    });

}