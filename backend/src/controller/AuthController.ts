import { Request, Response } from 'express'
import rateLimit from 'express-rate-limit'
import { AuthService } from '../service'
import { auditLog } from '../utils/logger'
import { calcRefreshMaxAgeMs } from '../utils/refreshExpiry'

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    handler: (req: Request, res: Response) => {
        auditLog('login.exceededlimit', {
            ip: req.ip,
            email: req.body.email,
            timestamp: new Date().toISOString(),
        });

        res.status(429).json({
            error: 'Muitas tentativas. Tente novamente mais tarde.',
            retryAfter: Math.ceil((req as any).rateLimit.resetTime / 1000)
        })
    }
})

export const registrationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    handler: (_req: Request, res: Response) => {
        res.status(429).json({
            error: 'Muitas tentativas de cadastro. Tente novamente mais tarde.',
        })
    }
})

export class AuthController {

    private authService: AuthService

    constructor(authService: AuthService) {
        this.authService = authService
    }

    async checkEmail(req: Request, res: Response) {
        const result = await this.authService.checkEmailAvailable(req.body.email)
        res.json(result)
    }

    async checkCpf(req: Request, res: Response) {
        const result = await this.authService.checkCpfAvailable(req.body.cpf)
        res.json(result)
    }

    async registerComplete(req: Request, res: Response) {
        try {
            const { accessToken, refreshToken, usuario, cargo, estabelecimentoId } =
                await this.authService.registerComplete(req.body)

            if (refreshToken) {
                res.cookie('refreshToken', refreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
                    maxAge: calcRefreshMaxAgeMs()
                })
            }

            auditLog('register.success', {
                ip: req.ip,
                email: req.body.email,
                userId: usuario.id,
                timestamp: new Date().toISOString(),
            })

            res.status(201).json({ accessToken, usuario, cargo, estabelecimentoId })
        } catch (err) {
            auditLog('register.failure', {
                ip: req.ip,
                email: req.body.email,
                timestamp: new Date().toISOString(),
            })
            throw err
        }
    }

async login(req: Request, res: Response) {
    try {
        const { accessToken, refreshToken, usuario } = await this.authService.login(req.body)

        auditLog('login.success', {
            ip: req.ip,
            email: req.body.email,
            userId: usuario.id,
            timestamp: new Date().toISOString(),
        });

        if (refreshToken) {
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
                maxAge: calcRefreshMaxAgeMs()
            })
        }

        res.json({ accessToken, usuario })
    } catch (err) {
        auditLog('login.failure', {
            ip: req.ip,
            email: req.body.email,
            timestamp: new Date().toISOString(),
        });
        throw err;
    }
}


    async refresh(req: Request, res: Response) {
        const token = req.cookies.refreshToken
        auditLog('refresh.attempt', { ip: req.ip, hasToken: !!token, timestamp: new Date().toISOString() })
        if (!token) {
            return res.status(401).json({ error: 'Token não fornecido.' })
        }

        const { accessToken, refreshToken, usuario } = await this.authService.refresh(token)

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
            maxAge: calcRefreshMaxAgeMs()
        })

        res.json({ accessToken, usuario })
    }

    async logout(req: Request, res: Response) {
        const token = req.cookies.refreshToken

        if (!token) {
            return res.status(204).send()
        }

        await this.authService.logout(token)

        res.clearCookie('refreshToken')
        res.status(204).send()
    }

    async perfil(req: Request, res: Response) {
        const { id, isAdmin } = (req as any).usuario

        try {
            const result = await this.authService.perfil(id, isAdmin === true)
            res.json(result)
        } catch (err) {
            auditLog('profile.failure', {
                ip: req.ip,
                isAdmin: isAdmin === true,
                userId: id,
                timestamp: new Date().toISOString(),
            });
            throw err;
        }
    }

    async forgotPassword(req: Request, res: Response) {
        const { email } = req.body
        const result = await this.authService.forgotPassword(email)
        res.json(result)
    }

    async resetPassword(req: Request, res: Response) {
        const { token, novaSenha } = req.body
        const result = await this.authService.resetPassword(token, novaSenha)
        res.json(result)
    }
}