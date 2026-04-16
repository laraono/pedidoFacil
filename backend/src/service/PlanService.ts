import { CreatePlan, CreatePlanMercadoPago, CreatePlanParams } from "../dto";
import { PlanRepository } from "../repository";
import { MercadoPagoService } from "./MercadoPagoService";

export class PlanService {
    
    constructor(
        private planRepository: PlanRepository, 
        private mercadoPagoService: MercadoPagoService
    ) {}

    async createPlan(params: CreatePlanParams) {
        const localRepositoryParams: CreatePlan = {
            name: params.reason,
            frequency: params.frequency,
            billingDay: params.billing_day,
            price: params.price
        }

        const plan = await this.planRepository.createPlan(localRepositoryParams)

        const mercadoPagoParams: CreatePlanMercadoPago = {
            ...params,
            back_url: '',
            currency_id: 'BRL',
            transaction_amount: plan.price / params.repetitions,
            frequency: 1,
            frequency_type: params.frequency
        }

        const answer = await this.mercadoPagoService.createPlan(mercadoPagoParams)

        await this.planRepository.addMercadoPagoPlanId(plan.id, answer.id)

        return plan
    }
}