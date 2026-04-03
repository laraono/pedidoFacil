import { z } from 'zod';
import express, { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ProductStatus } from '../../enum';

const createProductSchema = z.object({
    product: z.object({
        name: z.string().min(1).max(20),
        description: z.string().optional(), 
        isAvailable: z.coerce.boolean(),
        estocavel: z.coerce.boolean(),
        categoryId: z.coerce.number().int().positive(),
        establishmentId: z.coerce.number().int().positive(),
        basePrice: z.coerce.number().positive(),
        status: z.enum(ProductStatus)
    }),
    productVariations: z.object({
        name: z.string().min(1).max(20),
        addPrice: z.coerce.number().positive(),
    }).array().optional()
    
});

const listProductsSchema = z.object({
    establishmentId: z.coerce.number().int().positive()
})

const listProductsByCategorySchema = z.object({
    categoryId: z.coerce.number().int().positive(),
    establishmentId: z.coerce.number().int().positive()
})

export const validateCreateProduct = 
    (req, res: Response, next: NextFunction) => {
        try {
            const product = {...req.body.product, establishmentId: req.usuario.estabelecimento}
            console.log(req.body.productVariations)
            req.body = createProductSchema.parse({product, productVariations: req.body.productVariations})

            console.log('post parse', req.body)

            next()
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).send(error.message);
            }
            return res.status(500).send("Internal Server Error");
        }
    };

export const validateListProducts = 
    (req, res: Response, next: NextFunction) => {
        try {
            req.body = listProductsSchema.parse({establishmentId: req.usuario.estabelecimento})

            next()
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).send(error.message);
            }
            return res.status(500).send("Internal Server Error");
        }
    };

export const validateListProductsByCategories = 
    (req, res: Response, next: NextFunction) => {
        try {
            const params = {categoryId: req.params.categoryId, establishmentId: req.usuario.estabelecimento }
            req.body = listProductsByCategorySchema.parse(params)

            next()
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).send(error.message);
            }
            return res.status(500).send("Internal Server Error");
        }
    };