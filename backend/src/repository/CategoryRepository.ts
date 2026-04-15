import { DataSource, Repository, Not, IsNull } from "typeorm";
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
    
    async listDeletedCategories() {
        return await this.find({
            where: { deletedAt: Not(IsNull()) },
            withDeleted: true 
        });
    }

    async updateCategory(categoryId: number, data: Partial<Category>) {
        await this.update(categoryId, data);
    }

    async softDeleteCategory(categoryId: number) {
        await this.softDelete(categoryId);
    }

    async restoreCategory(categoryId: number) {
        await this.restore(categoryId);
    }
}