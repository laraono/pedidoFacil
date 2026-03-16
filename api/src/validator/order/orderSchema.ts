import { z } from 'zod';
import express, { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { OrderStatus } from '../../enum';


const app = express();
app.use(express.json());

export const createOrderchema = z.object({
    
    params: z.object({
        comandaId: z.coerce.number().int().positive()
    }),
    body: z.object({
        status: z.enum(OrderStatus),
        itens: z.object({
            productId: z.coerce.number().int().positive(),
            quantity: z.coerce.number().int().positive(),
            sizeId: z.coerce.number().int().positive(),
            addonId: z.coerce.number().int().positive().optional(),
            observation: z.string().optional()
        }).array()
    })
    
});


export const validateCreateOrder = 
    (req: Request<{comandaId: number}>, res: Response, next: NextFunction) => {
        try {
            const {params, body} = createOrderchema.parse({params: req.params, body: req.body})

            req.params = params
            req.body = body

            next();
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).send(error.message);
            }
            return res.status(500).send("Internal Server Error");
        }
    };


