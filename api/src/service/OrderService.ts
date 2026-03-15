import { Order } from "../database";
import { OrderStatus } from "../enum/status";
import { OrderRepository } from "../repository";
import { ComandaService } from "./ComandaService";

export class OrderService {

    private orderRepository: OrderRepository
    private comandaService: ComandaService

    constructor(orderRepository: OrderRepository, comandaService: ComandaService) {
        this.orderRepository = orderRepository
        this.comandaService = comandaService
    }

  /*   async createOrder(createOrder: CreateOder) {

        const comanda = await this.comandaService.getComanda(createOrder.comandaId)

        if(!comanda) {
            return
        }

        const order: Order = {
            comanda: comanda,
            status: createOrder.status,

        }
        
        const {id} = await this.orderRepository.createOrder(order) 

        return id
    }
 */
    async listOrders() {
        return await this.orderRepository.listOrders()
    }

    async listOrdersByComanda(comandaId: number) {
        return await this.orderRepository.listOrdersByComanda(comandaId)
    }

    async validateItens(itens: Array<number>) {

    }
} 