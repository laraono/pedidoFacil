import { SubscriptionRepository } from '../repository';
import { MercadoPagoService } from './MercadoPagoService';
import { SubscriptionStatus } from '../enum';
import { auditLog } from '../utils/logger';

export class WebhookService {
    constructor(
        private subscriptionRepository: SubscriptionRepository,
        private mercadoPagoService: MercadoPagoService
    ) {}

    async handleEvent(eventId: string, eventType: string) {
        if (eventType === 'payment') {
            let payment: { status: string; preapproval_id: string | null };
            try {
                payment = await this.mercadoPagoService.getPayment(eventId);
            } catch {
                auditLog('webhook.payment_lookup_failed', { eventId });
                return;
            }
            if (!payment.preapproval_id) return;

            const subscription = await this.subscriptionRepository.findOne({
                where: { mercadoPagoId: payment.preapproval_id },
                relations: ['plan']
            });
            if (!subscription) return;

            // Idempotência: MP garante at-least-once delivery
            if (subscription.lastPaymentId === eventId) return;

            if (payment.status === 'approved') {
                await this.subscriptionRepository.updateSubscriptionStatus(subscription.id, SubscriptionStatus.PAGA);
                await this.subscriptionRepository.update(subscription.id, { lastPaymentId: eventId });
                auditLog('subscription.renewal_success', { subscriptionId: subscription.id });
            } else if (payment.status === 'rejected') {
                // MP vai retentar automaticamente — apenas logar
                auditLog('subscription.payment_rejected', { subscriptionId: subscription.id, paymentId: eventId });
            }

        } else if (eventType === 'subscription_preapproval') {
            const mp = await this.mercadoPagoService.getSubscription(eventId);

            const subscription = await this.subscriptionRepository.findOne({
                where: { mercadoPagoId: eventId }
            });
            if (!subscription) return;

            if (mp.status === 'authorized') {
                await this.subscriptionRepository.updateSubscriptionStatus(subscription.id, SubscriptionStatus.PAGA);
                auditLog('subscription.reactivated_by_mp', { subscriptionId: subscription.id });
            } else if (mp.status === 'cancelled') {
                await this.subscriptionRepository.updateSubscriptionStatus(subscription.id, SubscriptionStatus.CANCELADA);
                auditLog('subscription.auto_cancelled_by_mp', { subscriptionId: subscription.id });
            }
        }
    }
}
