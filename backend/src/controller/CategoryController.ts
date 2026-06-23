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
        try {
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
        } catch (error: any) {
            res.status(500).json({ error: error.message || 'Erro ao criar categoria' });
        }
    }

    async listCategories(req: Request, res: Response) {
        try {
            const estabelecimentoId = (req as any).usuario.estabelecimento;

            if (req.query.inactive === 'true') {
                const categories = await this.categoryService.listInactiveCategories(estabelecimentoId);
                return res.status(200).send(categories);
            }

            const categories = await this.categoryService.listCategories(estabelecimentoId);
            return res.status(200).send(categories);
        } catch (error: any) {
            res.status(500).json({ error: error.message || 'Erro ao listar categorias' });
        }
    }

    async updateCategory(req: Request, res: Response) {
        try {
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
        } catch (error: any) {
            res.status(500).json({ error: error.message || 'Erro ao atualizar categoria' });
        }
    }

    async deactivateCategory(req: Request, res: Response) {
        try {
            await this.categoryService.deactivateCategory(Number(req.params.id));
            getIO().emit('menu_updated');
            res.sendStatus(204);
        } catch (error: any) {
            res.status(500).json({ error: error.message || 'Erro ao desativar categoria' });
        }
    }

    async reactivateCategory(req: Request, res: Response) {
        try {
            await this.categoryService.reactivateCategory(Number(req.params.id));
            getIO().emit('menu_updated');
            res.sendStatus(204);
        } catch (error: any) {
            res.status(500).json({ error: error.message || 'Erro ao reativar categoria' });
        }
    }

    async deleteCategory(req: Request, res: Response) {
        try {
            await this.categoryService.softDeleteCategory(Number(req.params.id));
            getIO().emit('menu_updated');
            res.sendStatus(204);
        } catch (error: any) {
            res.status(500).json({ error: error.message || 'Erro ao deletar categoria' });
        }
    }
}