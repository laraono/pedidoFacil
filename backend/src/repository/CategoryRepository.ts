import { DataSource, Repository } from "typeorm";
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

    async getCategory(categoryId: number) {
        return await this.findOne({
            where: {
                id: categoryId
            }
        })
    }
    
}