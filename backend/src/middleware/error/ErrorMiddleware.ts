import { Response, NextFunction } from 'express';

export const errorHandler = (err: any, req, res: Response, next: NextFunction) => {

    if (!err.isOperational) {
        console.error("🔥 ERRO FATAL NO BACKEND:", err);
    }
    
    const statusCode = err.statusCode || 500;
    const message = err.isOperational ? err.message : 'Erro interno. Tente novamente mais tarde.';

<<<<<<< HEAD
=======
    if (!err.isOperational) {
        console.error('[ERROR]', err);
    }

>>>>>>> feature-104
    res.status(statusCode).json({
        error: message,
    });
};