import { DataSource, Repository } from "typeorm";
import { Order } from "../database";
import { CancelOrderParams } from "../dto";
import { OrderStatus } from "../enum";

export class OrderRepository extends Repository<Order>{

    constructor(private dataSource: DataSource) {
        super(Order, dataSource.createEntityManager());
    }

    async listOrders(establishmentId: number) {
        return await this.find({
            where: {
                establishment: {
                    id: establishmentId
                }
            }
        })
    }

    async listOrdersByComanda(comandaId: number) {
        return await this.find({
            where: {
                comanda: {
                    id: comandaId
                }
            }
        })
    }

    async updateOrderStatus(id: number, status: OrderStatus) {
        await this.update(id, {status})
    }
    
    async cancelOrder(orderId: number, params: CancelOrderParams) {
        await this.update(orderId, params)
    }
    
}