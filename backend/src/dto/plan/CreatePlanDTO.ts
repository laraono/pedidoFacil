
export type CreatePlanParams = {
    name: string,
    frequency: 'days' | 'months' | 'anual',
    repetitions: number,
    billingDay: number,
    billingDayProportional: boolean,
    price: number,
    features?: string,
}

export type CreatePlanMercadoPago = {
    reason: string,
    back_url: string,
    auto_recurring: {
        frequency: number,
        frequency_type: 'days' | 'months',
        repetitions: number,
        billing_day: number,
        billing_day_proportional: boolean,
        transaction_amount: number,
        currency_id: string
    }
    
}

export type CreatePlan = {
    name: string,
    billingDay: number,
    price: number,
    frequency: string,
    features?: string,
}

export type UpdatePlanParams = {
    name: string,
    frequency: 'days' | 'months' | 'anual',
    repetitions: number,
    billingDay: number,
    billingDayProportional: boolean,
    price: number,
    features?: string,
}

export type UpdatePlanMercadoPago = {
    reason: string,
    back_url: string,
    auto_recurring: {
        frequency: number,
        frequency_type: 'days' | 'months',
        repetitions: number,
        billing_day: number,
        billing_day_proportional: boolean,
        transaction_amount: number,
        currency_id: string
    }
    
}

export type UpdatePlan = {
    name: string,
    billingDay: number,
    price: number,
    frequency: string,
    features?: string,
}