import { ProductService } from '../service';
import { Request, Response } from 'express';
import { getIO } from '../socket'; 

export class ProductController {
  private productService: ProductService;

  constructor(productService: ProductService) {
    this.productService = productService;
  }

  async createProduct(req: Request, res: Response) {
    if (req.body.product) {
      req.body.product.establishment = {
        id: (req as any).usuario.estabelecimento,
      };
    }

    const productId = await this.productService.createProduct(req.body);

    getIO().emit('menu_updated'); 
    res.status(201).json(productId);
  }

  async listProducts(req: Request, res: Response) {
    if (req.query.deleted === 'true') {
      const products = await this.productService.listDeletedProducts();
      return res.status(200).json(products);
    }

    const products = await this.productService.listProducts();
    return res.status(200).json(products);
  }

  async listProductsByCategory(req: Request, res: Response) {
    const categoryId = Number(req.params.categoryId || req.params.id);
    const products =
      await this.productService.listProductsByCategory(categoryId);

    res.status(200).json(products);
  }

  async updateProduct(req: Request, res: Response) {
    await this.productService.updateProduct(Number(req.params.id), req.body);

    getIO().emit('menu_updated'); 
    res.sendStatus(204);
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
