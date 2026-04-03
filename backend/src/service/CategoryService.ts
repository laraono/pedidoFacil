import { CreateCategory } from "../dto";
import { AppError } from "../middleware";
import { CategoryRepository, EstablishmentRepository } from "../repository";

export class CategoryService {

    private categoryRepository: CategoryRepository
    private establishmentRepository: EstablishmentRepository

    constructor(categoryRepository: CategoryRepository, establishmentRepository: EstablishmentRepository) {
        this.categoryRepository = categoryRepository
        this.establishmentRepository = establishmentRepository
    }

    async createCategory(category: CreateCategory) {

        const establishment = await this.establishmentRepository.getEstablishment(category.establishmentId)
    
        if(!establishment) {
            throw new AppError("Estabelecimento não encontrado", 400)
        }

        const categoryParams = { ...category, establishment}

        const {id} = await this.categoryRepository.createCategory(categoryParams) 

        return id
    }

    async listCategories({establishmentId}:{establishmentId: number}) {
        return await this.categoryRepository.listCategories(establishmentId)
    }

    async listActiveCategories({establishmentId}:{establishmentId: number}) {
        return await this.categoryRepository.listActiveCategories(establishmentId)
    }

    async getCategory(categoryId: number) {
        return await this.categoryRepository.getCategory(categoryId)
    }

    async updateCategory(categoryId: number, name: string) {
        await this.categoryRepository.updateCategory(categoryId, name)
    }

    async deleteCategory(categoryId: number) {
        const category = await this.categoryRepository.getCategory(categoryId)

        if(category.products) {
            throw new AppError('Categoria possui produtos ligados a ela e não pode ser deletada', 409)
        }

        await this.categoryRepository.deleteCategory(categoryId)
    }
}