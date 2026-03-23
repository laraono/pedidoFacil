import { User } from "../../database/entity/User"
import { ComandaStatus } from "../../enum"

export type CancelComanda = {
    comandaId: number,
    userId: number,
    reason: string
}

export type CancelComandaParams = {
    user: User,
    reason: string,
    status: ComandaStatus.CANCELADA
}