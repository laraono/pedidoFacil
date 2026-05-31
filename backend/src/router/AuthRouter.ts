import { Router, Request, Response } from 'express';
import { AuthController, authLimiter } from '../controller/AuthController';
import { AuthService } from '../service/AuthService';
import { AppDataSource } from '../database/data-source';
import { UserRepository, RefreshTokenRepository } from '../repository';
import { catchAsync } from '../middleware/error/catchAsync';
import { authenticate } from '../middleware/authenticate';
import { validateRequest } from '../middleware/validateRequest';
import { loginSchema } from '../dto/auth/LoginDTO';
import { registerSchema } from '../dto/auth/RegisterDTO';

const userRepository = new UserRepository(AppDataSource);
const refreshTokenRepository = new RefreshTokenRepository(AppDataSource);
const authService = new AuthService(
  AppDataSource,
  userRepository,
  refreshTokenRepository,
);
const authController = new AuthController(authService);

const authRouter = Router();

authRouter.post(
  '/register',
  authLimiter,
  validateRequest(registerSchema),
  catchAsync((req: Request, res: Response) =>
    authController.registerManager(req, res),
  ),
);

authRouter.post(
  '/login',
  authLimiter,
  validateRequest(loginSchema),
  catchAsync((req: Request, res: Response) => authController.login(req, res)),
);

authRouter.post(
  '/logout',
  authenticate,
  catchAsync((req: Request, res: Response) => authController.logout(req, res)),
);
authRouter.post(
  '/refresh',
  catchAsync((req: Request, res: Response) => authController.refresh(req, res)),
);

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
