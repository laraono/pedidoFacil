import { Establishment, Plan } from "../../database"

export type CreateSubscription = {
    initialDate: Date
    establishment: Establishment
    expirationDate: Date
    lastPayment: Date
    plan: Plan
}