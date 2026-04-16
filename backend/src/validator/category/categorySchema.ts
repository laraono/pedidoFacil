import { z } from 'zod';
import express, { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { CategoryStatus } from '../../enum';

const fileSizeLimit = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_MIME_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

const createCategorySchema = z.object({
    name: z.string().min(1).max(20),
    establishmentId: z.coerce.number().int().positive(),
    image: z
        .object({
            mimetype: z.string().refine((type) => ACCEPTED_IMAGE_MIME_TYPES.includes(type), {
                message: "Tipo de imagem inválido",
            }),
            size: z.number().max(fileSizeLimit, {
                message: "Tamanho do arquivo não deve exceder 5MB",
            }),
            buffer: z.instanceof(Buffer), // Ensure it has the actual data
        })
        .optional(),
});

const listCategoriesSchema = z.object({
    establishmentId: z.coerce.number().int().positive()
})

const updateCategorySchema = z.object({
    categoryId: z.coerce.number().int().positive(),
    body: z.object({
        name: z.string().min(1).max(20),
        status: z.enum(CategoryStatus)
    }),
    image: z
        .object({
            mimetype: z.string().refine((type) => ACCEPTED_IMAGE_MIME_TYPES.includes(type), {
                message: "Tipo de imagem inválido",
            }),
            size: z.number().max(fileSizeLimit, {
                message: "Tamanho do arquivo não deve exceder 5MB",
            }),
            buffer: z.instanceof(Buffer), // Ensure it has the actual data
        })
        .optional(),
})

const deleteCategorySchema = z.object({
    categoryId: z.coerce.number().int().positive()
})

export const validateCreateCategory = 
    (req, res: Response, next: NextFunction) => {
        try {
            const file = req.file ? req.file : undefined

            const {image, ...body} = createCategorySchema.parse({
                name: req.body.name, 
                image: file,
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
            const image = req.file ? req.file : undefined

            const validation = updateCategorySchema.parse({categoryId: req.params.categoryId, body: req.body, image})

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
