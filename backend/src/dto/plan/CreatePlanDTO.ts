
export type CreatePlanParams = {
    reason: string,
    frequency: 'days' | 'months',
    repetitions: number,
    billing_day: number,
    billing_day_proportional: boolean,
    price: number,
}

export type CreatePlanMercadoPago = {
    reason: string,
    frequency: number,
    frequency_type: 'days' | 'months',
    repetitions: number,
    billing_day: number,
    billing_day_proportional: boolean,
    back_url: string,
    transaction_amount: number,
    currency_id: string
}

export type CreatePlan = {
    name: string,
    billingDay: number,
    price: number,
    frequency: string
}