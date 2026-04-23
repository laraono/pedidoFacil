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
    let productData = req.body.product || req.body;

    productData.establishment = {
      id: (req as any).usuario.estabelecimento,
    };

    if (req.file) {
      productData.imagem = req.file.filename;
    }

    const productId = await this.productService.createProduct(productData);

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
    const products = await this.productService.listProductsByCategory(categoryId);

    res.status(200).json(products);
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