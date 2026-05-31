import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export const createCouponSchema = z.object({
    code: z.string().min(1, "O código é obrigatório").max(50),
    type: z.enum(['Valor', 'Percentual']),
    value: z.coerce.number().positive("O valor deve ser maior que zero"),
    expirationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida").optional().nullable()
});

export const validateCreateCoupon = (req: Request, res: Response, next: NextFunction) => {
    try {
        req.body = createCouponSchema.parse(req.body);
        next();
    } catch (error) {
        if (error instanceof ZodError) {
            const firstError = error.issues[0]?.message || "Erro de validação nos campos.";
            return res.status(400).json({ error: firstError });
        }
        return res.status(500).json({ error: "Erro interno no servidor." });
    }
};