import { OrderService } from "../service";
import { Request, Response } from 'express';

export class OrderController {

    private orderService: OrderService

    constructor(orderService: OrderService) {
        this.orderService = orderService
    }

async createOrder(req: Request, res: Response) {
    console.log("=> [CONTROLLER] Iniciando createOrder para Comanda:", req.params.comandaId);
    try {
        const { comandaId } = req.params;
        const usuario = (req as any).usuario;

        if (!usuario || !usuario.estabelecimento) {
            console.error("=> [CONTROLLER] Erro: Usuário sem estabelecimento no token");
            return res.status(401).json({ error: "Sessão inválida" });
        }

        console.log("=> [CONTROLLER] Chamando Service...");
        const orderId = await this.orderService.createOrder({
            ...req.body,
            comandaId: Number(comandaId),
            establishmentId: usuario.estabelecimento 
        });

        console.log("=> [CONTROLLER] Pedido criado com sucesso! ID:", orderId);
        return res.status(201).json(orderId);
    } catch (error: any) {
        console.error("🔥 [CONTROLLER] Erro capturado:", error.message);
        return res.status(400).json({ error: error.message || "Erro interno" });
    }
}
    async updateOrderStatus(req: Request, res: Response) {
        const { orderId } = req.params
        const { status } = req.body
        await this.orderService.updateOrderStatus(Number(orderId), status)

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