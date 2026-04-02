import { CategoryService } from "../service";
import { Request, Response } from 'express';

export class CategoryController {

    private categoryService: CategoryService

    constructor(categoryService: CategoryService) {
        this.categoryService = categoryService
    }

    async createCategory(req: Request, res: Response) {
        req.body.establishment = { id: (req as any).usuario.estabelecimento };
        
        const categoryId = await this.categoryService.createCategory(req.body);
        
        res.status(201).json(categoryId);
    }

    async listCategories(req: Request, res: Response) {
        if (req.query.deleted === 'true') {
            const categories = await this.categoryService.listDeletedCategories()
            return res.status(200).send(categories)
        }

        const categories = await this.categoryService.listCategories()
        return res.status(200).send(categories)
    }

    async updateCategory(req: Request, res: Response) {
        await this.categoryService.updateCategory(Number(req.params.id), req.body);
        res.sendStatus(204);
    }

    async deleteCategory(req: Request, res: Response) {
        await this.categoryService.softDeleteCategory(Number(req.params.id));
        res.sendStatus(204);
    }

    async restoreCategory(req: Request, res: Response) {
        await this.categoryService.restoreCategory(Number(req.params.id));
        res.sendStatus(204);
    }
}