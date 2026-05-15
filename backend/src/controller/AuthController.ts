import { Request, Response } from 'express'
import rateLimit from 'express-rate-limit'
import { AuthService } from '../service'
import { RefreshToken } from '../database'

export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    handler: (req: Request, res: Response) => {
        res.status(429).json({
            error: 'Muitas tentativas. Tente novamente mais tarde.',
            retryAfter: Math.ceil((req as any).rateLimit.resetTime / 1000)
        })
    }
})

export class AuthController {

    private authService: AuthService

    constructor(authService: AuthService) {
        this.authService = authService
    }

    async registerManager(req: Request, res: Response) {
        const { accessToken, refreshToken, usuario } = await this.authService.registerManager(req.body)

        if (refreshToken) {
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
                maxAge: parseInt(process.env.JWT_REFRESH_EXPIRES_IN || '7') * 24 * 60 * 60 * 1000
            })
        }

        res.status(201).json({ accessToken, usuario })
    }

    async login(req: Request, res: Response) {
        const { accessToken, refreshToken, usuario } = await this.authService.login(req.body)

        if (refreshToken) {
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
                maxAge: parseInt(process.env.JWT_REFRESH_EXPIRES_IN || '7') * 24 * 60 * 60 * 1000
            })
        }

        res.json({ accessToken, usuario })
    }

    async refresh(req: Request, res: Response) {
        const token = req.cookies.refreshToken
        if (!token) {
            return res.status(401).json({ error: 'Token não fornecido.' })
        }

        const { accessToken, refreshToken, usuario } = await this.authService.refresh(token)

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
            maxAge: parseInt(process.env.JWT_REFRESH_EXPIRES_IN || '7') * 24 * 60 * 60 * 1000
        })

        res.json({ accessToken, usuario })
    }

    async logout(req: Request, res: Response) {
        const token = req.cookies.refreshToken
        const { refreshToken } = req.body;

        if (!token) {
            return res.status(204).send()
        }

        await this.authService.logout(refreshToken)

        res.clearCookie('refreshToken')
        res.status(204).send()
    }

    async perfil(req: Request, res: Response) {
        const { id, isAdmin } = (req as any).usuario
        const result = await this.authService.perfil(id, isAdmin === true)
        res.json(result)
    }

    async forgotPassword(req: Request, res: Response) {
        const { email } = req.body
        const result = await this.authService.forgotPassword(email)
        res.json(result)
    }

    async resetPassword(req: Request, res: Response) {
        const { token, email, novaSenha } = req.body
        const result = await this.authService.resetPassword(token, email, novaSenha)
        res.json(result)
    }
}