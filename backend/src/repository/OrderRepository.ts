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
            },
            relations: {
                productOrders: {
                    product: true,
                    productVariationOrder: {
                        productVariation: true
                    }
                },
                comanda: true
            },
            order: {
                created_at: 'ASC'
            },
            select: {
                id: true,
                observation: true,
                created_at: true,
                status: true,
                total: true,
                comanda: {
                    id: true,
                    description: true
                },
                productOrders: {
                    id: true,
                    quantity: true,
                    observation: true,
                    price: true,
                    product: {
                        id: true,
                        name: true
                    },
                    productVariationOrder: {
                        orderId: true,
                        productVariationId: true,
                        productVariation: {
                            id: true,
                            name: true
                        }
                    }
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
            },
            relations: {
                productOrders: {
                    productVariationOrder: {
                        productVariation: true
                    }
                },
                comanda: true
            }
        })
    }

    async updateOrderStatus(id: number, status: OrderStatus) {
        await this.update(id, {status})
    }
    
    async cancelOrder(orderId: number, params: CancelOrderParams) {
        await this.update(orderId, params)
    }

    async getOrder(id: number) {
        return await this.findOne({ where: { id }})
    }
    
}