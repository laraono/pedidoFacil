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
const authController = new AuthController(authService);

const authRouter = Router();

authRouter.post('/register', validateRequest(registerSchema), authController.registerManager.bind(authController));
authRouter.post('/login', loginLimiter, validateRequest(loginSchema), authController.login.bind(authController));

authRouter.post('/refresh', authController.refresh.bind(authController));
authRouter.post('/logout', authController.logout.bind(authController));

authRouter.get('/perfil', authenticate, authController.perfil.bind(authController));

export { authRouter };