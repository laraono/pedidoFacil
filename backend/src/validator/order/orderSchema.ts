import { z } from 'zod';
import express, { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { OrderStatus, ServiceType } from '../../enum';

const createOrderchema = z.object({
    
    params: z.object({
        comandaId: z.coerce.number().int().positive()
    }),
    body: z.object({
        status: z.enum(OrderStatus),
        serviceType: z.enum(ServiceType),
        tripPrice: z.coerce.number().positive().optional(),
        establishmentId: z.coerce.number().int().positive(),
        itens: z.object({
            productId: z.coerce.number().int().positive(),
            quantity: z.coerce.number().int().positive(),
            productVariationId: z.coerce.number().int().positive().optional(),
            observation: z.string().optional()
        }).array()
    })
    
});

const listOrdersSchema = z.object({
    estblishmentId: z.coerce.number().int().positive()
})

export const validateCreateOrder = 
    (req, res: Response, next: NextFunction) => {
        try {
            const {params, body} = createOrderchema.parse({params: req.params, body: {...req.body, ...req.usuario}})

            req.params = params
            req.body = body

            next()
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).send(error.message);
            }
            return res.status(500).send("Internal Server Error");
        }
    };

export const validateListOrders = 
    (req, res: Response, next: NextFunction) => {
        try {
            req.query = listOrdersSchema.parse(req.usuario)

            next()
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).send(error.message);
            }
            return res.status(500).send("Internal Server Error");
        }
    }
       

