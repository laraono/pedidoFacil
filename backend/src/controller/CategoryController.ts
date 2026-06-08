import { CategoryService } from "../service";
import { Request, Response } from 'express';
import { getIO } from '../socket';
import path from 'path';
import { 
    ensureBucketExists, 
    generateUniqueImageKey, 
    uploadToS3, 
    getImageContentType 
} from "../service/S3Service"; 

export class CategoryController {

    private categoryService: CategoryService

    constructor(categoryService: CategoryService) {
        this.categoryService = categoryService
    }

    async createCategory(req: Request, res: Response) {
        let categoryData = { ...req.body };
        categoryData.establishment = { id: (req as any).usuario.estabelecimento };
        
        if (req.file) {
            const bucketName = process.env.AWS_BUCKET_NAME || 'pedidofacil-uploads';
            
            await ensureBucketExists(bucketName);

            const key = generateUniqueImageKey(req.file.buffer);
            const extension = path.extname(req.file.originalname) || '.jpg';
            const fullKey = `${key}${extension}`;

            const contentType = getImageContentType(req.file);

            const uploadResult = await uploadToS3({
                bucket: bucketName,
                key: fullKey,
                body: req.file.buffer,
                contentType: contentType
            });

            categoryData.image = uploadResult.Location;
        }
        
        const categoryId = await this.categoryService.createCategory(categoryData);
        
        getIO().emit('menu_updated'); 
        res.status(201).json(categoryId);
    }

    async listCategories(req: Request, res: Response) {
        const estabelecimentoId = (req as any).usuario.estabelecimento;

        if (req.query.inactive === 'true') {
            const categories = await this.categoryService.listInactiveCategories(estabelecimentoId);
            return res.status(200).send(categories);
        }

        const categories = await this.categoryService.listCategories(estabelecimentoId);
        return res.status(200).send(categories);
    }

    async updateCategory(req: Request, res: Response) {
        const id = Number(req.params.id);
        let categoryData = { ...req.body };

        if (req.file) {
            const bucketName = process.env.AWS_BUCKET_NAME || 'pedidofacil-uploads';
            
            await ensureBucketExists(bucketName);

            const key = generateUniqueImageKey(req.file.buffer);
            const extension = path.extname(req.file.originalname) || '.jpg';
            const fullKey = `${key}${extension}`;

            const contentType = getImageContentType(req.file);

            const uploadResult = await uploadToS3({
                bucket: bucketName,
                key: fullKey,
                body: req.file.buffer,
                contentType: contentType
            });
            
            categoryData.image = uploadResult.Location;
            categoryData.imagem = uploadResult.Location; 
        }

        await this.categoryService.updateCategory(id, categoryData);
        
        getIO().emit('menu_updated'); 
        res.sendStatus(204);
    }

    async deactivateCategory(req: Request, res: Response) {
        await this.categoryService.deactivateCategory(Number(req.params.id));
        getIO().emit('menu_updated');
        res.sendStatus(204);
    }

    async reactivateCategory(req: Request, res: Response) {
        await this.categoryService.reactivateCategory(Number(req.params.id));
        getIO().emit('menu_updated');
        res.sendStatus(204);
    }

    async deleteCategory(req: Request, res: Response) {
        await this.categoryService.softDeleteCategory(Number(req.params.id));
        getIO().emit('menu_updated');
        res.sendStatus(204);
    }
}