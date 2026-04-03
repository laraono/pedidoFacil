import { Establishment } from "../../database"
import { User } from "../../database/entity/User"
import { OrderStatus } from "../../enum"

export type CancelOrder = {
    comandaId: number,
    userId: number,
    establishmentId: number,
    cancellationDescription?: string
}

export type CancelOrderParams = {
    user: User,
    cancellationDescription?: string,
    status: OrderStatus.CANCELADO
}