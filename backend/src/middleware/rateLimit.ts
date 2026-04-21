import rateLimit from 'express-rate-limit';
  
export const createRateLimiter = (minutes: number, maxRequests: number, message: string) => {
  return rateLimit({
    windowMs: minutes * 60 * 1000, 
    max: maxRequests,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
  });
};