import { Router } from 'express';
import { AuthController, authLimiter } from '../controller/AuthController';
import { AuthService } from '../service/AuthService';
import { AppDataSource } from '../database/data-source';
import { UserRepository } from '../repository/UserRepository';
import authenticate from '../middleware/authenticate';

const userRepository = new UserRepository(AppDataSource);
const authService = new AuthService(AppDataSource, userRepository);
const authController = new AuthController(authService);

const authRouter = Router();

authRouter.post('/register', authLimiter, authController.registerManager.bind(authController));
authRouter.post('/login', authLimiter, authController.login.bind(authController));
authRouter.post('/refresh', authController.refresh.bind(authController));
authRouter.post('/logout', authController.logout.bind(authController));
authRouter.get('/perfil', authenticate, authController.perfil.bind(authController));

export { authRouter };