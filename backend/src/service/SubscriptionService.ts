import { SubscriptionStatus } from "../enum"
import { EstablishmentRepository, PlanRepository, SubscriptionRepository } from "../repository"
import { AppError } from "../middleware"
import { MercadoPagoService } from "./MercadoPagoService"
import { CreateOrderSubscriptionMP, CreateSubscriptionParams, RestoreOrderSubscriptionMP } from "../dto"
import { DataSource, EntityManager } from "typeorm"
import { Establishment, Plan, Subscription, User } from "../database"

export class SubscriptionService {

    constructor(
        private planRepository: PlanRepository,
        private subscriptionRepository: SubscriptionRepository,
        private mercadoPagoService: MercadoPagoService,
        private dataSource: DataSource
    ) {}

    async cancelSubscription(subscriptionId: number) {
        const subscription = await this.subscriptionRepository.getSubscription(subscriptionId)

        if(!subscription) {
            throw new AppError('Assinatura não encontrada', 404)
        }

        await this.mercadoPagoService.cancelSubscription(subscription.mercadoPagoId)
        await this.subscriptionRepository.updateSubscriptionStatus(subscriptionId, SubscriptionStatus.CANCELADA)
    }

    async updateSubscriptionPrice(subscriptionId: number, amount: number) {
        const subscription = await this.subscriptionRepository.getSubscription(subscriptionId)

        if(!subscription) {
            throw new AppError('Assinatura não encontrada', 404)
        }

        await this.mercadoPagoService.updateSubscriptionValue({subscriptionId: subscription.mercadoPagoId, amount})
        await this.subscriptionRepository.updateSubscriptionPrice(subscriptionId, amount)
    }

    async listSubscriptions() {
        return await this.subscriptionRepository.listSubscriptions()
    }

    async listSubscriptionsByPlan(planId: number) {
        const plan = await this.planRepository.getPlan(planId)

        if(!plan) {
            throw new AppError('Plano não encontrado', 404)
        }

        return await this.subscriptionRepository.listSubscriptionsByPlan(plan)
    }

    async processCardInfo(
        mercadoPagoParams: CreateOrderSubscriptionMP,
        {planId, establishmentId}: {planId: number, establishmentId: number}
    ) {
        return await this.dataSource.transaction(async (transactionManager) => {
            const plan = await transactionManager.findOne(Plan, {
                where: {
                    id: planId
                }
            })

            if(!plan) {
                throw new AppError('Plano não encontrado', 404)
            }

            const establishment = await transactionManager.findOne(Establishment, {
                where: {
                    id: establishmentId
                }
            })

            if(!establishment) {
                throw new AppError('Estabelecimento não encontrado', 404)
            }

            const [existingSubscription] = await transactionManager.find(Subscription, {
                where: {
                    establishment
                }
            })

            if(existingSubscription) {
                await transactionManager.update(Subscription, {id: existingSubscription.id}, {status: SubscriptionStatus.CANCELADA})
            }

            mercadoPagoParams.total_amount = mercadoPagoParams.total_amount.toString()
            mercadoPagoParams.transactions.payments[0].amount = mercadoPagoParams.transactions.payments[0].amount.toString()

            const createdSubscription = await this.mercadoPagoService.createSubscriptionOrder(mercadoPagoParams)

            const expirationDate = new Date();
            if (plan.frequency === 'anual') {
                expirationDate.setFullYear(expirationDate.getFullYear() + 1);
            } else {
                expirationDate.setMonth(expirationDate.getMonth() + 1);
            }

            const intialSubscription = {
                initialDate: new Date(),
                establishment,
                expirationDate,
                lastPayment: new Date(),
                price: plan.price,
                plan,
                mercadoPagoId: createdSubscription.id
            }

            const subscription = await transactionManager.save(Subscription, intialSubscription)

            return subscription

        })
    }

    async restoreSubscription(
        mercadoPagoParams: RestoreOrderSubscriptionMP,
        {subscriptionId, establishmentId}: {subscriptionId: number, establishmentId: number}
    ) {
        return await this.dataSource.transaction(async (transactionManager) => {
            const subscription = await transactionManager.findOne(Subscription, {
                where: {
                    id: subscriptionId
                }
            })

            if(!subscription || !subscription.mercadoPagoId) {
                throw new AppError('Assinatura não encontrada', 404)
            }

            const establishment = await transactionManager.findOne(Establishment, {
                where: {
                    id: establishmentId
                }
            })

            if(!establishment) {
                throw new AppError('Estabelecimento não encontrado', 404)
            }

            const order = await this.mercadoPagoService.getOrder(subscription.mercadoPagoId)

            const transactionId = order.transactions.payments[0].id

            await this.mercadoPagoService.updateOrder(subscription.mercadoPagoId, transactionId, mercadoPagoParams.payments[0].payment_method)

            await transactionManager.update(
                Subscription, 
                {id: subscriptionId}, 
                {
                    status: SubscriptionStatus.PENDENTE, 
                }
            )

            return subscription
        })
    }

    async getEstablishmentSubscription(establishmentId: number) {
        const [subscription] = await this.subscriptionRepository.getSubscriptionByEstablishment(establishmentId)

        if (!subscription) return null

        if (subscription.mercadoPagoId && subscription.status !== SubscriptionStatus.PAGA) {
            try {
                const order = await this.mercadoPagoService.getOrder(subscription.mercadoPagoId)
                if (order.status_detail === 'accredited') {
                    await this.subscriptionRepository.updateSubscriptionStatus(subscription.id, SubscriptionStatus.PAGA)
                    subscription.status = SubscriptionStatus.PAGA
                }
            } catch {}
        }

        return subscription
    }

    async getEstablishmentHistory(establishmentId: number) {
        const subscriptions = await this.subscriptionRepository.getSubscriptionByEstablishment(establishmentId)

        const statusLabels: Record<string, string> = {
            'accredited': 'Aprovado',
            'in_process': 'Em processamento',
            'canceled': 'Cancelado',
            'cancelled': 'Cancelado',
            'pending_capture': 'Aguardando captura',
            'authorized': 'Autorizado',
            'rejected': 'Recusado',
            'refunded': 'Estornado',
            'charged_back': 'Contestado',
            'pending': 'Pendente',
        }

        const history: Array<any> = []

        for(const sub of subscriptions) {
            if (!sub.mercadoPagoId) continue

            try {
                const order = await this.mercadoPagoService.getOrder(sub.mercadoPagoId)
                const payment = order.transactions.payments[0]
                const statusKey = payment.status_detail?.toLowerCase() ?? ''
                const data = {
                    amount: payment.paid_amount,
                    status: statusLabels[statusKey] ?? payment.status_detail,
                    type: payment.payment_method?.type === 'credit_card' ? 'Cartão de Crédito'
                        : payment.payment_method?.type === 'debit_card' ? 'Cartão de Débito'
                        : payment.payment_method?.type === 'bank_transfer' ? 'Pix'
                        : 'Cartão',
                    installments: payment.payment_method?.installments,
                    name: sub.plan ? sub.plan.name : '',
                    date: order.last_updated_date
                }
                history.push(data)
            } catch {}
        }

        return history
    }

    async getSubscription(subscriptionId: number) {
        const subscription = await this.subscriptionRepository.getSubscription(subscriptionId)

        return subscription
    }

    async deleteSubscription(subscriptionId: number) {
        const subscription = await this.subscriptionRepository.getSubscription(subscriptionId)

        if(!subscription) {
            throw new AppError('Assinatura não encontrada', 404)
        }

        await this.mercadoPagoService.cancelSubscription(subscription.mercadoPagoId)
        await this.subscriptionRepository.deleteSubscription(subscriptionId)

    }

}