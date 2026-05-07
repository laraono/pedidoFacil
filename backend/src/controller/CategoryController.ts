import { CategoryService } from "../service";
import { Request, Response } from 'express';
import { getIO } from '../socket';
import { deleteFile } from '../utils/fileHelper';

export class CategoryController {

    private categoryService: CategoryService

    constructor(categoryService: CategoryService) {
        this.categoryService = categoryService
    }

    async createCategory(req: Request, res: Response) {
        let categoryData = { ...req.body };
        categoryData.establishment = { id: (req as any).usuario.estabelecimento };
        
        if (req.file) {
            categoryData.image = req.file.filename;
        }
        
        const categoryId = await this.categoryService.createCategory(categoryData);
        
        getIO().emit('menu_updated'); 
        res.status(201).json(categoryId);
    }

    async listCategories(req: Request, res: Response) {
        const estabelecimentoId = (req as any).usuario.estabelecimento; 
        
        if (req.query.deleted === 'true') {
            const categories = await this.categoryService.listDeletedCategories(estabelecimentoId);
            return res.status(200).send(categories);
        }

        const categories = await this.categoryService.listCategories(estabelecimentoId);
        return res.status(200).send(categories);
    }

    async updateCategory(req: Request, res: Response) {
        console.log("=== INICIANDO UPDATE DE CATEGORIA ===");
        console.log("Body recebido:", req.body);
        console.log("Arquivo (File) recebido:", req.file ? req.file.filename : "NENHUM ARQUIVO");

        const id = Number(req.params.id);
        let categoryData = { ...req.body };

        if (req.file) {
            const oldCategory = await this.categoryService.getCategory(id);
            
            if (oldCategory && oldCategory.image) {
                deleteFile(oldCategory.image);
            }
            
            categoryData.image = req.file.filename;
            categoryData.imagem = req.file.filename; 
        }

        await this.categoryService.updateCategory(id, categoryData);
        
        getIO().emit('menu_updated'); 
        res.sendStatus(204);
    }

    async deleteCategory(req: Request, res: Response) {
        await this.categoryService.softDeleteCategory(Number(req.params.id));
        
        getIO().emit('menu_updated'); 
        res.sendStatus(204);
    }

    async restoreCategory(req: Request, res: Response) {
        await this.categoryService.restoreCategory(Number(req.params.id));
        
        getIO().emit('menu_updated'); 
        res.sendStatus(204);
    }
}