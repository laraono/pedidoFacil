import { Category } from "../../database"
import { ProductStatus } from "../../enum"
import { ProductParams, ProductVariationParams } from "./CreateProductDTO"

export type EditProductParams = {
    name: string,
    description?: string, 
    category: Category,
    basePrice: number
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

