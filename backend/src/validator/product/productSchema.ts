import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ProductStatus } from '../../enum';

export const createProductSchema = z.object({
    product: z.object({
        name: z.string().min(1).max(20),
        description: z.string().optional(), 
        estocavel: z.coerce.boolean(),
        categoryId: z.coerce.number().int().positive(),
        establishmentId: z.coerce.number().int().positive(),
        basePrice: z.coerce.number().positive(),
    }),
    productVariations: z.object({
        name: z.string().min(1).max(20),
        addPrice: z.coerce.number().positive(),
    }).array().optional()
    
});

const updateProductSchema = z.object({
    params: z.object({
        categoryId: z.coerce.number().int().positive(),
        productId: z.coerce.number().int().positive()
    }),
    body: z.object({
        product: z.object({
            name: z.string().min(1).max(20),
            description: z.string().optional(), 
            categoryId: z.coerce.number().int().positive(),
            establishmentId: z.coerce.number().int().positive(),
            basePrice: z.coerce.number().positive(),
        }),
        productVariations: z.object({
            id: z.coerce.number().int().positive().optional(),
            name: z.string().min(1).max(20),
            addPrice: z.coerce.number().positive(),
        }).array().optional()
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
});

const listProductsSchema = z.object({
    establishmentId: z.coerce.number().int().positive()
})

const listProductsByCategorySchema = z.object({
    categoryId: z.coerce.number().int().positive(),
    establishmentId: z.coerce.number().int().positive()
})

const deleteProductSchema = z.object({
    productId: z.coerce.number().int().positive(),
    categoryId: z.coerce.number().int().positive()
})

export const validateCreateProduct = 
    (req, res: Response, next: NextFunction) => {
        try {
            const product = {...req.body.product, establishmentId: req.usuario.estabelecimento}

            req.body = createProductSchema.parse({product, productVariations: req.body.productVariations, image: req.file})

            next()
        }  catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    message: "Erro de validação nos dados do produto",
                    details: error.issues.map(issue => ({
                        path: issue.path.join('.'),
                        message: issue.message
                    }))
                });
            }
            return res.status(500).send("Internal Server Error");
        }
    };

export const validateListProducts = 
    (req, res: Response, next: NextFunction) => {
        try {
            req.body = listProductsSchema.parse({establishmentId: req.usuario.estabelecimento})

            next()
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).send(error.message);
            }
            return res.status(500).send("Internal Server Error");
        }
    };

export const validateListProductsByCategories = 
    (req, res: Response, next: NextFunction) => {
        try {
            const params = {categoryId: req.params.categoryId, establishmentId: req.usuario.estabelecimento }
            req.body = listProductsByCategorySchema.parse(params);
            next();
            next()
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    message: "Erro de validação nos dados do produto",
                    details: error.issues.map(issue => ({
                        path: issue.path.join('.'),
                        message: issue.message
                    }))
                });
            }
            return res.status(500).send("Internal Server Error");
        }
    };

export const validateDeleteProduct = 
    (req, res: Response, next: NextFunction) => {
        try {
            req.params = deleteProductSchema.parse(req.params)

            next()
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).send(error.message);
            }
            return res.status(500).send("Internal Server Error");
        }
    }
