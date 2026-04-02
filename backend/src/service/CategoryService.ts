import { Category } from "../database";
import { CreateCategory } from "../dto";
import { CategoryRepository } from "../repository";

export class CategoryService {

    private categoryRepository: CategoryRepository

    constructor(categoryRepository: CategoryRepository) {
        this.categoryRepository = categoryRepository
    }

    async createCategory(category: CreateCategory) {
        const {id} = await this.categoryRepository.createCategory(category) 
        return id
    }

    async listCategories() {
        return await this.categoryRepository.listCategories()
    }

    async getCategory(categoryId: number) {
        return await this.categoryRepository.getCategory(categoryId)
    }

    async listDeletedCategories() {
        return await this.categoryRepository.listDeletedCategories()
    }

    async updateCategory(categoryId: number, data: any) {
        await this.categoryRepository.updateCategory(categoryId, { name: data.name });
    }

    async softDeleteCategory(categoryId: number) {
        await this.categoryRepository.softDeleteCategory(categoryId);
    }

    async restoreCategory(categoryId: number) {
        await this.categoryRepository.restoreCategory(categoryId);
    }
}