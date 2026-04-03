// src/controller/MenuController.ts
import { Request, Response } from 'express';
import { MenuService } from '../service/MenuService';

export class MenuController {
    constructor(private menuService: MenuService) {}

    async getMenu(req: Request, res: Response) {
        const usuario = (req as any).usuario;

        if (!usuario || !usuario.estabelecimento) {
            return res.status(401).json({ 
                message: "Identificação do estabelecimento não encontrada no token de usuário." 
            });
        }

        const establishmentId = usuario.estabelecimento;
        const editMode = req.query.editMode === 'true';

        try {
            const menu = await this.menuService.getFullMenu(establishmentId, editMode);
            return res.status(200).json(menu);
        } catch (error) {
            console.error("Erro no MenuService:", error);
            return res.status(500).json({ message: "Erro interno ao buscar o cardápio." });
        }
    }
}