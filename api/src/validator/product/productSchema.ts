import { z } from 'zod';
import express, { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';


const app = express();
app.use(express.json());

export const createProductSchema = z.object({
    product: z.object({
        name: z.string().min(1).max(20),
        description: z.string().optional(), 
        isAvailable: z.coerce.boolean(),
        categoryId: z.coerce.number().int().positive()
    }),
    addons: z.object({
        name: z.string().min(1).max(20),
        price: z.coerce.number().positive()
    }).array().optional(),
    sizes: z.object({
        name: z.string().min(1).max(20),
        price: z.coerce.number().positive()
    }).array()
    
});


export const validateCreateProduct = 
    (req: Request, res: Response, next: NextFunction) => {
        try {
            req.body = createProductSchema.parse(req.body)

            next();
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).send(error.message);
            }
            return res.status(500).send("Internal Server Error");
        }
    };


