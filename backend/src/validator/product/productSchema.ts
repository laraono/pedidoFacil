import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export const createProductSchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().nullable().optional(),
    price: z.coerce.number().min(0),
    categoryId: z.coerce.number().int().positive(),
    available: z.union([z.boolean(), z.string()]).optional(),
    sizes: z.string().optional() 
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
            return res.status(500).json({ error: "Erro interno no servidor." });
        }
    };

export const validateListProducts =
    (_req: Request, _res: Response, next: NextFunction) => next();

export const validateListProductsByCategories =
    (_req: Request, _res: Response, next: NextFunction) => next();

export const validateDeleteProduct =
    (_req: Request, _res: Response, next: NextFunction) => next();