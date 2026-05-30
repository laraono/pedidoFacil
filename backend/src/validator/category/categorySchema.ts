import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { CategoryStatus } from '../../enum';
import { AppError } from '../../middleware';

const createCategorySchema = z.object({
    name: z.string().min(1).max(20),
    establishmentId: z.coerce.number().int().positive()
});

const listCategoriesSchema = z.object({
    establishmentId: z.coerce.number().int().positive()
})

const updateCategorySchema = z.object({
    categoryId: z.coerce.number().int().positive(),
    body: z.object({
        name: z.string().min(1).max(20),
        status: z.enum(CategoryStatus)
    })
})

const deleteCategorySchema = z.object({
    categoryId: z.coerce.number().int().positive()
})

export const validateCreateCategory = 
    (req, res: Response, next: NextFunction) => {
        try {
            if(!req.usuario) {
                throw new AppError('unauthorized', 401)
            }

            const body = createCategorySchema.parse({
                name: req.body.name, 
                establishmentId: req.usuario.estabelecimento
            })

            req.body = body
            next()
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).send(error.message);
            }
            return res.status(500).send("Internal Server Error");
        }
    };

export const validateListCategories = 
    (req, res: Response, next: NextFunction) => {
        try {
            if(!req.usuario) {
                throw new AppError('unauthorized', 401)
            }

            const establishmentId = listCategoriesSchema.parse({establishmentId: req.usuario.estabelecimento})

            req.body = establishmentId
            
            next()
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).send(error.message);
            }
            return res.status(500).send("Internal Server Error");
        }
    };

export const validateUpdateCategory = 
    (req, res: Response, next: NextFunction) => {
        try {
            const validation = updateCategorySchema.parse({categoryId: req.params.categoryId, body: req.body})

            req.body = validation.body
            req.params = validation.categoryId
            
            next()
            
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).send(error.message);
            }
            return res.status(500).send("Internal Server Error");
        }
    };

 export const validateDeleteCategory = 
    (req, res: Response, next: NextFunction) => {
        try {
            req.params = deleteCategorySchema.parse(req.params)
            
            next()
            
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).send(error.message);
            }
            return res.status(500).send("Internal Server Error");
        }
    };
