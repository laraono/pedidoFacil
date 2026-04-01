import { OrderService } from "../service";
import {Request, Response} from 'express';
import { getIO } from '../socket';

export class OrderController {

    private orderService: OrderService

    constructor(orderService: OrderService) {
        this.orderService = orderService
    }

    async createOrder(req: Request, res: Response) {
        const {comandaId} = req.params

        const order = await this.orderService.createOrder({...req.body, comandaId})

        getIO().to('kitchen').emit('new_order', {
            orderId:      order.id,
            comandaId:    Number(comandaId),
            comandaLabel: req.body.comandaLabel || `Comanda #${comandaId}`,
            items:        req.body.itens || [],
            createdAt:    new Date().toISOString(),
            source:       req.body.source || 'web',
        });

        res.status(201).send(order)
    }

    async updateOrderStatus(req: Request, res: Response) {
        const { orderId } = req.params
        const { status } = req.body

        await this.orderService.updateOrderStatus(Number(orderId), status)

        getIO().to('cashier').to('waiter').emit('order_status_updated', {
            orderId:   Number(orderId),
            comandaId: req.params.comandaId ? Number(req.params.comandaId) : null,
            status,
        });

        res.sendStatus(204)
    }

    async listOrders(req: Request, res: Response) {
        const orders = await this.orderService.listOrders()
        res.status(200).send(orders)
    }

    async listOrdersByComanda(req: Request, res: Response) {
        const { comandaId } = req.params
        const orders = await this.orderService.listOrdersByComanda(Number(comandaId))
        res.status(200).send(orders)
    }
    
}