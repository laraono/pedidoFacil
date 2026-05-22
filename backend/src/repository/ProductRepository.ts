import { DataSource, Repository, IsNull, Not } from "typeorm";
import { Product } from "../database";
import { ProductParams } from "../dto";

export class ProductRepository extends Repository<Product> {

    constructor(private dataSource: DataSource) {
        super(Product, dataSource.createEntityManager());
    }

    async createProduct(product: ProductParams) {
        return await this.save(product as any);
    }

    async listProducts(establishmentId: number, page: number, limit: number) {
        const skip = (page - 1) * limit;

        const [products, total] = await this.findAndCount({
            where: { establishment: { id: establishmentId } }, 
            relations: ['category', 'productVariations'],
            take: limit,
            skip: skip
        });

        return { 
            products, 
            total, 
            totalPages: Math.ceil(total / limit),
            currentPage: page
        };
    }

    async listProductsByCategory(categoryId: number, establishmentId: number, page: number, limit: number) {
        const skip = (page - 1) * limit;

        const [products, total] = await this.findAndCount({
            where: {
                category: { id: categoryId },
                establishment: { id: establishmentId } 
            },
            take: limit,
            skip: skip
        });

        return { 
            products, 
            total, 
            totalPages: Math.ceil(total / limit),
            currentPage: page
        };
    }

    async listDeletedProducts(establishmentId: number, page: number, limit: number) {
        const skip = (page - 1) * limit;

        const [products, total] = await this.findAndCount({
            where: { 
                establishment: { id: establishmentId },
                deletedAt: Not(IsNull()) 
            },
            withDeleted: true,
            relations: { category: true, productVariations: true },
            take: limit,
            skip: skip
        });

        return { 
            products, 
            total, 
            totalPages: Math.ceil(total / limit),
            currentPage: page
        };
    }

    async getProduct(productId: number) {
        return await this.findOne({
            where: {
                id: productId
            }
        });
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