import { Category } from "../database";
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

    async listCategories(establishmentId: number) {
        return await this.categoryRepository.listCategories(establishmentId)
    }

    async getCategory(categoryId: number) {
        return await this.categoryRepository.getCategory(categoryId)
    }
}