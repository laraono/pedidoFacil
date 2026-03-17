import { DataSource, Repository } from "typeorm";
import { Product } from "../database";
import { ProductParams } from "../dto";

export class ProductRepository extends Repository<Product>{

    constructor(private dataSource: DataSource) {
        super(Product, dataSource.createEntityManager());
    }

    async createProduct(product: ProductParams) {
        return await this.save(product)
    }

    async listProducts() {
        return await this.find()
    }

    async listProductsByCategory(categoryId: number) {
        return await this.find({
            where: {
                category: {
                    id: categoryId
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