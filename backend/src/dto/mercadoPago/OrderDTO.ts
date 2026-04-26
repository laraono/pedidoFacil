
export type CreateOrderPayment = {
    orderId: number
    terminal: string
    amount: number
}

export type CreateOrderSubscription = {
    preapproval_plan_id?: string,
    type: "online",
    total_amount: string, 
    external_reference: string,
    processing_mode: "automatic",
    transactions: {
        payments: [
            {
                amount: number, 
                payment_method: {
                    id: string,
                    type: string,
                    token: string,
                    installments: number,
                },
            },
        ],
    },
    payer: {
        email: string,
        identification: string,
    },
}