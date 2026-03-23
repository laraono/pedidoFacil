import { ComandaStatus } from "../../enum"

export type CreateComanda = {
    description: string,
    status: ComandaStatus,
    total: number
}