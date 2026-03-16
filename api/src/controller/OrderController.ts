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
    
}