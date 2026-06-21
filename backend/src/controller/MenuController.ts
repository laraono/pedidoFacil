import { Request, Response } from 'express';
import { MenuService } from '../service/MenuService';
import rateLimit from 'express-rate-limit';
import { logger } from '../utils/logger';

export const menuLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 1000,
    handler: (req: Request, res: Response) => {
        res.status(429).json({
            error: 'Muitas tentativas. Tente novamente mais tarde.',
            retryAfter: Math.ceil(((req as any).rateLimit.resetTime - Date.now()) / 1000)
        })
    }
})

export class MenuController {
    constructor(private menuService: MenuService) {}

    async getMenu(req: Request, res: Response) {
        const usuario = (req as any).usuario;

        const establishmentId = usuario?.estabelecimento || req.query.establishmentId;

        if (!establishmentId) {
            return res.status(400).json({
                message: "Identificação do estabelecimento não fornecida."
            });
        }

        try {
            const menu = await this.menuService.getFullMenu(Number(establishmentId));
            return res.status(200).json(menu);
        } catch (error) {
            logger.error("Erro no MenuService:", error);
            return res.status(500).json({ message: "Erro interno ao buscar o cardápio." });
        }
    }
}