import { DataSource, Repository, IsNull, Not } from "typeorm";
import { Product } from "../database";
import { ProductParams } from "../dto";

export class ProductRepository extends Repository<Product>{

    constructor(private dataSource: DataSource) {
        super(Product, dataSource.createEntityManager());
    }

    async createProduct(product: ProductParams) {
        return await this.save(product)
    }

    async listProducts(establishmentId: number) {
        return await this.find({
            where: { establishment: { id: establishmentId } }, 
            relations: ['category', 'productVariations']
        });
    }

    async listProductsByCategory(categoryId: number, establishmentId: number) {
        return await this.find({
            where: {
                category: { id: categoryId },
                establishment: { id: establishmentId } 
            }
        });
    }

    async listDeletedProducts(establishmentId: number) {
        return await this.find({
            where: { 
                establishment: { id: establishmentId },
                deletedAt: Not(IsNull()) 
            },
            withDeleted: true,
            relations: { category: true, productVariations: true }
        });
    }

    async getProduct(productId: number) {
        return await this.findOne({
            where: {
                id: productId
            }
        })
    }

    async updateProduct(productId: number, data: Partial<Product>) {
        await this.update(productId, data);
    }

    async softDeleteProduct(productId: number) {
        await this.softDelete(productId);
    }

    async restoreProduct(productId: number) {
        await this.restore(productId);
    }
}