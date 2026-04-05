import { Category, Establishment, Product } from "../../database"
import { ProductStatus } from "../../enum"

export type ProductParams = {
    name: string,
    description?: string, 
    establishmentId: number,
    categoryId: number,
    basePrice: number,
    image?: Buffer
}

export type CreateProductParams = {
    name: string,
    description?: string, 
    establishment: Establishment,
    category: Category,
    basePrice: number,
    image?: string
}

export type ProductVariationParams = {
    name: string,
    addPrice: number
}

export type CreateProduct = {
    product: ProductParams,
    productVariations: Array<ProductVariationParams>
}

export type CreateProductVariation = {
    name: string,
    addPrice: number,
    product: Product
}
