import { CategoryService } from "../service";
import {Request, Response} from 'express';

export class CategoryController {

    private categoryService: CategoryService

    constructor(categoryService: CategoryService) {
        this.categoryService = categoryService
    }

    async createCategory(req: Request, res: Response) {
        const image = req.file ? 
            req.file.buffer ? req.file.buffer : undefined
            : undefined

        const categoryId = await this.categoryService.createCategory({...req.body, image})

        res.status(201).send(categoryId)
    }

    async listCategories(req: Request, res: Response) {
        const { estabelecimento: establishmentId } = (req as any).usuario
        const categories = await this.categoryService.listCategories({ establishmentId })

        res.status(200).send(categories)
    }

    async listActivieCategories(req: Request, res: Response) {
        const categories = await this.categoryService.listActiveCategories(req.body)
        
        res.status(200).send(categories)
    }

    async updateCategory(req, res: Response) {
        await this.categoryService.updateCategory(req.params, {...req.body, image: req.file.buffer})

        res.sendStatus(204)
    }

    async deleteCategory(req, res: Response) {
        const {categoryId} = req.params

        await this.categoryService.deleteCategory(categoryId)

        res.sendStatus(204)

    }
    
}