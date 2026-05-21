import { z, ZodError } from 'zod';
import { Response, NextFunction } from 'express';

const createSubscriptionchema = z.object({
    
    params: z.object({
        planId: z.coerce.number().int().positive(),
        establishmentId: z.coerce.number().int().positive()
    }),
    data: z.object({
        type: z.string().min(1),
        total_amount: z.coerce.number().positive(),
        external_reference: z.string().min(1),
        processing_mode: z.string().min(1),
        transactions: z.object({
            payments: z.array(
                z.object({
                    amount: z.coerce.number().positive(),
                    payment_method: z.object({
                        id: z.string().min(1),
                        type: z.string().min(1),
                        installments: z.coerce.number().int().positive(),
                        token: z.string().min(1)
                    })
                })
            )
        }),
        payer: z.object({
            email: z.email(),
            identification: z.object({
                type: z.string().min(1),
                number: z.string().min(8)
            })
        })
    })
    
});

const listSubscriptionsSchema = z.object({
    establishmentId: z.coerce.number().int().positive()
})

const cancelSubscriptionSchema = z.object({
    params: z.object({
        comandaId: z.coerce.number().int().positive(),
        subscriptionId: z.coerce.number().int().positive()
    }),
    body: z.object({
        cancellationDescription: z.string().min(1).max(100),
        establishmentId: z.coerce.number().int().positive(),
        userId: z.coerce.number().int().positive(),
    })
})

const restoreSubscriptoinSchema = z.object({
    params: z.object({
        subscriptionId: z.coerce.number().int().positive(),
        establishmentId: z.coerce.number().int().positive()
    }),
    data: z.object({
        payments: z.array(
            z.object({
                amount: z.coerce.number().positive(),
                payment_method: z.object({
                    id: z.string().min(1),
                    type: z.string().min(1),
                    installments: z.coerce.number().int().positive(),
                    token: z.string().min(1)
                })
            })
        )
    })
    
});
    
export const validateCreateSubscription = 
    (req, res: Response, next: NextFunction) => {
        try {
            const {params, data} = createSubscriptionchema.parse({
                data: req.body.data, 
                params: {
                    planId: req.body.planId, 
                    establishmentId: req.usuario.estabelecimento
                }
            })

            req.params = params
            req.body = data

            next()
        } catch (error) {
                        console.log(error)

            if (error instanceof ZodError) {
                return res.status(400).send(error.message);
            }
            return res.status(500).send("Internal Server Error");
        }
    };

export const validateRestoreSubscription = 
    (req, res: Response, next: NextFunction) => {
        try {
            const {params, data} = restoreSubscriptoinSchema.parse({
                data: req.body.data.transaction.payments, 
                params: {
                    subscriptionId: req.params.subscriptionId, 
                    establishmentId: req.usuario.estabelecimento
                }
            })

            req.params = params
            req.body = data

            next()
        } catch (error) {
                        console.log(error)

            if (error instanceof ZodError) {
                return res.status(400).send(error.message);
            }
            return res.status(500).send("Internal Server Error");
        }
    };

export const validateListSubscriptions = 
    (req, res: Response, next: NextFunction) => {
        try {
            req.body = listSubscriptionsSchema.parse({establishmentId: req.usuario.estabelecimento})

            next()
        } catch (error) {
            console.log(error)
            if (error instanceof ZodError) {
                return res.status(400).send(error.message);
            }
            return res.status(500).send("Internal Server Error");
        }
    }
       
export const validateCancelSubscriptions =
    (req, res: Response, next: NextFunction) => {
        try {
            const body = {...req.body, establishmentId: req.usuario.estabelecimento, userId: req.usuario.id}

            const validation = cancelSubscriptionSchema.parse({params: req.params, body})

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
