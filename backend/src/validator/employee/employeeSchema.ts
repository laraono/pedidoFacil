import { z } from 'zod';
import { strongPasswordSchema } from '../../utils/passwordSchema';
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../../middleware/error/AppError';

export const createEmployeeSchema = z.object({
    name: z.string().min(5, "Nome deve ter ao menos 5 caracteres."),
    email: z.string().email("E-mail inválido."),
    cpf: z.string().optional().nullable(),
    password: strongPasswordSchema,
    roleId: z.number().int().positive("Selecione um cargo.")
});

export const updateEmployeeSchema = z.object({
    name: z.string().min(5, "Nome deve ter ao menos 5 caracteres.").optional(),
    email: z.string().email("E-mail inválido.").optional(),
    cpf: z.string().optional().nullable(),
    password: strongPasswordSchema.optional(),
    roleId: z.number().int().positive("Selecione um cargo.").optional()
});

const handleValidation = (schema: z.ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            req.body = schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const firstError = error.issues[0]?.message || "Erro de validação.";
                return next(new AppError(firstError, 400));
            }
            return next(error);
        }
    };
};

export const validateCreateEmployee = handleValidation(createEmployeeSchema);
export const validateUpdateEmployee = handleValidation(updateEmployeeSchema);