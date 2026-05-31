import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../../middleware/error/AppError';
import { strongPasswordSchema } from '../../utils/passwordSchema';

export const updateProfileSchema = z.object({
    name: z.string().min(3, "Nome muito curto.").optional(),
    email: z.string().email("E-mail inválido.").optional(),
    cpf: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    state: z.string().max(2, "O estado deve ter 2 letras (Ex: SP).").optional().nullable(),
    zip: z.string().optional().nullable()
});

export const changePasswordSchema = z.object({
    oldPassword: z.string().min(1, "A senha atual é obrigatória."),
    newPassword: strongPasswordSchema
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

export const validateUpdateProfile = handleValidation(updateProfileSchema);
export const validateChangePassword = handleValidation(changePasswordSchema);