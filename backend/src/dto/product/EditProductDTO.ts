import { Category } from "../../database"
import { ProductParams } from "./CreateProductDTO"

export type EditProductParams = {
    name: string,
    description?: string, 
    category: Category,
    basePrice: number,
    image?: string
}

export type EditProductVariation = {
    id?: number,
    name: string,
    addPrice: number
}

export type EditProduct = {
    product: ProductParams,
    productVariations: Array<EditProductVariation>
}

