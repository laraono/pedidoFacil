import { OrderService } from "../service";
import { Request, Response } from 'express';
import { OrderStatus } from '../enum';
import { getIO } from '../socket';
import { auditLog } from "../utils/logger";

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
                return res.status(401).json({ error: "Sessão ou código de estabelecimento inválido." });
            }

            const order = await this.orderService.createOrder({
                ...req.body,
                comandaId: Number(comandaId),
                establishmentId: usuario.estabelecimento,
                userId: usuario.id || usuario.ID_Usuario 
            }) as any;

            const fullOrder = await this.orderService.getOrderWithDetails(order.id);

            const mappedItems = fullOrder?.productOrders?.map(po => {
                const variationName = po.productVariation?.name || '';
                return {
                    name: po.product?.name || 'Produto',
                    variationName,
                    quantity: po.quantity,
                    observation: po.observation,
                };
            }) ?? [];

            getIO().to('kitchen').emit('new_order', {
                orderId:      order.id,
                comandaId:    Number(comandaId),
                comandaLabel: req.body.comandaLabel || `Comanda #${comandaId}`,
                items:        mappedItems,
                createdAt:    new Date().toISOString(),
                source:       req.body.source || 'web',
                userId:       usuario.id || usuario.ID_Usuario,
                user:         { id: usuario.id || usuario.ID_Usuario }
            });

            return res.status(201).json(order);
        } catch (error: any) {
            console.error("🔥 Erro ao criar pedido:", error.message);
            return res.status(400).json({ error: error.message || "Erro interno" });
        }
    }

    async createTotemOrder(req: Request, res: Response) {
        try {
            const usuario = (req as any).usuario;

            if (!usuario || !usuario.estabelecimento) {
                return res.status(401).json({ error: "Código do Totem inválido ou estabelecimento não encontrado." });
            }

            const randomTicket = Math.floor(100 + Math.random() * 900).toString();
            const comandaLabel = `Totem #${randomTicket}`;

            const order = await this.orderService.createTotemOrder({
                ...req.body,
                establishmentId: usuario.estabelecimento,
                comandaLabel: comandaLabel,
                customerName: req.body.customerName ?? null
            }) as any;

            const fullOrder = await this.orderService.getOrderWithDetails(order.id);
            const mappedItems = fullOrder?.productOrders?.map(po => {
                const variationName = po.productVariation?.name || '';
                return {
                    name: po.product?.name || 'Produto',
                    variationName,
                    quantity: po.quantity,
                    observation: po.observation,
                };
            }) ?? [];

            getIO().to('kitchen').emit('new_order', {
                orderId:      order.id,
                comandaId:    order.comanda.id,
                comandaLabel: comandaLabel,
                customerName: req.body.customerName ?? null,
                items:        mappedItems,
                createdAt:    new Date().toISOString(),
                source:       'totem',
                userId:       null,
                user:         null
            });

            return res.status(201).json({
                id: order.id,
                ticket: randomTicket,
                label: comandaLabel
            });
        } catch (error: any) {
            console.error("🔥 Erro no pedido Totem:", error.message);
            return res.status(400).json({ error: error.message || "Erro interno ao processar pedido" });
        }
    }

    async updateOrderStatus(req: Request, res: Response) {
        const { orderId, comandaId } = req.params;
        const { status, cancellationDescription } = req.body;
        const usuario = (req as any).usuario;

        const result = await this.orderService.updateOrderStatus(
            Number(orderId),
            status,
            usuario.id,
            cancellationDescription,
            Number(comandaId)
        );

        getIO().to('kitchen').to('cashier').to('waiter').emit('order_status_updated', {
            orderId:   Number(orderId),
            comandaId: Number(comandaId),
            status,
        });

        if ((status === 'Pronto' || status === 'ready') && result.orderUserId) {
            getIO().emit(`user_notification_${result.orderUserId}`, {
                orderId: Number(orderId),
                comanda: req.params.comandaId ? Number(req.params.comandaId) : result.comandaId
            });
        }

        res.sendStatus(204);
    }

    async listOrders(req: Request, res: Response) {
        const establishmentId = (req as any).usuario.estabelecimento;
        const orders = await this.orderService.listOrders(establishmentId);
        res.status(200).send(orders);
    }

    async listOrdersByComanda(req: Request, res: Response) {
        const { comandaId } = req.params;
        const orders = await this.orderService.listOrdersByComanda(Number(comandaId));
        res.status(200).send(orders);
    }

    async cancelOrder(req: Request, res: Response) {
        const { orderId, comandaId } = req.params;
        const { cancellationDescription } = req.body;
        const usuario = (req as any).usuario;

        const result = await this.orderService.updateOrderStatus(
            Number(orderId),
            OrderStatus.CANCELADO,
            usuario.id,
            cancellationDescription,
            Number(comandaId)
        );

        auditLog('cancel_order.success', { orderId, userId: usuario.id, description: cancellationDescription });
        
        getIO().to('kitchen').to('cashier').emit('order_cancelled', {
            orderId: Number(orderId),
            comandaId: result.comandaId
        });

        if (result.comandaCancelled) {
            getIO().to('kitchen').to('cashier').emit('comanda_cancelled', {
                comandaId: result.comandaId
            });
        }
           
        res.sendStatus(204);
    }
}