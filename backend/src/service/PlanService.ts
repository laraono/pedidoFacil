import { DataSource } from "typeorm";
import { CreatePlan, CreatePlanMercadoPago, CreatePlanParams, UpdatePlan, UpdatePlanParams } from "../dto";
import { AppError } from "../middleware";
import { PlanRepository } from "../repository";
import { MercadoPagoService } from "./MercadoPagoService";
import { SubscriptionService } from "./SubscriptionService";
import { Plan, Subscription } from "../database";
import { SubscriptionStatus } from "../enum";

export class PlanService {
    
    constructor(
        private planRepository: PlanRepository, 
        private subscriptionService: SubscriptionService,
        private mercadoPagoService: MercadoPagoService,
        private dataSource: DataSource
    ) {}

    async createPlan(params: CreatePlanParams) {
        const existing = await this.planRepository.listPlans();
        if (existing.length >= 2) {
            throw new AppError('Limite de 2 planos atingido. Remova um plano antes de criar outro.', 400);
        }
        const frequencyConflict = existing.find(p => p.frequency === params.frequency);
        if (frequencyConflict) {
            throw new AppError(`Já existe um plano ${params.frequency}. Remova-o antes de criar outro.`, 400);
        }

        return await this.dataSource.transaction(async (transactionalEntityManager) => {
            const localRepositoryParams: CreatePlan = {
                name: params.name,
                frequency: params.frequency,
                price: params.price,
                features: params.features,
            }

            const plan = await transactionalEntityManager.save(Plan, localRepositoryParams)

            const isDiario = params.frequency === 'diario'
            const isAnual = params.frequency === 'anual'
            const billingDay = Number(process.env.MP_BILLING_DAY ?? 10)
            const mpPlan = await this.mercadoPagoService.createPlan({
                reason: params.name,
                back_url: process.env.MP_BACK_URL || process.env.FRONTEND_URL || '',
                auto_recurring: {
                    frequency: isAnual ? 12 : 1,
                    frequency_type: isDiario ? 'days' : 'months',
                    ...(!isAnual && !isDiario && { billing_day: billingDay, billing_day_proportional: true }),
                    transaction_amount: params.price,
                    currency_id: 'BRL'
                },
                payment_methods_allowed: {
                    payment_types: [{ id: 'credit_card' }]
                }
            })
            await transactionalEntityManager.update(Plan, plan.id, { mercadoPagoId: mpPlan.id })

            return { ...plan, mercadoPagoId: mpPlan.id }
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
            await this.subscriptionService.cancelSubscription(subscription.id)
        }

        await this.dataSource.getRepository(Subscription).delete({ plan: { id: planId } })
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
                price: params.price,
                features: params.features,
            }

            await transactionalEntityManager.update(Plan, planId, localRepositoryParams)

            if(plan.mercadoPagoId) {
                const isAnual = params.frequency === 'anual'
                const billingDay = Number(process.env.MP_BILLING_DAY ?? 10)
                await this.mercadoPagoService.updatePlan(plan.mercadoPagoId, {
                    reason: params.name,
                    back_url: process.env.MP_BACK_URL || process.env.FRONTEND_URL || '',
                    auto_recurring: {
                        frequency: isAnual ? 12 : 1,
                        frequency_type: 'months',
                        ...(!isAnual && { billing_day: billingDay, billing_day_proportional: true }),
                        transaction_amount: params.price,
                        currency_id: 'BRL'
                    }
                })

                const activeSubscriptions = await this.subscriptionService.listSubscriptionsByPlan(planId)
                for(const sub of activeSubscriptions) {
                    if(sub.mercadoPagoId && sub.status !== SubscriptionStatus.CANCELADA) {
                        await this.mercadoPagoService.updateSubscriptionValue({
                            subscriptionId: sub.mercadoPagoId,
                            amount: params.price
                        })
                        await this.subscriptionService.updateSubscriptionPrice(sub.id, params.price)
                    }
                }
            }

            return plan
        })
    }
}