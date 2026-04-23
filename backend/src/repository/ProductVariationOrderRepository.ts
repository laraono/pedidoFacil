import { DataSource, Repository } from "typeorm";
import { ProductVariationOrder } from "../database";
import { ProductVariationOrderParams } from "../dto";

export class ProductVariationOrderRepository extends Repository<ProductVariationOrder>{

    constructor(private dataSource: DataSource) {
        super(ProductVariationOrder, dataSource.createEntityManager());
    }

    async createProductVariantOrder(productOrder: ProductVariationOrderParams) {
        return await this.save(productOrder)
    }
    
}