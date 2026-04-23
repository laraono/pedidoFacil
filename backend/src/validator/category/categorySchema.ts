import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1).max(20),
  image: z.string().nullable().optional(),
});

export const validateCreateCategory = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validatedData = createCategorySchema.parse(req.body);
    req.body = validatedData;

    next();
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).send(error.message);
    }
    return res.status(500).send('Internal Server Error');
  }
};
