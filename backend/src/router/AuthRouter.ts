import express, { Request, Response } from 'express'
import { authController, loginLimiter } from '../controller'
import { catchAsync } from '../middleware'
import { validateLogin, validateRegister } from '../validator'
const authenticate = require('../middleware/authenticate')

export const authRouter = express.Router()

authRouter.post('/register', validateRegister, catchAsync((req: Request, res: Response) => authController.register(req, res)))
authRouter.post('/login', loginLimiter, validateLogin, catchAsync((req: Request, res: Response) => authController.login(req, res)))
authRouter.post('/logout', authenticate, catchAsync((req: Request, res: Response) => authController.logout(req, res)))
authRouter.post('/refresh', catchAsync((req: Request, res: Response) => authController.refresh(req, res)))
authRouter.get('/me', authenticate, catchAsync((req: Request, res: Response) => authController.perfil(req, res)))
