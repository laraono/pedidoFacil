import { AppDataSource, Comanda, Order } from '../database';
import { Request, Response, NextFunction } from 'express';

const entityMap = {
    COMANDA: Comanda,
    PEDIDO: Order,
} as const;

export function verifyTenancy(tabela: string, paramId: string) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const establishmentId = (req as any).usuario.estabelecimento;
            const recursoId = req.params[paramId];

            const entity = entityMap[tabela as keyof typeof entityMap];

            const repo = AppDataSource.getRepository(entity);
            const resource = await repo.findOne({
                where: { id: Number(recursoId) },
                relations: { establishment: true },
            });

            if (!resource) {
                return res.status(404).json({ error: 'Recurso não encontrado.' });
            }

            if (resource.establishment.id !== establishmentId) {
                return res.status(403).json({ error: 'Acesso negado.' });
            }

            next();
        } catch (err) {
            next(err);
        }
    };
}
