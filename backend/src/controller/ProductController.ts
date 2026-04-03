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

    async listProducts(req, res: Response) {
        const products = await this.productService.listProducts(req.body)

        res.status(200).send(products)
    }

    async listProductsByCategory(req, res: Response) {
        const {categoryId, establishmentId} = req.body

        const products = await this.productService.listProductsByCategory(categoryId, establishmentId)

        res.status(200).send(products)
    }

    async listActiveProductsByCategory(req, res: Response) {
        const {categoryId, establishmentId} = req.body

        const products = await this.productService.listActiveProductsByCategory(categoryId, establishmentId)

        res.status(200).send(products)
    }

    async updateProduct(req, res: Response) {
        const {productId} = req.params
        await this.productService.updateProduct(productId, req.body)

        res.sendStatus(204)
    }

    async deleteProduct(req, res: Response) {
        await this.productService.deleteProduct(req.params)

        res.sendStatus(204)
    }
     
}