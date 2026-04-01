import { ProductService } from "../service";
import {Request, Response} from 'express';

export class ProductController {

    private productService: ProductService

    constructor(productService: ProductService) {
        this.productService = productService
    }

    async createProduct(req: Request, res: Response) {
        const productId = await this.productService.createProduct(req.body)

        res.status(201).send(productId)
    }

    async listProducts(req: Request, res: Response) {
        const products = await this.productService.listProducts()

        res.status(200).send(products)
    }

    async listProductsByCategory(req: Request, res: Response) {
        const { id } = req.params; 
        const categoryId = Number(id);
        const products = await this.productService.listProductsByCategory(categoryId);

        res.status(200).send(products);
    }
    
}