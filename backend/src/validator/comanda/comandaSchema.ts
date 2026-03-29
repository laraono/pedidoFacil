import { z } from 'zod';
import express, { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ComandaStatus } from '../../enum';

const createComandaSchema = z.object({
    description: z.string().min(1).max(100),
    status: z.string().min(1).max(20), 
    total: z.coerce.number().int(),
    establishmentId: z.coerce.number().int().positive(),
    discountValue: z.coerce.number().positive().optional()
    
});

const cancelComandaSchema = z.object({
    params: z.object({
        comandaId: z.coerce.number().int().positive()
    }),
    body: z.object({
        reason: z.string().min(1),
        userId: z.coerce.number().int().positive(),
        establishmentId: z.coerce.number().int().positive()
    })
})

const listComandas = z.object({
    establishmentId: z.coerce.number().int().positive()
})

const listComandasByStatus = z.object({
    establishmentId: z.coerce.number().int().positive(),
    status: z.enum(ComandaStatus)
})

export const validateCreateComanda = 
    (req, res: Response, next: NextFunction) => {
        try {
            req.body = createComandaSchema.parse({...req.body, establishmentId: req.usuario.establecimento})

            next();
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).send(error.message);
            }
            return res.status(500).send("Internal Server Error");
        }
    };

export const validateCancelComanda = 
    (req, res: Response, next: NextFunction) => {
        try {
            const validation =  cancelComandaSchema.parse({ params: req.params, body: {...req.body, ...req.usuario} })

            req.params = validation.params
            req.body = validation.body

            next();
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).send(error.message);
            }
            return res.status(500).send("Internal Server Error");
        }
    };

export const validateListComandas = 
    (req, res: Response, next: NextFunction) => {
        try {
            req.query = listComandas.parse(req.usuario)

            next()
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).send(error.message);
            }
            return res.status(500).send("Internal Server Error");
        }
    };

export const validateListComandasByStatus = 
    (req, res: Response, next: NextFunction) => {
        try {
            req.query = listComandasByStatus.parse({...req.query, ...req.usuario})

            next()
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).send(error.message);
            }
            return res.status(500).send("Internal Server Error");
        }
    };
