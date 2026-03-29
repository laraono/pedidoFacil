import { Comanda, Establishment, Order, Product, ProductVariation } from "../../database"
import { OrderStatus } from "../../enum"

export type CreateOrder = {
    status: OrderStatus,
    comandaId: number,
    establishmentId: number,
    itens: Array<ItensArray>
}

export type ItensArray = {
    productId: number,
    quantity: number,
    productVariationId?: number,
    observation?: string
}

export type ProductOrderParams = {
    order: Order,
    observation?: string,
    quantity: number,
    price: number,
    product: Product,
    productVariation?: ProductVariation,
}

export type ProductVariationOrderParams = {
    productId: number,
    orderId: number,
    productVariationid: number,
    price: number
}


