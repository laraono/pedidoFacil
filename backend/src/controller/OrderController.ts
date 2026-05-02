import { OrderService } from "../service";
import { Request, Response } from 'express';
import { getIO } from '../socket';

export class OrderController {
    private orderService: OrderService

    constructor(orderService: OrderService) {
        this.orderService = orderService
    }

    async createOrder(req: Request, res: Response) {
        try {
            const { comandaId } = req.params;
            const usuario = (req as any).usuario;

            if (!usuario || !usuario.estabelecimento) {
                return res.status(401).json({ error: "Sessão inválida" });
            }

            const order = await this.orderService.createOrder({
                ...req.body,
                comandaId: Number(comandaId),
                establishmentId: usuario.estabelecimento 
            });

            const fullOrder = await this.orderService.getOrder(order.id);
            
            const mappedItems = fullOrder?.productOrders.map(po => ({
                name: po.product?.name || po.product?.name || "Produto",
                quantity: po.quantity,
                observation: po.observation
            })) || [];

            getIO().to('kitchen').emit('new_order', {
                orderId:      order.id, 
                comandaId:    Number(comandaId),
                comandaLabel: req.body.comandaLabel || `Comanda #${comandaId}`,
                items:        mappedItems, 
                createdAt:    new Date().toISOString(),
                source:       req.body.serviceType || 'web',
            });

            return res.status(201).json(order);
        } catch (error: any) {
            console.error("🔥 Erro ao criar pedido:", error.message);
            return res.status(400).json({ error: error.message || "Erro interno" });
        }
    }

    async updateOrderStatus(req: Request, res: Response) {
        const { orderId } = req.params;
        const { status } = req.body;

        await this.orderService.updateOrderStatus(Number(orderId), status);

        getIO().to('cashier').to('waiter').emit('order_status_updated', {
            orderId:   Number(orderId),
            comandaId: req.params.comandaId ? Number(req.params.comandaId) : null,
            status,
        });

        res.sendStatus(204);
    }

    async cancelOrder(req, res: Response) {
        const { comandaId} = req.params
        const { orderId } = req.params

        await this.orderService.cancelOrder(orderId, {comandaId, ...req.body})

        getIO().to('cashier').to('waiter').emit('order_status_updated', {
            orderId:   Number(orderId),
            comandaId: req.params.comandaId ? Number(req.params.comandaId) : null,
            status: req.body.status,
        });

        res.sendStatus(204);
    }

    async listOrders(req, res: Response) {
        const orders = await this.orderService.listOrders(req.body)

        res.status(200).send(orders)
    }

    async listOrdersByComanda(req: Request, res: Response) {
        const { comandaId } = req.params;
        const orders = await this.orderService.listOrdersByComanda(Number(comandaId));
        res.status(200).send(orders);
    async listOrdersByComanda(req: Request, res: Response) {
        const { comandaId } = req.params;
        const orders = await this.orderService.listOrdersByComanda(Number(comandaId));
        res.status(200).send(orders);
    }
}