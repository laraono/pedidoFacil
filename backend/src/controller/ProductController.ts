import { ProductService } from '../service';
import { Request, Response } from 'express';
import { getIO } from '../socket'; 
import { ProductStatus } from '../enum';

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
            const products = await this.productService.listProducts(req.body.establishmentId, ProductStatus.ARQUIVADO);
            return res.status(200).json(products);
        } else {
            const products = await this.productService.listProducts(req.body.establishmentId, ProductStatus.ATIVO)

            return res.status(200).send(products)
        }
    }

    async listProductsByCategory(req: Request, res: Response) {
        const {categoryId, establishmentId} = req.body

        const products = await this.productService.listProductsByCategory(categoryId, establishmentId)

        res.status(200).send(products)
    }

    async listActiveProductsByCategory(req: Request, res: Response) {
        const {categoryId, establishmentId} = req.body

        const products = await this.productService.listActiveProductsByCategory(categoryId, establishmentId)

        res.status(200).send(products)
    }

    async updateProduct(req, res: Response) {
        const {productId} = req.params
        await this.productService.updateProduct(productId, {...req.body, image: req.file.buffer})

        res.sendStatus(204)
    }

    async updateProductStatus(req, res: Response) {
        const {productId} = req.params
        const {status} = req.body

        await this.productService.updateProductStatus(productId, status)

        res.sendStatus(204)
    }

    async deleteProduct(req, res: Response) {
        await this.productService.deleteProduct(req.params)

        res.sendStatus(204)
    }
     
}