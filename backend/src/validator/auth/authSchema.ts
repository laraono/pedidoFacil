import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

function validarCNPJ(cnpj: string): boolean {
    const c = cnpj.replace(/[^\d]/g, '')
    if (c.length !== 14 || /^(\d)\1{13}$/.test(c)) return false
    let sum = 0, pos = 5
    for (let i = 0; i < 12; i++) { sum += parseInt(c[i]) * pos--; if (pos < 2) pos = 9 }
    let r = sum % 11 < 2 ? 0 : 11 - (sum % 11)
    if (r !== parseInt(c[12])) return false
    sum = 0; pos = 6
    for (let i = 0; i < 13; i++) { sum += parseInt(c[i]) * pos--; if (pos < 2) pos = 9 }
    r = sum % 11 < 2 ? 0 : 11 - (sum % 11)
    return r === parseInt(c[13])
}

export const loginSchema = z.object({
    email: z.string().email('E-mail inválido.'),
    senha: z.string().min(1, 'Senha é obrigatória.'),
});

export const registerSchema = z.object({
    nome_usuario: z.string().min(1, 'Nome do usuário é obrigatório.'),
    email: z.string().email('E-mail inválido.'),
    senha: z.string()
        .min(8, 'A senha deve ter pelo menos 8 caracteres.')
        .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula.')
        .regex(/[0-9]/, 'A senha deve conter pelo menos um número.')
        .regex(/[^A-Za-z0-9]/, 'A senha deve conter pelo menos um caractere especial.'),
    cpf: z.string().optional(), 
    nome_estabelecimento: z.string().optional(), 
    cnpj: z.string().optional(), 
    cargos: z.array(z.object({
        nome: z.string().min(1),
        permissoes: z.array(z.string()),
    })).optional(),
});

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

export const validateRegister =
    (req: Request, res: Response, next: NextFunction) => {
        try {
            req.body = registerSchema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({ error: error.issues[0].message });
            }
            return res.status(500).send('Internal Server Error');
        }
    };
