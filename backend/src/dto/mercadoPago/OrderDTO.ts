
export type CreateOrderPayment = {
    orderId: number
    terminal: string
    amount: number
}

export type CreateOrderSubscription = {
    type: "online",
    total_amount: string | number, 
    external_reference: string,
    processing_mode: "automatic",
    transactions: {
        payments: [
            {
                amount: number | string, 
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

export type RestoreOrderSubscription = {
    payments: [
        {
            amount: number | string, 
            payment_method: {
                id: string,
                type: string,
                token: string,
                installments: number,
            },
        },
    ]
    planId?: number
}