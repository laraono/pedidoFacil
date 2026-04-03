import { z } from 'zod';
import express, { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

const createCategorySchema = z.object({
    name: z.string().min(1).max(20),
    establishmentId: z.coerce.number().int().positive()
});

const listCategoriesSchema = z.object({
    establishmentId: z.coerce.number().int().positive()
})

const updateCategorySchema = z.object({
    categoryId: z.coerce.number().int().positive(),
    name: z.string().min(1).max(20)
})

const deleteCategorySchema = z.object({
    categoryId: z.coerce.number().int().positive()
})

export const validateCreateCategory = 
    (req, res: Response, next: NextFunction) => {
        try {
            const name = createCategorySchema.parse({...req.body, establishmentId: req.usuario.estabelecimento})

            req.body = name

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
            const validation = updateCategorySchema.parse({categoryId: req.params.categoryId, name: req.body.name})

            req.body = validation.name
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
