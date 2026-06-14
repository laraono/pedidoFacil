import { SubscriptionPaymentRepository, SubscriptionRepository } from '../repository';
import { MercadoPagoService } from './MercadoPagoService';
import { SubscriptionStatus } from '../enum';
import { auditLog } from '../utils/logger';
import { STATUS_HISTORICO_IDS } from '../database/entity/lookup-ids';

function resolvePaymentType(id: string): string {
    if (id === 'credit_card') return 'Cartão de Crédito'
    if (id === 'debit_card') return 'Cartão de Débito'
    if (id === 'bank_transfer') return 'Pix'
    return 'Cartão'
}

export class WebhookService {
    constructor(
        private subscriptionRepository: SubscriptionRepository,
        private subscriptionPaymentRepository: SubscriptionPaymentRepository,
        private mercadoPagoService: MercadoPagoService
    ) {}

    async handleEvent(eventId: string, eventType: string) {
        if (eventType === 'payment') {
            let payment: Awaited<ReturnType<MercadoPagoService['getPayment']>>;
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

            const alreadyProcessed = await this.subscriptionPaymentRepository.findOne({
                where: { mercadoPagoPaymentId: eventId }
            });
            if (alreadyProcessed) return;

            if (payment.status === 'rejected') {
                await this.subscriptionPaymentRepository.createPayment({
                    mercadoPagoPaymentId: eventId,
                    amount: payment.transaction_amount,
                    status: { id: STATUS_HISTORICO_IDS.REJEITADO } as any,
                    paymentType: resolvePaymentType(payment.payment_type_id),
                    planName: subscription.plan.name,
                    subscription: { id: subscription.id } as any,
                });
                auditLog('subscription.payment_rejected', { subscriptionId: subscription.id, paymentId: eventId });
            }

        } else if (eventType === 'subscription_preapproval') {
            let mp: Awaited<ReturnType<MercadoPagoService['getSubscription']>>;
            try {
                mp = await this.mercadoPagoService.getSubscription(eventId);
            } catch {
                auditLog('webhook.subscription_lookup_failed', { eventId });
                return;
            }

            const subscription = await this.subscriptionRepository.findOne({
                where: { mercadoPagoId: eventId },
                relations: ['plan']
            });
            if (!subscription) return;

            if (mp.status === 'authorized') {
                await this.subscriptionRepository.updateSubscriptionStatus(subscription.id, SubscriptionStatus.PAGA);
                auditLog('subscription.reactivated_by_mp', { subscriptionId: subscription.id });

                const { charged_quantity, last_charged_amount, last_charged_date } = mp.summarized;
                if (subscription.plan && charged_quantity !== null && last_charged_amount !== null) {
                    await this.subscriptionPaymentRepository.recordPreapprovalPayment({
                        mercadoPagoId: eventId,
                        charged_quantity,
                        last_charged_amount,
                        last_charged_date,
                        planName: subscription.plan.name,
                        subscriptionId: subscription.id,
                    });
                    auditLog('subscription.payment_recorded', { subscriptionId: subscription.id, chargedQuantity: charged_quantity });
                }
            } else if (mp.status === 'cancelled') {
                await this.subscriptionRepository.updateSubscriptionStatus(subscription.id, SubscriptionStatus.CANCELADA);
                auditLog('subscription.auto_cancelled_by_mp', { subscriptionId: subscription.id });
            }
        }
    }
}