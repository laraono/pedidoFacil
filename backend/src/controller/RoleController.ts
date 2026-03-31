import { Request, Response, NextFunction } from 'express';
import { RoleService } from '../service/RoleService';

const roleService = new RoleService();

export class RoleController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const establishmentId = (req as any).usuario.estabelecimento;
      const roles = await roleService.listRoles(establishmentId);
      return res.json(roles);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const establishmentId = (req as any).usuario.estabelecimento;
      const role = await roleService.createRole(establishmentId, req.body);
      return res.status(201).json(role);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const establishmentId = (req as any).usuario.estabelecimento;
      const updated = await roleService.updateRole(Number(id), establishmentId, req.body);
      return res.json(updated);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const establishmentId = (req as any).usuario.estabelecimento;
      await roleService.deleteRole(Number(id), establishmentId);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}