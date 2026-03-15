import { DataSource, Repository } from "typeorm";
import { ProductOrder } from "../database";
import { OrderParams, ProductOrderParams } from "../dto";

export class ProductOrderRepository extends Repository<ProductOrder>{

    constructor(private dataSource: DataSource) {
        super(ProductOrder, dataSource.createEntityManager());
    }

    async createProductOrder(productOrder: ProductOrderParams) {
        return await this.save(productOrder)
    }
    
}