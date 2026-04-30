<<<<<<< HEAD
import { Router } from 'express';
import { AuthController, loginLimiter } from '../controller/AuthController';
import { AuthService } from '../service/AuthService';
import { AppDataSource } from '../database/data-source';
import { UserRepository } from '../repository/UserRepository';
import authenticate from '../middleware/authenticate';

import { validateRequest } from '../middleware/validateRequest';
import { loginSchema } from '../dto/auth/LoginDTO'
import { registerSchema } from '../dto/auth/RegisterDTO'


const userRepository = new UserRepository(AppDataSource);
const authService = new AuthService(AppDataSource, userRepository);
=======
import { Router, Request, Response } from 'express';
import { AuthController, loginLimiter } from '../controller/AuthController';
import { AuthService } from '../service/AuthService';
import { AppDataSource } from '../database/data-source';
import { UserRepository, RefreshTokenRepository } from '../repository';
import { validateLogin, validateRegister } from '../validator';
import { catchAsync } from '../middleware/error/catchAsync';
import authenticate from '../middleware/authenticate';

const userRepository = new UserRepository(AppDataSource);
const refreshTokenRepository = new RefreshTokenRepository(AppDataSource);
const authService = new AuthService(AppDataSource, userRepository, refreshTokenRepository);
>>>>>>> feature-104
const authController = new AuthController(authService);

const authRouter = Router();

<<<<<<< HEAD
authRouter.post('/register', validateRequest(registerSchema), authController.registerManager.bind(authController));
authRouter.post('/login', loginLimiter, validateRequest(loginSchema), authController.login.bind(authController));

authRouter.post('/refresh', authController.refresh.bind(authController));
authRouter.post('/logout', authController.logout.bind(authController));

authRouter.get('/perfil', authenticate, authController.perfil.bind(authController));
=======
authRouter.post('/register', validateRegister, catchAsync((req: Request, res: Response) => authController.registerManager(req, res)));
authRouter.post('/login', loginLimiter, validateLogin, catchAsync((req: Request, res: Response) => authController.login(req, res)));
authRouter.post('/logout', authenticate, catchAsync((req: Request, res: Response) => authController.logout(req, res)));
authRouter.post('/refresh', catchAsync((req: Request, res: Response) => authController.refresh(req, res)));
authRouter.get('/me', authenticate, catchAsync((req: Request, res: Response) => authController.perfil(req, res)));
>>>>>>> feature-104

export { authRouter };