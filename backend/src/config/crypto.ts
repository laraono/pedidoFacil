import jwt from 'jsonwebtoken';
import crypto from 'crypto'; 
import { User } from '../database/entity/User'; 
import { Admin } from '../database/entity/Admin';


export const hashToken = (token: string): string => {
    return crypto.createHash('sha256').update(token).digest('hex');
};

export async function gerarTokens(usuario: User) {
    const payload = { 
        id: usuario.id, 
        estabelecimento: usuario.establishment?.id || null, 
        cargo: usuario.role?.id || null 
    };

    const accessToken = jwt.sign(
        payload,
        process.env.JWT_SECRET as string,
        { 
            expiresIn: (process.env.JWT_EXPIRES_IN || '1h') as any
        }
    );

    const refreshToken = jwt.sign(
        { id: usuario.id, isRefresh: true },
        process.env.JWT_SECRET as string,
        { 
            expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as any 
        }
    );

    return { accessToken, refreshToken };
}

export async function gerarTokenAdmin(admin: Admin) {
    const accessToken = jwt.sign(
        { id: admin.id, isAdmin: true },
        process.env.JWT_SECRET as string,
        {
            expiresIn: (process.env.JWT_EXPIRES_IN || '1h') as any
        }
    );

    const refreshToken = jwt.sign(
        { id: admin.id, isAdmin: true, isRefresh: true },
        process.env.JWT_SECRET as string,
        { 
            expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '1h') as any
        }
    );

    return { accessToken, refreshToken };
}