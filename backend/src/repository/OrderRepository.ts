import { DataSource, Repository } from "typeorm";
import { Order } from "../database";
import { OrderParams } from "../dto";
import { OrderStatus } from "../enum";
import { STATUS_PEDIDO_IDS } from "../database/entity/lookup-ids";

export class OrderRepository extends Repository<Order> {

    constructor(private dataSource: DataSource) {
        super(Order, dataSource.createEntityManager());
    }

    async createOrder(order: OrderParams) {
        return await this.save(order as any);
    }

    async getOrderWithDetails(id: number) {
        return await this.findOne({
            where: { id },
            relations: ["productOrders", "productOrders.product", "productOrders.productVariation", "user"]
        });
    }

    async listOrders(establishmentId: number) {
        return await this.find({
            where: {
                comanda: { establishment: { id: establishmentId } }
            },
            relations: [
                'comanda',
                'user',
                'productOrders',
                'productOrders.product',
                'productOrders.productVariation',
            ]
        });
    }

    async listOrdersByComanda(comandaId: number) {
        return await this.find({
            where: {
                comanda: { id: comandaId }
            },
            relations: [
                'user', 
                'productOrders',
                'productOrders.product',
                'productOrders.productVariation',
            ]
        });
    }

    async updateOrderStatus(id: number, status: OrderStatus) {
        const statusIdMap: Record<OrderStatus, number> = {
            [OrderStatus.AGUARDANDO_PREPARO]: STATUS_PEDIDO_IDS.AGUARDANDO_PREPARO,
            [OrderStatus.EM_PREPARO]: STATUS_PEDIDO_IDS.EM_PREPARO,
            [OrderStatus.PRONTO]: STATUS_PEDIDO_IDS.PRONTO,
            [OrderStatus.FINALIZADO]: STATUS_PEDIDO_IDS.FINALIZADO,
            [OrderStatus.CANCELADO]: STATUS_PEDIDO_IDS.CANCELADO,
        };
        await this.update(id, { status: { id: statusIdMap[status] } as any });
    }
}