import { Request, Response, NextFunction } from 'express'
import { roleRepository } from '../repository'

export function checkPermission(...permissoes: string[]) {
    return async (req: Request, res: Response, next: NextFunction) => {
        const cargoId = (req as any).usuario.cargo

        const role = await roleRepository.getRoleById(cargoId)

        if (!role) {
            return res.status(404).json({ error: 'Recurso não encontrado.' })
        }

        const lista: string[] = Array.isArray(role.permissions)
            ? role.permissions as unknown as string[]
            : JSON.parse(role.permissions as string ?? '[]')
          
        const commonItems = lista.filter(item => permissoes.includes(item) || item === 'ALL');

        if (commonItems.length === 0) {
            return res.status(403).json({ error: 'Acesso negado.' })
        }

        next()
    }
}
