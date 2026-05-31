import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../../middleware/error/AppError';

export const updateEstablishmentSchema = z.object({
    name: z.string().optional(),
    cnpj: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    paymentMethods: z.any().optional(), 
    selfServiceEnabled: z.boolean().optional(),
    selfServiceCode: z.string().optional().nullable(),
    configurations: z.object({
        logo: z.string().nullable().optional(),
        backgroundColor: z.string().optional(),
        cardsColor: z.string().optional(),
        buttonsColor: z.string().optional(),
        comandaLabel: z.string().optional()
    }).optional()
});

// Middleware Genérico usando o seu AppError
const handleValidation = (schema: z.ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            req.body = schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const firstError = error.issues[0]?.message || "Erro de validação nos campos.";
                // Passa o erro para o SEU errorHandler
                return next(new AppError(firstError, 400));
            }
            return next(error);
        }
    };
};

export const validateUpdateEstablishment = handleValidation(updateEstablishmentSchema);