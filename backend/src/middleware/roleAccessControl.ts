import { Request, Response, NextFunction } from 'express'
import { roleRepository } from '../repository'

export function checkPermission(...permissoes: string[]) {
    return async (req: Request, res: Response, next: NextFunction) => {
        if ((req as any).usuario.isAdmin) return next()

        const cargoId = (req as any).usuario.cargo

        const role = await roleRepository.getRoleById(cargoId)

        if (!role) {
            return res.status(404).json({ error: 'Recurso não encontrado.' })
        }

        let lista: string[] = [];
        try {
            const rawPerms = role.permissions || (role as any).Permissoes_JSON;
            lista = Array.isArray(rawPerms) ? rawPerms : JSON.parse(rawPerms as string ?? '[]');
        } catch (e) {
            lista = [];
        }

        const commonItems = lista.filter(item => permissoes.includes(item) || item === 'ALL');

        if (commonItems.length === 0) {
            return res.status(403).json({ error: 'Acesso negado.' })
        }

        next()
    }
}