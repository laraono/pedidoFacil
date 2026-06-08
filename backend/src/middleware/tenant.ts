import { AppDataSource, Comanda } from '../database';
import { Category } from '../database/entity/Category';
import { Request, Response, NextFunction } from 'express';

export function verifyComandaTenancy(paramId: string) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const establishmentId = (req as any).usuario.estabelecimento;
            const comanda = await AppDataSource.getRepository(Comanda).findOne({
                where: { id: Number(req.params[paramId]) },
                relations: { establishment: true },
            });

            if (!comanda) return res.status(404).json({ error: 'Comanda não encontrada.' });
            if (comanda.establishment.id !== establishmentId) return res.status(403).json({ error: 'Acesso negado.' });

            next();
        } catch (err) {
            next(err);
        }
    };
}

export function verifyCategoryTenancy(paramId: string) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const establishmentId = (req as any).usuario.estabelecimento;
            const category = await AppDataSource.getRepository(Category).findOne({
                where: { id: Number(req.params[paramId]) },
                relations: { establishment: true },
            });

            if (!category) return res.status(404).json({ error: 'Categoria não encontrada.' });
            if (category.establishment.id !== establishmentId) return res.status(403).json({ error: 'Acesso negado.' });

            next();
        } catch (err) {
            next(err);
        }
    };
}
