import rateLimit from 'express-rate-limit';

const MSG = 'Muitas requisições. Aguarde um momento.';

export const createRateLimiter = (minutes: number, maxRequests: number, message: string) => {
  return rateLimit({
    windowMs: minutes * 60 * 1000,
    max: maxRequests,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

export const publicLimiter = createRateLimiter(1, 100, MSG);
export const authenticatedLimiter = createRateLimiter(1, 600, MSG);
