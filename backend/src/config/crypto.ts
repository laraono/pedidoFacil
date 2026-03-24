import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { User } from '../database'
import { RefreshTokenRepository } from '../repository/RefreshTokenRepository'

export function hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex')
}

export async function gerarTokens(usuario: User, refreshTokenRepository: RefreshTokenRepository) {
    const accessToken = jwt.sign(
        { id: usuario.id, estabelecimento: usuario.establishment.id, cargo: usuario.role.id },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    )

    const refreshToken = crypto.randomBytes(64).toString('hex')
    const hash = hashToken(refreshToken)

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + parseInt(process.env.JWT_REFRESH_EXPIRES_IN!))

    await refreshTokenRepository.createToken(usuario, hash, expiresAt)

    return { accessToken, refreshToken }
}
