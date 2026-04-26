import { z, ZodError } from 'zod';
import { Response, NextFunction } from 'express';
import { SubscriptionStatus, ServiceType } from '../../enum';
import { PaymentService } from '../../service';

const createSubscriptionchema = z.object({
    
    params: z.object({
        planId: z.coerce.number().int().positive(),
        establishmentId: z.coerce.number().int().positive()
    }),
    data: z.object({
        preapproval_plan_id: z.string().optional(),
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
                        tyinstallmentspe: z.coerce.number().int().positive(),
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
    estblishmentId: z.coerce.number().int().positive()
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

export const validateCreateSubscription = 
    (req, res: Response, next: NextFunction) => {
        try {
            console.log(req.body)
            const {params, data} = createSubscriptionchema.parse({data: req.body.data, params: {planId: req.body.planId, establishmentId: req}})

            req.params = params
            req.body = data

            next()
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).send(error.message);
            }
            console.log(error)
            return res.status(500).send("Internal Server Error");
        }
    };

export const validateListSubscriptions = 
    (req, res: Response, next: NextFunction) => {
        try {
            req.body = listSubscriptionsSchema.parse({estblishmentId: req.usuario.estabelecimento})

            next()
        } catch (error) {
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
