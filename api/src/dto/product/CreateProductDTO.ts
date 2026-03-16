import { Product } from "../../database"

export type ProductParams = {
    name: string,
    description?: string, 
    isAvailable: boolean,
    categoryId: number
}

export type AddonParams = {
    name: string,
    price: number
}

export type CreateProduct = {
    product: ProductParams,
    addons?: Array<AddonParams>,
    sizes: Array<AddonParams>
}

export type CreateAddon = {
    name: string,
    price: number,
    product: Product
}

export type CreateSize = {
    name: string,
    price: number,
    product: Product
}