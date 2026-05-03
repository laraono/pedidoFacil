import { CategoryService } from "../service";
import { Request, Response } from 'express';
import { getIO } from '../socket';

export class CategoryController {

    private categoryService: CategoryService

    constructor(categoryService: CategoryService) {
        this.categoryService = categoryService
    }

    async createCategory(req: Request, res: Response) {
        req.body.establishment = { id: (req as any).usuario.estabelecimento };
        
        const categoryId = await this.categoryService.createCategory(req.body);
        
        getIO().emit('menu_updated'); 
        res.status(201).json(categoryId);
    }

    async listCategories(req, res: Response) {
        const categories = await this.categoryService.listCategories(req.body)
        
        res.status(200).send(categories)
    }

    async listActivieCategories(req, res: Response) {
        const categories = await this.categoryService.listCategories(req.body)
        
        res.status(200).send(categories)
    }

    async updateCategory(req, res: Response) {
        await this.categoryService.updateCategory(req.params, {...req.body, image: req.file.buffer})

        res.sendStatus(204)
    }

    async restoreCategory(req, res: Response) {
        await this.categoryService.restoreCategory(req.params.categoryId)

        res.sendStatus(204)
    }

    async deleteCategory(req, res: Response) {
        const {categoryId} = req.params

        await this.categoryService.deleteCategory(categoryId)

        res.sendStatus(204)

    }
    
}