import { rootCertificates } from "node:tls"
import { SubscriptionStatus } from "../enum"
import { EstablishmentRepository, PlanRepository, SubscriptionRepository } from "../repository"
import { AppError } from "../middleware"
import { MercadoPagoService } from "./MercadoPagoService"

export class SubscriptionService {

    constructor(
        private planRepository: PlanRepository,
        private establishmentRepository: EstablishmentRepository,
        private subscriptionRepository: SubscriptionRepository,
        private mercadoPagoService: MercadoPagoService
    ) {}

    async createSubscription(email: string, planId: number, establishmentId: number, cardToken: string) {

        const plan = await this.planRepository.getPlan(planId)

        if(!plan) {
            throw new AppError('Plano não encontrado', 404)
        }

        const establishment = await this.establishmentRepository.getEstablishment(establishmentId)

        if(!establishment) {
            throw new AppError('Estabelecimento não encontrado', 404)
        }

        const createdSubscription = await this.mercadoPagoService.createSubscription({
            payer_email: email,
            card_token_id: cardToken,
            back_url: ''
        })

        const expirationDate = createdSubscription.next_payment_date - put the expiration date for real

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

    async paySubscription(planId: number, establishmentId: number, subscriptionId: number) {

        const subscription = await this.subscriptionRepository.getSubscription(subscriptionId) 

        if(!subscription) {
            throw new AppError('Estabelecimento não encontrado', 404)
        }

        const plan = await this.planRepository.getPlan(planId)

        if(!plan) {
            throw new AppError('Plano não encontrado', 404)
        }

        const establishment = await this.establishmentRepository.getEstablishment(establishmentId)

        if(!establishment) {
            throw new AppError('Estabelecimento não encontrado', 404)
        }

        await this.subscriptionRepository.updateSubscriptionStatus(subscriptionId, SubscriptionStatus.PAGA)

        const expirationDate = createdSubscription.next_payment_date

        const intialSubscription = {
            initialDate: new Date(),
            establishment,
            expirationDate,
            lastPayment: new Date(),
            plan
        }

            "semaphore": "green"


        cria o plano e ai vincula uma subscription e o primeiro está pago 
        cria o proximo plano
        se status pagamento pendente e data de pagamento maior que hoje bloquear rotas 
    }
}