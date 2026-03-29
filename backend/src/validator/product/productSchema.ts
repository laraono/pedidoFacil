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
    productVarations: z.object({
        name: z.string().min(1).max(20),
        addPrice: z.coerce.number().positive(),
        status: z.enum(ProductStatus)
    }).array()
    
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
            req.body = createProductSchema.parse({...req.body, establishmentId: req.usuario.estabelecimento})

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
            req.query = listProductsSchema.parse(req.usuario)

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
            req.query = listProductsByCategorySchema.parse({...req.query, ...req.usuario})

            next()
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).send(error.message);
            }
            return res.status(500).send("Internal Server Error");
        }
    };