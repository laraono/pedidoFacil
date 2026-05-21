import { CategoryRepository } from "../repository/CategoryRepository";
import { CreateCategoryDTO } from "../dto/category/CreateCategoryDTO"; 

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
        const updateData: any = {};

        if (data.name !== undefined) updateData.name = data.name;
        if (data.image !== undefined) updateData.image = data.image;

        if (Object.keys(updateData).length === 0) {
            return; 
        }

        await this.categoryRepository.updateCategory(categoryId, updateData);
    }

    async softDeleteCategory(categoryId: number) {
        await this.categoryRepository.softDeleteCategory(categoryId);
    }

    async restoreCategory(categoryId: number) {
        await this.categoryRepository.restoreCategory(categoryId);
    }
}