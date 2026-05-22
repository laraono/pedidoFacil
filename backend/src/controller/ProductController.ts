import { ProductService } from '../service';
import { Request, Response } from 'express';
import { getIO } from '../socket';
import { deleteFile } from '../utils/fileHelper';

export class ProductController {
  private productService: ProductService;

  constructor(productService: ProductService) {
    this.productService = productService;
  }

  async createProduct(req: Request, res: Response) {
    const productDTO = req.body;

    productDTO.product.establishment = {
        id: (req as any).usuario.estabelecimento,
    };
    
    productDTO.product.image = req.file ? req.file.filename : null;
    productDTO.product.estocavel = false; 

    const productId = await this.productService.createProduct(productDTO);

    getIO().emit('menu_updated');
    res.status(201).json(productId);
  }

  async listProducts(req: Request, res: Response) {
    const estabelecimentoId = (req as any).usuario.estabelecimento;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (req.query.deleted === 'true') {
      const result = await this.productService.listDeletedProducts(estabelecimentoId, page, limit);
      return res.status(200).json(result);
    }

    const result = await this.productService.listProducts(estabelecimentoId, page, limit);
    return res.status(200).json(result);
  }

  async listProductsByCategory(req: Request, res: Response) {
    const categoryId = Number(req.params.categoryId || req.params.id);
    const estabelecimentoId = (req as any).usuario.estabelecimento;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const result = await this.productService.listProductsByCategory(categoryId, estabelecimentoId, page, limit);
    res.status(200).json(result);
  }

  async updateProduct(req: Request, res: Response) {
    const id = Number(req.params.id);
    
    let productData = { ...req.body };

    if (req.file) {
      const oldProduct = await this.productService.getProduct(id);
      if (oldProduct && oldProduct.image) {
        deleteFile(oldProduct.image);
      }
      productData.image = req.file.filename;
    }

    await this.productService.updateProduct(id, productData);

    getIO().emit('menu_updated');
    res.status(200).json({ message: 'Produto atualizado com sucesso' });
  }

  async deleteProduct(req: Request, res: Response) {
    await this.productService.softDeleteProduct(Number(req.params.id));
    getIO().emit('menu_updated');
    res.sendStatus(204);
  }

  async restoreProduct(req: Request, res: Response) {
    await this.productService.restoreProduct(Number(req.params.id));
    getIO().emit('menu_updated');
    res.sendStatus(204);
  }
}