import { DataSource, Repository } from "typeorm";
import { Product } from "../database";
import { CreateProductParams } from "../dto";

export class ProductRepository extends Repository<Product>{

    constructor(private dataSource: DataSource) {
        super(Product, dataSource.createEntityManager());
    }

    async createProduct(product: CreateProductParams) {
        return await this.save(product)
    }

    async listProducts(establishmentId: number) {
        return await this.find({
            where: {
                establishment: {
                    id: establishmentId
                }
            }
        })
    }

    async listProductsByCategory(categoryId: number, establishmentId: number) {
        return await this.find({
            where: {
                category: {
                    id: categoryId
                },
                establishment: {
                    id: establishmentId
                }
            }
        })
    }

    async getProduct(productId: number) {
        return await this.findOne({
            where: {
                id: productId
            }
        })
    }
    
}