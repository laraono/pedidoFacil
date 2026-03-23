const express = require('express');
const router = express.Router();
const authController = require('../controller/AAuthController');
const authenticate = require('../middleware/authenticate');

export const authRouter = express.Router();

authRouter.post('/register', authController.register);
authRouter.post('/login', authController.loginLimiter, authController.login);
authRouter.post('/logout', authenticate, authController.logout);
authRouter.post('/refresh', authController.refresh);
authRouter.get('/me', authenticate, authController.perfil)
