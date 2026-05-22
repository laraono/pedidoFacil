import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ProductStatus } from '../../enum';

export const createProductSchema = z.object({
    product: z.object({
        name: z.string().min(1).max(100),
        description: z.string().nullable().optional(), 
        image: z.string().nullable().optional(),
        estocavel: z.coerce.boolean(),
        categoryId: z.coerce.number().int().positive(),
        basePrice: z.coerce.number().min(0),
        status: z.nativeEnum(ProductStatus).or(z.string())
    }),
    productVariations: z.object({
        name: z.string().min(1).max(50),
        addPrice: z.coerce.number().min(0),
        status: z.nativeEnum(ProductStatus).or(z.string())
    }).array().optional()
});

export const validateCreateProduct = 
    (req: Request, res: Response, next: NextFunction) => {
        try {
            req.body = createProductSchema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    message: "Erro de validação nos dados do produto",
                    details: error.issues.map(issue => ({
                        path: issue.path.join('.'),
                        message: issue.message
                    }))
                });
            }
            return res.status(500).send("Internal Server Error");
        }
    };