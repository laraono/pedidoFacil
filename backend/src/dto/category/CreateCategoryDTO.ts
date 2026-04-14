import { Establishment } from "../../database"

export type CreateCategory = {
    name: string,
    establishmentId: number,
    image?: Buffer
}

export type CreateCategoryParams = {
    name: string,
    establishment: Establishment,
    image: string
}