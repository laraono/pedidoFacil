import { DataSource, Repository, IsNull, Not } from "typeorm";
import { Product } from "../database";
import { ProductParams } from "../dto";
import { OrderStatus } from "../enum/status";

export class ProductRepository extends Repository<Product> {

    constructor(private dataSource: DataSource) {
        super(Product, dataSource.createEntityManager());
    }

    async createProduct(product: ProductParams) {
        return await this.save(product as any);
    }

    async listProducts(establishmentId: number, page: number, limit: number, status?: string) {
        const skip = (page - 1) * limit;

        const qb = this.createQueryBuilder('product')
            .innerJoinAndSelect('product.category', 'category')
            .innerJoin('category.establishment', 'establishment')
            .leftJoinAndSelect(
                'product.productVariations',
                'variation',
                'variation.deletedAt IS NULL'
            )
            .where('establishment.id = :establishmentId', { establishmentId })
            .take(limit)
            .skip(skip);

        if (status !== undefined && status !== null) {
            qb.andWhere('product.ativo = :ativo', { ativo: status !== 'Inativo' && status !== 'false' });
        }

        const [products, total] = await qb.getManyAndCount();

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
                category: { id: categoryId, establishment: { id: establishmentId } }
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
                category: { establishment: { id: establishmentId } },
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

    async hasActiveOrders(productId: number): Promise<boolean> {
        const activeStatuses = [OrderStatus.AGUARDANDO_PREPARO, OrderStatus.EM_PREPARO, OrderStatus.PRONTO];
        const count = await this.createQueryBuilder('product')
            .innerJoin('product.productOrders', 'item')
            .innerJoin('item.order', 'order')
            .innerJoin('order.status', 'status')
            .where('product.id = :productId', { productId })
            .andWhere('status.nome IN (:...statuses)', { statuses: activeStatuses })
            .getCount();
        return count > 0;
    }

    async softDeleteProduct(productId: number) {
        await this.softDelete(productId);
    }

    async restoreProduct(productId: number) {
        await this.restore(productId);
    }
}