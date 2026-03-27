import { OrderService } from "../service";
import {Request, Response} from 'express';

export class OrderController {

    private orderService: OrderService

    constructor(orderService: OrderService) {
        this.orderService = orderService
    }

    async createOrder(req, res: Response) {

        const {comandaId} = req.params

        const orderId = await this.orderService.createOrder({...req.body, comandaId})

        res.status(201).send(orderId)
    }

    async updateOrderStatus(req, res) {
        const { orderId } = req.params
        const { status } = req.body
        await this.orderService.updateOrderStatus(Number(orderId), status)

        res.sendStatus(204)
    }

    async listOrders(req, res) {
        const orders = await this.orderService.listOrders()

        res.status(200).send(orders)
    }

    async listOrdersByComanda(req, res) {
        const { comandaId } = req.params
        const orders = await this.orderService.listOrdersByComanda(Number(comandaId))

        res.status(200).send(orders)
    }
    
}