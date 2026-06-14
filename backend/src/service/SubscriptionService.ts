import { SubscriptionStatus } from "../enum"
import { PlanRepository, SubscriptionPaymentRepository, SubscriptionRepository } from "../repository"
import { AppError } from "../middleware"
import { MercadoPagoService } from "./MercadoPagoService"
import { CreateOrderSubscriptionMP, RestoreOrderSubscriptionMP } from "../dto"
import { DataSource } from "typeorm"
import { Establishment, Plan, Subscription } from "../database"
import { STATUS_ASSINATURA_IDS } from "../database/entity/lookup-ids"

export class SubscriptionService {

    constructor(
        private planRepository: PlanRepository,
        private subscriptionRepository: SubscriptionRepository,
        private subscriptionPaymentRepository: SubscriptionPaymentRepository,
        private mercadoPagoService: MercadoPagoService,
        private dataSource: DataSource
    ) {}

    async cancelSubscription(subscriptionId: number) {
        const subscription = await this.subscriptionRepository.getSubscription(subscriptionId)
        if(!subscription) throw new AppError('Assinatura não encontrada', 404)
        if(subscription.mercadoPagoId && subscription.status?.nome !== SubscriptionStatus.CANCELADA) {
            await this.mercadoPagoService.cancelSubscription(subscription.mercadoPagoId)
        }
        await this.subscriptionRepository.updateSubscriptionStatus(subscriptionId, SubscriptionStatus.CANCELADA)
    }

    async updateSubscriptionPrice(subscriptionId: number, amount: number) {
        const subscription = await this.subscriptionRepository.getSubscription(subscriptionId)
        if(!subscription) throw new AppError('Assinatura não encontrada', 404)
        await this.mercadoPagoService.updateSubscriptionValue({ subscriptionId: subscription.mercadoPagoId!, amount })
        await this.subscriptionRepository.updateSubscriptionPrice(subscriptionId, amount)
    }

    async listSubscriptions() {
        return await this.subscriptionRepository.listSubscriptions()
    }

    async listSubscriptionsByPlan(planId: number) {
        const plan = await this.planRepository.getPlan(planId)
        if(!plan) throw new AppError('Plano não encontrado', 404)
        return await this.subscriptionRepository.listSubscriptionsByPlan(plan)
    }

    async processCardInfo(
        mercadoPagoParams: CreateOrderSubscriptionMP,
        { planId, establishmentId }: { planId: number, establishmentId: number }
    ) {
        return await this.dataSource.transaction(async (transactionManager) => {
            const plan = await transactionManager.findOne(Plan, { where: { id: planId } })
            if(!plan) throw new AppError('Plano não encontrado', 404)
            if(!plan.mercadoPagoId) throw new AppError('Plano não configurado no Mercado Pago', 500)

            const establishment = await transactionManager.findOne(Establishment, { where: { id: establishmentId } })
            if(!establishment) throw new AppError('Estabelecimento não encontrado', 404)

            const [existingSubscription] = await transactionManager.find(Subscription, { where: { establishment } })
            if(existingSubscription) {
                if(existingSubscription.mercadoPagoId) {
                    try { await this.mercadoPagoService.cancelSubscription(existingSubscription.mercadoPagoId) } catch {}
                }
                await transactionManager.update(Subscription, { id: existingSubscription.id }, {
                    status: { id: STATUS_ASSINATURA_IDS.CANCELADA } as any
                })
            }

            const created = await this.mercadoPagoService.createSubscription({
                preapproval_plan_id: plan.mercadoPagoId,
                payer_email: mercadoPagoParams.payerEmail,
                card_token_id: mercadoPagoParams.cardToken,
                reason: plan.name,
                status: 'authorized'
            })

            const expirationDate = new Date()
            if(plan.frequency === 'anual') {
                expirationDate.setFullYear(expirationDate.getFullYear() + 1)
            } else {
                expirationDate.setMonth(expirationDate.getMonth() + 1)
            }

            return await transactionManager.save(Subscription, {
                initialDate: new Date(),
                establishment,
                expirationDate,
                status: { id: STATUS_ASSINATURA_IDS.PENDENTE },
                price: plan.price,
                plan,
                mercadoPagoId: created.id
            })
        })
    }

    async restoreSubscription(
        mercadoPagoParams: RestoreOrderSubscriptionMP,
        { subscriptionId, establishmentId }: { subscriptionId: number, establishmentId: number }
    ) {
        return await this.dataSource.transaction(async (transactionManager) => {
            const subscription = await transactionManager.findOne(Subscription, {
                where: { id: subscriptionId },
                relations: ['plan']
            })
            if(!subscription || !subscription.mercadoPagoId) throw new AppError('Assinatura não encontrada', 404)
            if(!subscription.plan?.mercadoPagoId) throw new AppError('Plano não configurado no Mercado Pago', 500)

            const establishment = await transactionManager.findOne(Establishment, { where: { id: establishmentId } })
            if(!establishment) throw new AppError('Estabelecimento não encontrado', 404)

            const mpSubscription = await this.mercadoPagoService.getSubscription(subscription.mercadoPagoId)

            if (mpSubscription.status === 'cancelled') {
                const created = await this.mercadoPagoService.createSubscription({
                    preapproval_plan_id: subscription.plan.mercadoPagoId,
                    payer_email: mercadoPagoParams.payerEmail,
                    card_token_id: mercadoPagoParams.cardToken,
                    reason: subscription.plan.name,
                    status: 'authorized'
                })
                await transactionManager.update(Subscription, { id: subscriptionId }, {
                    mercadoPagoId: created.id,
                    status: { id: STATUS_ASSINATURA_IDS.PENDENTE } as any
                })
            } else {
                await this.mercadoPagoService.updateSubscriptionCard(subscription.mercadoPagoId, mercadoPagoParams.cardToken)
                await transactionManager.update(Subscription, { id: subscriptionId }, {
                    status: { id: STATUS_ASSINATURA_IDS.PENDENTE } as any
                })
            }

            return subscription
        })
    }

    async changePlan(establishmentId: number, planId: number) {
        const [subscription] = await this.subscriptionRepository.getSubscriptionByEstablishment(establishmentId)
        if(!subscription) throw new AppError('Assinatura não encontrada', 404)

        const newPlan = await this.planRepository.getPlan(planId)
        if(!newPlan) throw new AppError('Plano não encontrado', 404)

        await this.subscriptionRepository.update(subscription.id, { plan: { id: planId }, price: newPlan.price } as any)

        if(subscription.mercadoPagoId) {
            await this.mercadoPagoService.updateSubscriptionValue({
                subscriptionId: subscription.mercadoPagoId,
                amount: newPlan.price
            })
        }

        const [updated] = await this.subscriptionRepository.getSubscriptionByEstablishment(establishmentId)
        return updated
    }

    async getEstablishmentSubscription(establishmentId: number) {
        const [subscription] = await this.subscriptionRepository.getSubscriptionByEstablishment(establishmentId)
        if(!subscription) return null

        if(subscription.mercadoPagoId) {
            try {
                const mp = await this.mercadoPagoService.getSubscription(subscription.mercadoPagoId)
                if(mp.status === 'authorized' && subscription.status?.nome !== SubscriptionStatus.PAGA) {
                    await this.subscriptionRepository.updateSubscriptionStatus(subscription.id, SubscriptionStatus.PAGA)
                    subscription.status = { id: STATUS_ASSINATURA_IDS.PAGA, nome: SubscriptionStatus.PAGA } as any
                } else if(mp.status === 'cancelled') {
                    await this.subscriptionRepository.updateSubscriptionStatus(subscription.id, SubscriptionStatus.CANCELADA)
                    subscription.status = { id: STATUS_ASSINATURA_IDS.CANCELADA, nome: SubscriptionStatus.CANCELADA } as any
                }
                return { ...subscription, nextPaymentDate: mp.next_payment_date }
            } catch {}
        }

        return subscription
    }

    async getEstablishmentHistory(establishmentId: number) {
        const subscriptions = await this.subscriptionRepository.getSubscriptionByEstablishment(establishmentId)
        const history: Array<any> = []

        for (const sub of subscriptions) {
            const payments = await this.subscriptionPaymentRepository.getBySubscription(sub.id)
            for (const p of payments) {
                history.push({
                    amount: p.amount,
                    status: p.status?.nome,
                    type: p.paymentType,
                    name: p.planName,
                    date: p.paidAt,
                    mercadoPagoId: sub.mercadoPagoId ?? null,
                })
            }
        }

        return history
    }

    async getAdminMetrics(startDate: string, endDate: string) {
        const start = new Date(startDate)
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        return await this.subscriptionPaymentRepository.getMetricsForPeriod(start, end)
    }

    async getSubscription(subscriptionId: number) {
        return await this.subscriptionRepository.getSubscription(subscriptionId)
    }
}
