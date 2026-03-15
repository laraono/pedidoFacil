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
    
}