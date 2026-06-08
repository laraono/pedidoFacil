import { DataSource, Repository, Not, IsNull } from "typeorm";
import { CreateCategory } from "../dto";
import { Category } from "../database";
import { CategoryStatus } from "../enum";

export class CategoryRepository extends Repository<Category>{

    constructor(private dataSource: DataSource) {
        super(Category, dataSource.createEntityManager());
    }

    async createCategory(category: CreateCategory) {
        return await this.save(category)
    }

    async listCategories(establishmentId: number) {
        return await this.find({
            where: { establishment: { id: establishmentId }, status: CategoryStatus.ATIVA }
        });
    }

    async listInactiveCategories(establishmentId: number) {
        return await this.find({
            where: { establishment: { id: establishmentId }, status: CategoryStatus.INATIVA }
        });
    }

    async listDeletedCategories(establishmentId: number) {
        return await this.find({
            where: {
                establishment: { id: establishmentId },
                deletedAt: Not(IsNull())
            },
            withDeleted: true
        });
    }

    async getCategory(categoryId: number) {
        return await this.findOne({
            where: { id: categoryId }
        })
    }

    async updateCategory(categoryId: number, data: Partial<Category>) {
        await this.update(categoryId, data);
    }

    async deactivateCategory(categoryId: number) {
        await this.update(categoryId, { status: CategoryStatus.INATIVA });
    }

    async reactivateCategory(categoryId: number) {
        await this.update(categoryId, { status: CategoryStatus.ATIVA });
    }

    async softDeleteCategory(categoryId: number) {
        await this.softDelete(categoryId);
    }

    async restoreCategory(categoryId: number) {
        await this.restore(categoryId);
    }
}
