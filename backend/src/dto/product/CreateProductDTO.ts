import { Category, Establishment, Product } from "../../database"
import { ProductStatus } from "../../enum"

export type ProductParams = {
    name: string,
    description?: string, 
    establishmentId: number,
    isAvailable: boolean,
    categoryId: number,
    basePrice: number,
    status: ProductStatus
}

export type CreateProductParams = {
    name: string,
    description?: string, 
    establishment: Establishment,
    isAvailable: boolean,
    category: Category,
    basePrice: number,
    status: ProductStatus
}

export type ProductVariationParams = {
    name: string,
    addPrice: number,
    status: ProductStatus
}

export type CreateProduct = {
    product: ProductParams,
    productVariations: Array<ProductVariationParams>
}

export type CreateProductVariation = {
    name: string,
    addPrice: number,
    status: ProductStatus,
    product: Product
}
