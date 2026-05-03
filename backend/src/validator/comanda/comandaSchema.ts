import { z } from 'zod';
import express, { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ComandaStatus } from '../../enum';

const createComandaSchema = z.object({
    description: z.string().min(1).max(100),
    status: z.string().min(1).max(20), 
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

const listComandasSchema = z.object({
    establishmentId: z.coerce.number().int().positive()
})

const listComandasByStatusSchema = z.object({
    establishmentId: z.coerce.number().int().positive(),
    status: z.enum(ComandaStatus)
})

const getComandaSchema = z.object({
    comandaId: z.coerce.number().int().positive()
})

export const validateCreateComanda = 
    (req, res: Response, next: NextFunction) => {
        try {
            const comanda = {...req.body, establishmentId: req.usuario.estabelecimento}
            req.body = createComandaSchema.parse(comanda)

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

            req.params = validation.params as any;
            req.params = validation.params as any;
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
            req.body = listComandasSchema.parse({establishmentId: req.usuario.estabelecimento})

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
            req.body = listComandasByStatusSchema.parse({...req.body, ...req.usuario})

            next()
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).send(error.message);
            }
            return res.status(500).send("Internal Server Error");
        }
    };

export const validateGetComanda = 
    (req, res: Response, next: NextFunction) => {
        try {
            req.params = getComandaSchema.parse(req.params)

            next()
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).send(error.message);
            }
            return res.status(500).send("Internal Server Error");
        }
    };