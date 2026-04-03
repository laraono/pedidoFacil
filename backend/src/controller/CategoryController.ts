import { CategoryService } from "../service";
import {Request, Response} from 'express';

export class CategoryController {

    private categoryService: CategoryService

    constructor(categoryService: CategoryService) {
        this.categoryService = categoryService
    }

    async createCategory(req: Request, res: Response) {
        const categoryId = await this.categoryService.createCategory(req.body)

        res.status(201).send(categoryId)
    }

    async listCategories(req, res: Response) {
        const categories = await this.categoryService.listCategories(req.body)
        
        res.status(200).send(categories)
    }

    async listActivieCategories(req, res: Response) {
        const categories = await this.categoryService.listCategories(req.body)
        
        res.status(200).send(categories)
    }
    
}