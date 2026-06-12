import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../database';
import { Establishment } from '../database/entity/Establishment';

export const totemAccess = async (req: Request, res: Response, next: NextFunction) => {
    const rawCode = req.headers['x-totem-code'] as string;

    if (!rawCode) {
        return res.status(401).json({ error: "Acesso negado. Código do totem não fornecido." });
    }

    const totemCode = rawCode.trim().toUpperCase();

    try {
        const establishmentRepo = AppDataSource.getRepository(Establishment);
        const establishment = await establishmentRepo.findOne({
            where: { selfServiceCode: totemCode }
        });
        
        if (!establishment) {
            return res.status(401).json({ error: "Código do totem inválido." });
        }

        if (!establishment.temAutoatendimento || !establishment.selfServiceCode) {
            return res.status(403).json({ error: "Autoatendimento desativado neste estabelecimento." });
        }

        (req as any).usuario = {
            id: 0, 
            estabelecimento: establishment.id,
            role: 'TOTEM'
        };
        
        return next();
    } catch (error) {
        return res.status(500).json({ error: "Erro ao validar credenciais do totem." });
    }
};