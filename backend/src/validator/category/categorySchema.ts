import { z } from 'zod';
import express, { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';


const app = express();
app.use(express.json());

export const createCategorySchema = z.object({
    name: z.string().min(1).max(20)
});


export const validateCreateCategory = 
    (req: Request, res: Response, next: NextFunction) => {
        try {
            const name = createCategorySchema.parse(req.body)

            req.body = name
            
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).send(error.message);
            }
            return res.status(500).send("Internal Server Error");
        }
    };


