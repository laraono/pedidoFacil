import { Establishment } from "../../database"
import { CategoryStatus } from "../../enum"

export type EditCategory = {
    name: string,
    establishmentId: number,
    status: CategoryStatus
    image?: Buffer
}

export type EditCategoryParams = {
    name: string,
    status: CategoryStatus,
    image: string
}