import { Establishment } from "../../database"
import { ComandaStatus } from "../../enum"

export type CreateComanda = {
    description: string,
    status: ComandaStatus,
    establishmentId: number,
    total: number
}

export type CreateComandaParams = {
    description: string,
    status: ComandaStatus,
    establishment: Establishment,
    total: number
}
