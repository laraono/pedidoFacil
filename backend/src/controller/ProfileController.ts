import { Request, Response, NextFunction } from 'express';
import { ProfileService } from '../service/ProfileService';

const profileService = new ProfileService();

export class ProfileController {
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).usuario.id;
      const profile = await profileService.getProfile(userId);
      return res.json(profile);
    } catch (error) { next(error); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).usuario.id;
      const updatedProfile = await profileService.updateProfile(userId, req.body);
      return res.json(updatedProfile);
    } catch (error) { next(error); }
  }

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).usuario.id;
      const result = await profileService.changePassword(userId, req.body);
      return res.json(result);
    } catch (error) { next(error); }
  }
}