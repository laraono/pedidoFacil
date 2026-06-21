import { Response } from 'express';

export function sendError(
    res: Response,
    error: any,
    fallbackMessage = 'Erro interno. Tente novamente mais tarde.'
) {
    const statusCode = error?.statusCode || 500;
    const message = error?.isOperational ? error.message : fallbackMessage;
    return res.status(statusCode).json({ error: message });
}
