
export type CreatePlanParams = {
    name: string,
    frequency: 'mensal' | 'anual',
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
        frequency_type: 'months',
        repetitions?: number,
        billing_day?: number,
        billing_day_proportional?: boolean,
        transaction_amount: number,
        currency_id: string
    },
    payment_methods_allowed?: {
        payment_types?: { id: string }[]
    }
}

export type CreatePlan = {
    name: string,
    price: number,
    frequency: string,
    features?: { description: string }[],
}

export type UpdatePlanParams = {
    name: string,
    frequency: 'mensal' | 'anual',
    repetitions: number,
    billingDay: number,
    billingDayProportional: boolean,
    price: number,
    features?: string | null,
}

export type UpdatePlanMercadoPago = {
    reason: string,
    back_url: string,
    auto_recurring: {
        frequency: number,
        frequency_type: 'months',
        repetitions?: number,
        billing_day?: number,
        billing_day_proportional?: boolean,
        transaction_amount: number,
        currency_id: string
    }

}

export type UpdatePlan = {
    name: string,
    price: number,
    frequency: string,
}
