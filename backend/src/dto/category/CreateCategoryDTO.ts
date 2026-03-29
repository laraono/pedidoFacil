import { Establishment } from "../../database"

export type CreateCategory = {
    name: string,
    establishmentId: number
}

export type CreateCategoryParams = {
    name: string,
    establishment: Establishment
}