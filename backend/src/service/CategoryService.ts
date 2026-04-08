import { Category } from "../database";
import { CreateCategory } from "../dto";
import { CategoryRepository } from "../repository";

export class CategoryService {

    private categoryRepository: CategoryRepository

    constructor(categoryRepository: CategoryRepository) {
        this.categoryRepository = categoryRepository
    }

    /**
     * Cria uma nova categoria. 
     * Certifique-se de que o DTO CreateCategory agora aceite o campo 'image'.
     */
    async createCategory(category: CreateCategory) {
        // Ao passar o objeto 'category' completo, o Repository receberá o Base64 da imagem
        const { id } = await this.categoryRepository.createCategory(category) 
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

    /**
     * Atualiza uma categoria existente.
     * CORREÇÃO: Agora o campo 'image' é enviado para o repositório.
     */
    async updateCategory(categoryId: number, data: any) {
        await this.categoryRepository.updateCategory(categoryId, { 
            name: data.name, 
            image: data.image // Adicionado para persistir o Base64 no banco
        });
    }

    async softDeleteCategory(categoryId: number) {
        await this.categoryRepository.softDeleteCategory(categoryId);
    }

    async restoreCategory(categoryId: number) {
        await this.categoryRepository.restoreCategory(categoryId);
    }
}