import { SubscriptionRepository } from '../repository';
import { MercadoPagoService } from './MercadoPagoService';
import { SubscriptionStatus } from '../enum';

export class WebhookService {
    constructor(
        private subscriptionRepository: SubscriptionRepository,
        private mercadoPagoService: MercadoPagoService
    ) {}

    async handleSubscriptionRenewal(mercadoPagoId: string) {
        const subscription = await this.subscriptionRepository.findOne({
            where: { mercadoPagoId }
        });

        if (!subscription) return;

        const today = new Date().toDateString();
        if (subscription.lastPayment && new Date(subscription.lastPayment).toDateString() === today) return;

        const order = await this.mercadoPagoService.getOrder(mercadoPagoId);
        const statusDetail = order.transactions?.payments?.[0]?.status_detail;

        if (statusDetail === 'accredited') {
            await this.subscriptionRepository.updateSubscriptionStatus(subscription.id, SubscriptionStatus.PAGA);

            if (subscription.scheduledPlan) {
                await this.subscriptionRepository.update(subscription.id, {
                    plan: subscription.scheduledPlan,
                    scheduledPlan: null as any
                });
            }
        } else if (statusDetail === 'canceled') {
            await this.subscriptionRepository.updateSubscriptionStatus(subscription.id, SubscriptionStatus.CANCELADA);
        }
    }
}