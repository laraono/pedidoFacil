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
        const admin = await this.adminService.update(Number(req.params.adminId), req.body);
        return res.status(200).json(admin);
    });

    delete = catchAsync(async (req: Request, res: Response) => {
        await this.adminService.delete(Number(req.params.adminId));
        return res.sendStatus(204);
    });
}
