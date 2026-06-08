import { Request, Response, NextFunction } from 'express';
import { logger } from '../../utils/logger';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    if (!err.isOperational) {
        logger.error('Erro interno não tratado', {
            message: err.message,
            stack: err.stack,
            path: req.path,
            method: req.method,
        });
    }
    
    const statusCode = err.statusCode || 500;
    const message = err.isOperational ? err.message : 'Erro interno. Tente novamente mais tarde.';

    res.status(statusCode).json({
        error: message,
    });
};