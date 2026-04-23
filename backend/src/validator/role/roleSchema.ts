import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../../middleware/error/AppError';

export const roleSchema = z.object({
    name: z.string().min(1, "O nome do cargo é obrigatório.").max(50, "Nome muito longo."),
    permissions: z.array(z.string()).min(1, "Selecione ao menos uma permissão.")
});

export const validateRole = (req: Request, res: Response, next: NextFunction) => {
    try {
        req.body = roleSchema.parse(req.body);
        next();
    } catch (error) {
        if (error instanceof ZodError) {
            const firstError = error.issues[0]?.message || "Erro de validação.";
            return next(new AppError(firstError, 400));
        }
        return next(error);
    }
};