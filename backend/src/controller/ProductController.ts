import { ProductService } from '../service';
import { Request, Response } from 'express';
import { getIO } from '../socket';
import path from 'path';
import {
    ensureBucketExists,
    generateUniqueImageKey,
    uploadToS3,
    getImageContentType
} from "../service/S3Service";
import { sendError } from '../middleware/error/sendError';

export class ProductController {
  private productService: ProductService;

  constructor(productService: ProductService) {
    this.productService = productService;
  }

  async createProduct(req: Request, res: Response) {
    try {
      const productDTO = req.body;

      productDTO.product.establishment = {
          id: (req as any).usuario.estabelecimento,
      };

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

          productDTO.product.image = uploadResult.Location;
      } else {
          productDTO.product.image = null;
      }

      productDTO.product.estocavel = false;

      const productId = await this.productService.createProduct(productDTO);

      getIO().emit('menu_updated');
      res.status(201).json(productId);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Erro ao criar produto' });
    }
  }

  async listProducts(req: Request, res: Response) {
    try {
      const estabelecimentoId = (req as any).usuario.estabelecimento;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      if (req.query.deleted === 'true') {
        const result = await this.productService.listDeletedProducts(estabelecimentoId, page, limit);
        return res.status(200).json(result);
      }

      const status = req.query.status as string | undefined;
      const search = req.query.search as string | undefined;
      const result = await this.productService.listProducts(estabelecimentoId, page, limit, status, search);
      return res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Erro ao listar produtos' });
    }
  }

  async listProductsByCategory(req: Request, res: Response) {
    try {
      const categoryId = Number(req.params.categoryId || req.params.id);
      const estabelecimentoId = (req as any).usuario.estabelecimento;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await this.productService.listProductsByCategory(categoryId, estabelecimentoId, page, limit);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Erro ao listar produtos por categoria' });
    }
  }

  async updateProduct(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      let productData = { ...req.body };

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

          productData.image = uploadResult.Location;
      }

      await this.productService.updateProduct(id, productData);

      getIO().emit('menu_updated');
      res.status(200).json({ message: 'Produto updated com sucesso' });
    } catch (error: any) {
      sendError(res, error, 'Erro ao atualizar produto');
    }
  }

  async deleteProduct(req: Request, res: Response) {
    try {
      await this.productService.softDeleteProduct(Number(req.params.id));
      getIO().emit('menu_updated');
      res.sendStatus(204);
    } catch (error: any) {
      sendError(res, error, 'Erro ao deletar produto');
    }
  }

  async restoreProduct(req: Request, res: Response) {
    try {
      await this.productService.restoreProduct(Number(req.params.id));
      getIO().emit('menu_updated');
      res.sendStatus(204);
    } catch (error: any) {
      sendError(res, error, 'Erro ao restaurar produto');
    }
  }
}