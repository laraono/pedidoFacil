import { DataSource } from "typeorm";
import { CreatePlan, CreatePlanMercadoPago, CreatePlanParams } from "../dto";
import { AppError } from "../middleware";
import { PlanRepository } from "../repository";
import { MercadoPagoService } from "./MercadoPagoService";
import { SubscriptionService } from "./SubscriptionService";
import { Plan } from "../database";

export class PlanService {
    
    constructor(
        private planRepository: PlanRepository, 
        private subscriptionService: SubscriptionService,
        private mercadoPagoService: MercadoPagoService,
        private dataSource: DataSource
    ) {}

    async createPlan(params: CreatePlanParams) {
        return await this.dataSource.transaction(async (transactionalEntityManager) => {
            const localRepositoryParams: CreatePlan = {
                name: params.reason,
                frequency: params.frequency,
                billingDay: params.billing_day,
                price: params.price
            }

            const plan = await transactionalEntityManager.save(Plan, localRepositoryParams)

            if(params.frequency === 'anual') {
                params.frequency = 'months'
                params.repetitions = 12
            }

            const mercadoPagoParams: CreatePlanMercadoPago = {
                ...params,
                back_url: 'https://docs.google.com/document/d/10MVs5bBpUX5oQAb1YSolBP5eFK67gVC3wU-iOzTH0y4/edit?tab=t.kdyeobkwb0n4', //TODO
                auto_recurring: {
                    currency_id: 'BRL',
                    transaction_amount: plan.price / params.repetitions,
                    frequency: 1,
                    frequency_type: params.frequency,
                    billing_day:  params.billing_day,
                    billing_day_proportional: params.billing_day_proportional,
                    repetitions: params.repetitions
                }
                
            }

            const answer = await this.mercadoPagoService.createPlan(mercadoPagoParams)

            await transactionalEntityManager.update(Plan, plan.id, {mercadoPagoId: answer.id})

            return plan
        })
    }

    async listPlans() {
        return await this.planRepository.listPlans()
    }

    async getPlan(planId: number) {
        return await this.planRepository.getPlan(planId)
    }

    async deletePlan(planId: number) {
        const subscriptions = await this.subscriptionService.listSubscriptionsByPlan(planId)

        for(const subscription of subscriptions) {
            await this.subscriptionService.deleteSubscription(subscription.id)
        }

        await this.planRepository.deletePlan(planId)
    }
}