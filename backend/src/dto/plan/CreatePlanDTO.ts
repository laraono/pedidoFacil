
export type CreatePlanParams = {
    reason: string,
    frequency: 'days' | 'months' | 'anual',
    repetitions: number,
    billing_day: number,
    billing_day_proportional: boolean,
    price: number,
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
    frequency: string
}