import { Category } from "../../database"
import { ProductStatus } from "../../enum"
import { ProductParams, ProductVariationParams } from "./CreateProductDTO"

export type EditProductParams = {
    name: string,
    description?: string, 
    isAvailable: boolean,
    category: Category,
    basePrice: number,
    status: ProductStatus
}

export type EditProductVariation = {
    id: number,
    name: string,
    addPrice: number
}

export type EditProduct = {
    product: ProductParams,
    productVariations: Array<EditProductVariation>
}

