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


export const validateCreateComanda = 
    (req: Request, res: Response, next: NextFunction) => {
        try {
            req.body = createComandaSchema.parse(req.body)

            next();
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).send(error.message);
            }
            return res.status(500).send("Internal Server Error");
        }
    };


