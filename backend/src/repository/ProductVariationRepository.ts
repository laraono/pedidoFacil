import { DataSource, Repository } from "typeorm";
import { CreateProductVariation } from "../dto";
import { ProductVariation } from "../database";

export class ProductVariationRepository extends Repository<ProductVariation>{

    constructor(private dataSource: DataSource) {
        super(ProductVariation, dataSource.createEntityManager());
    }

    async createProductVariation(productVariation: CreateProductVariation) {
        return await this.save(productVariation)
    }

    async getProductVariation(productVariationId: number) {
        return await this.findOne( {
            where: {
                id: productVariationId
            }
        })
    }

    async getProductVariationsByProduct(productId: number) {
        return await this.find({
            where: {
                product: {
                    id: productId
                }
            }
        })
    }
    
}