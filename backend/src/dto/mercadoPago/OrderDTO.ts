
export type CreateOrderPayment = {
    orderId: number
    terminal: string
    amount: number
}

export type CreateOrderSubscription = {
    cardToken: string,
    payerEmail: string,
}

export type RestoreOrderSubscription = {
    cardToken: string,
    payerEmail: string,
}