import { Request, Response } from 'express'
import rateLimit from 'express-rate-limit'
import { AuthService } from '../service'

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

    async register(req: Request, res: Response) {
        const result = await this.authService.register(req.body)
        res.status(201).json(result)
    }

    async login(req: Request, res: Response) {
        const { accessToken, refreshToken, usuario } = await this.authService.login(req.body)

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: parseInt(process.env.JWT_REFRESH_EXPIRES_IN!) * 24 * 60 * 60 * 1000
        })

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
            secure: true,
            sameSite: 'strict',
            maxAge: parseInt(process.env.JWT_REFRESH_EXPIRES_IN!) * 24 * 60 * 60 * 1000
        })

        res.json({ accessToken, usuario })
    }

    async logout(req: Request, res: Response) {
        const token = req.cookies.refreshToken
        if (!token) {
            return res.status(401).json({ error: 'Token não fornecido.' })
        }

        await this.authService.logout(token)

        res.clearCookie('refreshToken')
        res.status(204).send()
    }

    async perfil(req: Request, res: Response) {
        const result = await this.authService.perfil((req as any).usuario.id)
        res.json(result)
    }
}
