import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { OrderStatus, ServiceType } from '../../enum';
import { establishmentRepository } from '../../repository';

const createOrderchema = z.object({
    
    params: z.object({
        comandaId: z.coerce.number().int().positive()
    }),
    body: z.object({
        status: z.enum(OrderStatus),
        serviceType: z.enum(ServiceType).optional(),
        tripPrice: z.coerce.number().positive().optional(),
        establishmentId: z.coerce.number().int().positive(),
        itens: z.object({
            productId: z.coerce.number().int().positive(),
            quantity: z.coerce.number().int().positive(),
            productVariationId: z.coerce.number().int().positive().optional(),
            observation: z.string().optional().nullable()
        }).array()
    })
    
});

const listOrdersSchema = z.object({
    estblishmentId: z.coerce.number().int().positive()
})

const cancelOrderSchema = z.object({
    params: z.object({
        comandaId: z.coerce.number().int().positive(),
        orderId: z.coerce.number().int().positive()
    }),
    body: z.object({
        cancellationDescription: z.string().min(1).max(100),
        establishmentId: z.coerce.number().int().positive(),
        userId: z.coerce.number().int().positive(),
    })
})

export const validateCreateOrder = 
    (req, res: Response, next: NextFunction) => {
        try {
            const order = {...req.body, establishmentId: req.usuario.estabelecimento}

            const {params, body} = createOrderchema.parse({params: req.params, body: order})

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
            req.body = listOrdersSchema.parse({estblishmentId: req.usuario.estabelecimento})

            next()
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).send(error.message);
            }
            return res.status(500).send("Internal Server Error");
        }
    }
       
export const validateCancelOrders =
    (req, res: Response, next: NextFunction) => {
        try {
            const body = {...req.body, establishmentId: req.usuario.estabelecimento, userId: req.usuario.id}

            const validation = cancelOrderSchema.parse({params: req.params, body})

            req.params = validation.params
            req.body = validation.body

            next()
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).send(error.message);
            }
            return res.status(500).send("Internal Server Error");
        }
    }
