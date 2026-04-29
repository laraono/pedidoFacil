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

    async updateOrderStatus(req, res: Response) {
        const { orderId } = req.params
        const { status } = req.body
        await this.orderService.updateOrderStatus(Number(orderId), status)

        res.sendStatus(204)
    }

    async cancelOrder(req, res: Response) {
        const { comandaId} = req.params
        const { orderId } = req.params

        await this.orderService.cancelOrder(orderId, {comandaId, ...req.body})
        
        res.sendStatus(204)
    }

    async getOrder(req, res: Response) {
        const { comandaId} = req.params
        const { orderId } = req.params

        const order = await this.orderService.getOrder(orderId, {comandaId, ...req.body})
        
        res.status(200).send(order)
    }

    async listOrders(req, res: Response) {
        const orders = await this.orderService.listOrders(req.body)

        res.status(200).send(orders)
    }

    async listOrdersByComanda(req, res: Response) {
        const { comandaId } = req.params
        const orders = await this.orderService.listOrdersByComanda(Number(comandaId))

        res.status(200).send(orders)
    }
    
}