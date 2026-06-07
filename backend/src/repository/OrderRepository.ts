import { DataSource, Repository } from "typeorm";
import { Order } from "../database";
import { OrderParams } from "../dto";
import { OrderStatus } from "../enum";

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
            relations: ["productOrders", "productOrders.product", "productOrders.productVariation"]
        });
    }

    async listOrders(establishmentId: number) {
        return await this.createQueryBuilder('order')
            .leftJoinAndSelect('order.comanda', 'comanda')
            .leftJoinAndSelect('order.productOrders', 'po')
            .leftJoinAndSelect('po.product', 'product')
            .leftJoinAndSelect('po.productVariation', 'pv')
            .where('order.establishment = :id', { id: establishmentId })
            .getMany();
    }

    async listOrdersByComanda(comandaId: number) {
        return await this.find({
            where: {
                comanda: { id: comandaId }
            },
            relations: [
                'productOrders',
                'productOrders.product',
                'productOrders.productVariation',
            ]
        });
    }

    async updateOrderStatus(id: number, status: OrderStatus) {
        await this.update(id, { status });
    }
}