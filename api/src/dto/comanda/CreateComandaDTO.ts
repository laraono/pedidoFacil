import { ComandaStatus } from "../../enum"

export type CreateComanda = {
    label: string,
    status: ComandaStatus,
    total: number
}