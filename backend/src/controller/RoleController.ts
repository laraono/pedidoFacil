import { Request, Response } from 'express';
import { RoleService } from '../service/RoleService';
import { catchAsync } from '../middleware/error/catchAsync';

export class RoleController {
    constructor(private roleService: RoleService) {}

    list = catchAsync(async (req: Request, res: Response) => {
        const establishmentId = (req as any).usuario.estabelecimento;
        const roles = await this.roleService.listRoles(establishmentId);
        return res.json(roles);
    });

    create = catchAsync(async (req: Request, res: Response) => {
        const establishmentId = (req as any).usuario.estabelecimento;
        const role = await this.roleService.createRole(establishmentId, req.body);
        return res.status(201).json(role);
    });

    update = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        const establishmentId = (req as any).usuario.estabelecimento;
        const updated = await this.roleService.updateRole(Number(id), establishmentId, req.body);
        return res.json(updated);
    });

    delete = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        const establishmentId = (req as any).usuario.estabelecimento;
        await this.roleService.deleteRole(Number(id), establishmentId);
        return res.status(204).send();
    });
}