import { DataSource, Repository } from "typeorm";
import { Product } from "../database";
import { CreateProductParams, EditProductParams } from "../dto";
import { ProductStatus } from "../enum";

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
            },
            select: {
                category: {
                    name: true,
                    id: true
                },
                basePrice: true,
                deletedAt: true,
                description: true,
                status: true,
                id: true,
                name: true
            },
            relations: {
                category: true
            },
            order: {
                name: 'ASC'
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
            },
            order: {
                name: 'ASC'
            }
        })
    }

    async listActiveProductsByCategory(categoryId: number, establishmentId: number) {
        return await this.find({
            where: {
                category: {
                    id: categoryId
                },
                establishment: {
                    id: establishmentId
                },
                status: ProductStatus.ATIVO
            },
            order: {
                name: 'ASC'
            },
            relations: {
                productVariations: true
            },
        })
    }

    async getProduct(productId: number) {
        return await this.findOne({
            where: {
                id: productId
            },
            relations: {
                productVariations: true
            }
        })
    }

    async updateProductStatus(productId: number, status: ProductStatus) {
        await this.update(productId, {status})
    }

    async updateProduct(productId: number, params: EditProductParams) {
        await this.update(productId, params)
    }

    async deleteProduct(productId: number) {
        await this.softDelete(productId)
    }
    
}