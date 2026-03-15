import { DataSource, Repository } from "typeorm";
import { Order } from "../database";
import { OrderParams } from "../dto";

export class OrderRepository extends Repository<Order>{

    constructor(private dataSource: DataSource) {
        super(Order, dataSource.createEntityManager());
    }

    async createOrder(order: OrderParams) {
        return await this.save(order)
    }

    async listOrders() {
        return await this.find()
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
    
}