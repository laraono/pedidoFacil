import { Request, Response, NextFunction } from 'express';
import { authenticate } from './authenticate';
import { totemAccess } from './checkTotemAccess';

export function authenticateOrTotem(req: Request, res: Response, next: NextFunction) {
  if (req.headers['x-totem-code']) return totemAccess(req, res, next);
  return authenticate(req, res, next);
}
