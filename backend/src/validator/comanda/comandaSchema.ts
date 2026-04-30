import { z } from 'zod';
import express, { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';


const app = express();
app.use(express.json());

export const createComandaSchema = z.object({
    
    description: z.string().min(1).max(100),
    status: z.string().min(1).max(20), 
    total: z.coerce.number().int(),
    discountValue: z.coerce.number().positive().optional()
    
});

export const cancelComandaSchema = z.object({
    params: z.object({
        comandaId: z.coerce.number().int().positive()
    }),
    body: z.object({
        userId: z.coerce.number().int().positive(),
        reason: z.string().min(1)
    })
})


export const validateCreateComanda = 
    (req: Request, res: Response, next: NextFunction) => {
        try {
            req.body = createComandaSchema.parse(req.body)

<<<<<<< HEAD
            next();
=======
>>>>>>> feature-104
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).send(error.message);
            }
            return res.status(500).send("Internal Server Error");
        }
    };


export const validateCancelComanda = 
    (req: Request, res: Response, next: NextFunction) => {
        try {
            const validation =  cancelComandaSchema.parse({ params: req.params, body: req.body })

            req.params = validation.params as any;
            req.body = validation.body

<<<<<<< HEAD
            next();
=======
>>>>>>> feature-104
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).send(error.message);
            }
            return res.status(500).send("Internal Server Error");
        }
    };