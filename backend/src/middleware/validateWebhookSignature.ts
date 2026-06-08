import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { auditLog } from '../utils/logger';

export function validateWebhookSignature(req: Request, res: Response, next: NextFunction) {
    const signature = req.headers['x-signature'] as string;
    const requestId = req.headers['x-request-id'] as string;
    const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;

    if (process.env.NODE_ENV === 'development') {
        return next();
    }

    if (!secret) {
        auditLog('webhook.invalid_signature', {
            ip: req.ip,
            reason: 'webhook secret not configured',
            requestId,
        });
        return res.sendStatus(200);
    }

    if (!signature) {
        auditLog('webhook.invalid_signature', {
            ip: req.ip,
            reason: 'missing x-signature header',
            requestId,
        });
        return res.sendStatus(200);
    }

    const tsMatch = signature.match(/ts=(\d+)/);
    const v1Match = signature.match(/v1=([a-f0-9]+)/);

    if (!tsMatch || !v1Match) {
        auditLog('webhook.invalid_signature', {
            ip: req.ip,
            reason: 'malformed x-signature header',
            requestId,
        });
        return res.sendStatus(200);
    }

    const ts = tsMatch[1];
    const receivedHmac = v1Match[1];
    const paymentId = req.body?.data?.id;

    const signedPayload = `id:${paymentId};request-id:${requestId};ts:${ts};`;
    const expectedHmac = crypto
        .createHmac('sha256', secret)
        .update(signedPayload)
        .digest('hex');

    if (!crypto.timingSafeEqual(Buffer.from(receivedHmac), Buffer.from(expectedHmac))) {
        auditLog('webhook.invalid_signature', {
            ip: req.ip,
            reason: 'hmac mismatch',
            requestId,
            paymentId,
        });
        return res.sendStatus(200);
    }

    auditLog('webhook.valid_signature', {
        ip: req.ip,
        requestId,
        paymentId,
    });
    
    next();
}
