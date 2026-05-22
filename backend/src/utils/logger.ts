import { createLogger, format, transports } from 'winston';

const SENSITIVE_KEYS = ['password', 'senha', 'token', 'refreshToken', 'accessToken', 'cpf'];

function sanitize(obj: any): any {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(sanitize);

    return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => {
            if (SENSITIVE_KEYS.includes(key)) return [key, '[REDACTED]'];
            if (key === 'cpf' || (typeof value === 'string' && /^\d{11}$/.test(value))) return [key, '[REDACTED]'];
            return [key, sanitize(value)];
        })
    );
}

const sanitizeFormat = format((info) => {
    if (info.meta) info.meta = sanitize(info.meta);
    return info;
});

export const logger = createLogger({
    level: 'info',
    format: format.combine(
        sanitizeFormat(),
        format.timestamp(),
        format.json()
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: 'logs/error.log', level: 'error' }),
        new transports.File({ filename: 'logs/combined.log' }),
    ]

});

export function auditLog(action: string, meta: Record<string, unknown>) {
    logger.info(action, { meta: sanitize(meta) });
}
