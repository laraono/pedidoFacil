import { Request, Response } from 'express';
import { MenuService } from '../service/MenuService';
import rateLimit from 'express-rate-limit'

export const menuLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
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
                message: "Identificação do estabelecimento não fornecida. Passe via Token ou ?establishmentId=1 na URL." 
            });
        }

        const editMode = req.query.editMode === 'true';

        try {
            const menu = await this.menuService.getFullMenu(Number(establishmentId), editMode);
            return res.status(200).json(menu);
        } catch (error) {
            console.error("Erro no MenuService:", error);
            return res.status(500).json({ message: "Erro interno ao buscar o cardápio." });
        }
    }
}