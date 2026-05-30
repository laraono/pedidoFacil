import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { loginSchema } from '../../dto/auth/LoginDTO';
import { registerCompleteSchema } from '../../dto/auth/RegisterCompleteDTO';

export const validateLogin =
    (req: Request, res: Response, next: NextFunction) => {
        try {
            req.body = loginSchema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({ error: error.issues[0].message });
            }
            return res.status(500).send('Internal Server Error');
        }
    };

export const validateRegisterComplete =
    (req: Request, res: Response, next: NextFunction) => {
        try {
            req.body = registerCompleteSchema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({ error: error.issues[0].message });
            }
            return res.status(500).send('Internal Server Error');
        }
    };