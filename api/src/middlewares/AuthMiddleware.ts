import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express'
import dotenv from 'dotenv';

export class AuthMiddleware {

    authenticateToken(req: Request, res: Response, next: NextFunction) {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Token missing' });
        }

        const secret = process.env.JWT_SECRET;

        if(!secret) {
            return res.status(401).json({ message: 'Token missing' })
        }

        jwt.verify(token, secret, (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: 'Invalid or expired token' });
            }
            next();
        });
    }

}
