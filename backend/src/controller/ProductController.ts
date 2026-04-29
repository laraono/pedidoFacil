import { ProductService } from "../service";
import {Request, Response} from 'express';

export class ProductController {

    private productService: ProductService

    constructor(productService: ProductService) {
        this.productService = productService
    }

    async createProduct(req: Request, res: Response) {

        const image = req.file ? 
            req.file.buffer ? req.file.buffer : undefined
            : undefined
        
        const productId = await this.productService.createProduct({...req.body, image})

        res.status(201).send(productId)
    }

    async listProducts(req: Request, res: Response) {
        const { estabelecimento: establishmentId } = (req as any).usuario
        const products = await this.productService.listProducts({ establishmentId })

        res.status(200).send(products)
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