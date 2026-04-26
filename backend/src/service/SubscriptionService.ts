import { SubscriptionStatus } from "../enum"
import { EstablishmentRepository, PlanRepository, SubscriptionRepository } from "../repository"
import { AppError } from "../middleware"
import { MercadoPagoService } from "./MercadoPagoService"
import { CreateOrderSubscriptionMP, CreateSubscriptionParams } from "../dto"

export class SubscriptionService {

    constructor(
        private planRepository: PlanRepository,
        private establishmentRepository: EstablishmentRepository,
        private subscriptionRepository: SubscriptionRepository,
        private mercadoPagoService: MercadoPagoService
    ) {}

    async createSubscription(params: CreateSubscriptionParams, cardToken: string) {

        const plan = await this.planRepository.getPlan(params.planId)

        if(!plan) {
            throw new AppError('Plano não encontrado', 404)
        }

        const establishment = await this.establishmentRepository.getEstablishment(params.establishmentId)

        if(!establishment) {
            throw new AppError('Estabelecimento não encontrado', 404)
        }

        const createdSubscription = await this.mercadoPagoService.createSubscription({
            payer_email: params.email,
            card_token_id: cardToken,
            back_url: 'http://localhost:3000/' //TODO
        })

        const expirationDate = createdSubscription.auto_recurring.end_date 

        const intialSubscription = {
            initialDate: new Date(),
            establishment,
            expirationDate,
            lastPayment: new Date(),
            plan
        }

        const subscription = await this.subscriptionRepository.createSubscription(intialSubscription)

        return subscription
    }

    async verifySubscription(establishmentId: number) {
        const [subscription] = await this.subscriptionRepository.getSubscriptionByEstablishment(establishmentId)

        if (subscription.status === SubscriptionStatus.CANCELADA) throw new AppError('Assinatura cancelada', 402)
        if (subscription.status === SubscriptionStatus.EXPIRADA) throw new AppError('Assinatura expirada', 402)

        if (subscription.expirationDate <= new Date()) {
            await this.subscriptionRepository.updateSubscriptionStatus(subscription.id, SubscriptionStatus.EXPIRADA)

            throw new AppError('Assinatura expirada', 402)
        } 

        return await this.mercadoPagoService.getSubscription(subscription.mercadoPagoId)
    }

    async cancelSubscription(subscriptionId: number) {
        const subscription = await this.subscriptionRepository.getSubscription(subscriptionId)

        if(!subscription) {
            throw new AppError('Assinatura não encontrada', 404)
        }

        await this.mercadoPagoService.cancelSubscription(subscription.mercadoPagoId)
        await this.subscriptionRepository.updateSubscriptionStatus(subscriptionId, SubscriptionStatus.CANCELADA)
    }

    async updateSubscription() {

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
        const plan = await this.planRepository.getPlan(planId)

        if(!plan || !plan.mercadoPagoId) {
            throw new AppError('Plano não encontrado', 404)
        }

        mercadoPagoParams.preapproval_plan_id = plan.mercadoPagoId

        const answer = await this.mercadoPagoService.createSubscriptionOrder(mercadoPagoParams)

        const subscription = await this.createSubscription(
            {
                email: mercadoPagoParams.payer.email,
                establishmentId,
                planId
            },
            answer.transactions.payments[0].payment_method.token
        )

        return subscription
    }

    async getEstablishmentSubscription(establishmentId: number) {
        const [subscription] = await this.subscriptionRepository.getSubscriptionByEstablishment(establishmentId)

        return subscription
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