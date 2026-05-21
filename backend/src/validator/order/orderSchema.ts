import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { OrderStatus, ServiceType } from '../../enum';
import { safeString } from '../../utils/safeZod'; 

const orderStatusValues = Object.values(OrderStatus) as [string, ...string[]];
const serviceTypeValues = Object.values(ServiceType) as [string, ...string[]];

export const createOrderSchema = z.object({
  params: z.object({
    comandaId: z.coerce.number().int().positive()
  }),
  body: z.object({
    status: z.enum(orderStatusValues),
    serviceType: z.enum(serviceTypeValues),
    tripPrice: z.coerce.number().positive().optional(),
    itens: z.array(
      z.object({
        productId: z.coerce.number().int().positive(),
        quantity: z.coerce.number().int().positive(),
        productVariationId: z.coerce.number().int().positive().optional(),
        observation: safeString(0, 255).optional().nullable()
      }).strict()
    )
  }).strict() 
});

export const updateOrderStatusSchema = z.object({
  params: z.object({
    comandaId: z.coerce.number().int().positive(),
    orderId: z.coerce.number().int().positive()
  }),
  body: z.object({
    status: z.enum(orderStatusValues)
  }).strict()
});

export const validateCreateOrder = (req: Request, res: Response, next: NextFunction) => {
  const result = createOrderSchema.safeParse({
    params: req.params,
    body: req.body
  });

  if (!result.success) {
    const formattedErrors = result.error.flatten();
    
    return res.status(400).json({
      message: "Dados inválidos no pedido",
      errors: formattedErrors.fieldErrors
    });
  }

  req.params = result.data.params as any;
  req.body = result.data.body;

  next();
};

export const validateUpdateOrderStatus = (req: Request, res: Response, next: NextFunction) => {
  const result = updateOrderStatusSchema.safeParse({
    params: req.params,
    body: req.body
  });

  if (!result.success) {
    const formattedErrors = result.error.flatten();
    
    return res.status(400).json({
      message: "Dados inválidos na atualização do status",
      errors: formattedErrors.fieldErrors
    });
  }

  req.params = result.data.params as any;
  req.body = result.data.body;

  next();
};