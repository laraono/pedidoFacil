import { DataSource, IsNull, Not, Repository } from "typeorm";
import { CreateCategoryParams } from "../dto";
import { Category } from "../database";

export class CategoryRepository extends Repository<Category>{

    constructor(private dataSource: DataSource) {
        super(Category, dataSource.createEntityManager());
    }

    async createCategory(category: CreateCategoryParams) {
        return await this.save(category)
    }

    async listCategories(establishmentId: number) {
        return await this.find({
            where: {
                establishment: {
                    id: establishmentId
                }
            }
        })
    }

    async listActiveCategories(establishmentId: number) {
        return await this.find({
            where: {
                establishment: { id: establishmentId },
                products: { id: Not(IsNull()) }
            },
            relations: ["products"]
        })
    }

    async getCategory(categoryId: number) {
        return await this.findOne({
            where: {
                id: categoryId
            },
            relations: {
                products: true
            }
        })
    }

    async updateCategory(categoryId: number, name: string) {
        await this.update(categoryId, {name})
    }

    async deleteCategory(categoryId: number) {
        await this.softDelete(categoryId)
    }
    
}