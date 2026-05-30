import { Router, Request, Response } from 'express';
import { AuthController, authLimiter } from '../controller/AuthController';
import { AuthService } from '../service/AuthService';
import { MercadoPagoService } from '../service/MercadoPagoService';
import { AppDataSource } from '../database/data-source';
import { UserRepository, RefreshTokenRepository, EstablishmentRepository } from '../repository';
import { validateLogin, validateRegisterComplete } from '../validator';
import { catchAsync } from '../middleware/error/catchAsync';
import { authenticate } from '../middleware/authenticate';

const userRepository = new UserRepository(AppDataSource);
const refreshTokenRepository = new RefreshTokenRepository(AppDataSource);
const establishmentRepository = new EstablishmentRepository(AppDataSource);
const mercadoPagoService = new MercadoPagoService();
const authService = new AuthService(
  AppDataSource,
  userRepository,
  refreshTokenRepository,
  establishmentRepository,
  mercadoPagoService,
);
const authController = new AuthController(authService);

const authRouter = Router();

authRouter.post('/check-email', authLimiter, catchAsync((req: Request, res: Response) => authController.checkEmail(req, res)));
authRouter.post('/check-cpf', authLimiter, catchAsync((req: Request, res: Response) => authController.checkCpf(req, res)));
authRouter.post('/register-complete', authLimiter, validateRegisterComplete, catchAsync((req: Request, res: Response) => authController.registerComplete(req, res)));
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
  authLimiter,
  catchAsync((req: Request, res: Response) =>
    authController.forgotPassword(req, res),
  ),
);
authRouter.post(
  '/reset-password',
  authLimiter,
  catchAsync((req: Request, res: Response) =>
    authController.resetPassword(req, res),
  ),
);

export { authRouter };
