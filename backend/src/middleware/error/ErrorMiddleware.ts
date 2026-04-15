import { Response, NextFunction } from 'express';

export const errorHandler = (err: any, req, res: Response, next: NextFunction) => {

    if (!err.isOperational) {
        console.error("🔥 ERRO FATAL NO BACKEND:", err);
    }
    
    const statusCode = err.statusCode || 500;
    const message = err.isOperational ? err.message : 'Erro interno. Tente novamente mais tarde.';

    res.status(statusCode).json({
        error: message,
    });
};