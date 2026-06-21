import { OrderService } from "../service";
import { Request, Response } from 'express';
import { OrderStatus } from '../enum';
import { auditLog, logger } from "../utils/logger";

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

            const clientRequestId = req.headers['x-idempotency-key'] as string | undefined;
            const order = await this.orderService.createOrder({
                ...req.body,
                comandaId: Number(comandaId),
                establishmentId: usuario.estabelecimento,
                userId: usuario.id, 
                clientRequestId: clientRequestId ?? null, 
            });

            return res.status(201).json(order);
        } catch (error: any) {
            logger.error("Erro ao criar pedido:", error.message);
            return res.status(400).json({ error: error.message || "Erro interno" });
        }
    }

    async createTotemOrder(req: Request, res: Response) {
        try {
            const usuario = (req as any).usuario;

            if (!usuario || !usuario.estabelecimento) {
                return res.status(401).json({ error: "Código do Totem inválido ou estabelecimento não encontrado." });
            }

            const comandaLabel = (req.body.description as string | undefined)?.trim() || 'Totem'; // é impossível mas ok, fallbacks né

            const order = await this.orderService.createTotemOrder({
                ...req.body,
                establishmentId: usuario.estabelecimento,
                comandaLabel,
            }) as any;

            return res.status(201).json({ id: order.id, label: order.comanda.description, comandaId: order.comanda.id });
        } catch (error: any) {
            logger.error("Erro no pedido Totem:", error.message);
            return res.status(400).json({ error: error.message || "Erro interno ao processar pedido" }); // 400?
        }
    }

    async updateOrderStatus(req: Request, res: Response) {
        const { orderId, comandaId } = req.params;
        const { status, cancellationDescription } = req.body;
        const usuario = (req as any).usuario;

        await this.orderService.updateOrderStatus(
            Number(orderId),
            status,
            usuario.id,
            cancellationDescription,
            Number(comandaId),
            usuario.estabelecimento,
        );

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

        await this.orderService.updateOrderStatus(
            Number(orderId),
            OrderStatus.CANCELADO,
            usuario.id,
            cancellationDescription,
            Number(comandaId),
            usuario.estabelecimento,
        );

        auditLog('cancel_order.success', { orderId, userId: usuario.id, description: cancellationDescription });
        res.sendStatus(204);
    }
}