import { Request, Response } from 'express';
import { AdminService } from '../service/AdminService';
import { catchAsync } from '../middleware/error/catchAsync';

export class AdminController {
    constructor(private adminService: AdminService) {}

    list = catchAsync(async (_req: Request, res: Response) => {
        const admins = await this.adminService.list();
        return res.status(200).json(admins);
    });

    getById = catchAsync(async (req: Request, res: Response) => {
        const admin = await this.adminService.getById(Number(req.params.adminId));
        return res.status(200).json(admin);
    });

    create = catchAsync(async (req: Request, res: Response) => {
        const admin = await this.adminService.create(req.body);
        return res.status(201).json(admin);
    });

    update = catchAsync(async (req: Request, res: Response) => {
        const requesterId = Number((req as any).usuario?.id);
        const admin = await this.adminService.update(requesterId, Number(req.params.adminId), req.body);
        return res.status(200).json(admin);
    });

    delete = catchAsync(async (req: Request, res: Response) => {
        const requesterId = Number((req as any).usuario?.id);
        await this.adminService.delete(requesterId, Number(req.params.adminId));
        return res.sendStatus(204);
    });

    getMasterId = catchAsync(async (_req: Request, res: Response) => {
        const masterId = await this.adminService.getMasterId();
        return res.status(200).json({ masterId });
    });
}
