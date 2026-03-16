import { Addon, Comanda, Order, Product, Size } from "../../database"
import { OrderStatus } from "../../enum"

export type CreateOrder = {
    status: OrderStatus,
    comandaId: number,
    itens: Array<ItensArray>
}

export type ItensArray = {
    productId: number,
    quantity: number,
    addOnId?: number,
    sizeId: number,
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
    size: Size,
    addon?: Addon,
}


