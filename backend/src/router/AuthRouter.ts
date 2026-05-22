import { Router, Request, Response } from 'express';
import { AuthController, authLimiter } from '../controller/AuthController';
import { AuthService } from '../service/AuthService';
import { AppDataSource } from '../database/data-source';
import { UserRepository, RefreshTokenRepository } from '../repository';
import { validateLogin, validateRegister } from '../validator';
import { catchAsync } from '../middleware/error/catchAsync';
import { authenticate } from '../middleware/authenticate';

const userRepository = new UserRepository(AppDataSource);
const refreshTokenRepository = new RefreshTokenRepository(AppDataSource);
const authService = new AuthService(
  AppDataSource,
  userRepository,
  refreshTokenRepository,
);
const authController = new AuthController(authService);

const authRouter = Router();

authRouter.post('/register', authLimiter, validateRegister, catchAsync((req: Request, res: Response) => authController.registerManager(req, res)));
authRouter.post('/login', authLimiter, validateLogin, catchAsync((req: Request, res: Response) => authController.login(req, res)));
authRouter.post('/logout', authenticate, catchAsync((req: Request, res: Response) => authController.logout(req, res)));
authRouter.post('/refresh', catchAsync((req: Request, res: Response) => authController.refresh(req, res)));
authRouter.get(
  '/me',
  authenticate,
  catchAsync((req: Request, res: Response) => authController.perfil(req, res)),
);
authRouter.post(
  '/forgot-password',
  catchAsync((req: Request, res: Response) =>
    authController.forgotPassword(req, res),
  ),
);
authRouter.post(
  '/reset-password',
  catchAsync((req: Request, res: Response) =>
    authController.resetPassword(req, res),
  ),
);

export { authRouter };
