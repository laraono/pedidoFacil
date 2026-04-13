import { DataSource, Repository } from "typeorm";
import { CreateProductVariation, ProductVariationOrderParams, ProductVariationParams } from "../dto";
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

    async updateProductVariation(variationId: number, params: ProductVariationParams) {
        await this.update(variationId, params)
    }

    async deleteProductVariation(productId: number) {
        await this.softDelete(productId)
    }

    async softDeleteVariationsByProduct(productId: number) {
        await this.createQueryBuilder()
            .softDelete()
            .where("ID_Produto = :productId", { productId })
            .execute();
    }
}