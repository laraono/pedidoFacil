import { DataSource, Repository } from "typeorm";
import { CreateCategory } from "../dto";
import { Category } from "../database";

export class CategoryRepository extends Repository<Category>{

    constructor(private dataSource: DataSource) {
        super(Category, dataSource.createEntityManager());
    }

    async createCategory(category: CreateCategory) {
        return await this.save(category)
    }

    async listCategories() {
        return await this.find()
    }

    async getCategory(categoryId: number) {
        return await this.findOne({
            where: {
                id: categoryId
            }
        })
    }
    
}