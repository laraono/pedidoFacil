import { Request, Response } from 'express';
import { ProfileService } from '../service/ProfileService';
import { catchAsync } from '../middleware/error/catchAsync';
import { auditLog } from '../utils/logger';

export class ProfileController {
  
  constructor(private profileService: ProfileService) {}

  get = catchAsync(async (req: Request, res: Response) => {
    const userId = (req as any).usuario.id;
    const profile = await this.profileService.getProfile(userId);
    return res.json(profile);
  });

  update = catchAsync(async (req: Request, res: Response) => {
    const userId = (req as any).usuario.id;
    const updatedProfile = await this.profileService.updateProfile(userId, req.body);
    return res.json(updatedProfile);
  });

  changePassword = catchAsync(async (req: Request, res: Response) => {
    const userId = (req as any).usuario.id;
    const result = await this.profileService.changePassword(userId, req.body);
    auditLog('password.changed', { userId });
    return res.json(result);
  });
}