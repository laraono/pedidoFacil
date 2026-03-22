import { Comanda, Order, Product, ProductVariation } from "../../database"
import { OrderStatus } from "../../enum"

export type CreateOrder = {
    status: OrderStatus,
    comandaId: number,
    itens: Array<ItensArray>
}

export type ItensArray = {
    productId: number,
    quantity: number,
    productVariationId?: number,
    observation?: string
}

export type OrderParams = {
    status: OrderStatus,
    comanda: Comanda
}

export type ProductOrderParams = {
    order: Order,
    observation?: string,
    quantity: number,
    price: number,
    product: Product,
    productVariation?: ProductVariation,
}


