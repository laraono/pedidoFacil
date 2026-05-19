import { DataSource } from "typeorm";
import { CreatePlan, CreatePlanMercadoPago, CreatePlanParams, UpdatePlan, UpdatePlanParams } from "../dto";
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
                name: params.name,
                frequency: params.frequency,
                billingDay: params.billingDay,
                price: params.price,
                features: params.features,
            }

            const plan = await transactionalEntityManager.save(Plan, localRepositoryParams)

            return plan
        })
    }

    async listPlans() {
        const plans = await this.planRepository.listPlans()
        return plans
    }

    async getPlan(planId: number) {
        const plan = await this.planRepository.getPlan(planId)
        return plan
    }

    async deletePlan(planId: number) {
        const subscriptions = await this.subscriptionService.listSubscriptionsByPlan(planId)

        for(const subscription of subscriptions) {
            await this.subscriptionService.deleteSubscription(subscription.id)
        }

        await this.planRepository.deletePlan(planId)
    }

    async updatePlan(planId: number, params: UpdatePlanParams) {
        return await this.dataSource.transaction(async (transactionalEntityManager) => {

            const plan = await transactionalEntityManager.findOne(Plan, {
                where: {
                    id: planId
                }
            })

            if(!plan) {
                throw new AppError('Plano não encontrado', 404)
            }

            const localRepositoryParams: UpdatePlan = {
                name: params.name,
                frequency: params.frequency,
                billingDay: params.billingDay,
                price: params.price,
                features: params.features,
            }

            await transactionalEntityManager.update(Plan, planId, localRepositoryParams)

            if(params.frequency === 'anual') {
                params.frequency = 'months'
                params.repetitions = 12
            }

            return plan
        })
    }
}