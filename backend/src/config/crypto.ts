import jwt from 'jsonwebtoken';
import { User } from '../database';
import { Admin } from '../database/entity/Admin';

export async function gerarTokens(usuario: User) {
    const payload = { 
        id: usuario.id, 
        estabelecimento: usuario.establishment?.id || null, 
        cargo: usuario.role?.id || null 
    };

    // Access Token curto (ex: 15m)
    const accessToken = jwt.sign(
        payload,
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );

    // Refresh Token longo (Stateless)
    const refreshToken = jwt.sign(
        { id: usuario.id, isRefresh: true },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );

    return { accessToken, refreshToken };
}

export async function gerarTokenAdmin(admin: Admin) {
    const accessToken = jwt.sign(
        { id: admin.id, isAdmin: true },
        process.env.JWT_SECRET!,
        { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
        { id: admin.id, isAdmin: true, isRefresh: true },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
}