import { Category } from "../database/entity/Category"; 
import { CreateCategoryDTO } from "../dto/category/CreateCategoryDTO"; 
import { CategoryRepository } from "../repository/CategoryRepository";

export class CategoryService {
    private categoryRepository: CategoryRepository

    constructor(categoryRepository: CategoryRepository) {
        this.categoryRepository = categoryRepository
    }

    async createCategory(categoryData: CreateCategoryDTO) {
        const { id } = await this.categoryRepository.createCategory(categoryData); 
        return id;
    }

    async listCategories(establishmentId: number) {
        return await this.categoryRepository.listCategories(establishmentId);
    }

    async listDeletedCategories(establishmentId: number) {
        return await this.categoryRepository.listDeletedCategories(establishmentId);
    }

    async getCategory(categoryId: number) {
        return await this.categoryRepository.getCategory(categoryId);
    }

    async updateCategory(categoryId: number, data: any) {
        await this.categoryRepository.updateCategory(categoryId, { 
            name: data.name, 
            image: data.image 
        });
    }

    async softDeleteCategory(categoryId: number) {
        await this.categoryRepository.softDeleteCategory(categoryId);
    }

    async restoreCategory(categoryId: number) {
        await this.categoryRepository.restoreCategory(categoryId);
    }
}