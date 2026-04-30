import { z } from 'zod';
<<<<<<< HEAD
import { OrderStatus, ServiceType } from '../../enum';
import { safeString } from '../../utils/safeZod'; 
=======
import { Request, Response, NextFunction } from 'express';
import { OrderStatus, ServiceType } from '../../enum';
>>>>>>> feature-104

const orderStatusValues = Object.values(OrderStatus) as [string, ...string[]];
const serviceTypeValues = Object.values(ServiceType) as [string, ...string[]];

export const createOrderSchema = z.object({
  params: z.object({
    comandaId: z.coerce.number().int().positive()
  }),
  body: z.object({
    status: z.enum(orderStatusValues),
    serviceType: z.enum(serviceTypeValues),
<<<<<<< HEAD
    tripPrice: z.coerce.number().positive().optional(),
    
=======
    
    tripPrice: z.coerce.number().positive().optional(),
>>>>>>> feature-104
    itens: z.array(
      z.object({
        productId: z.coerce.number().int().positive(),
        quantity: z.coerce.number().int().positive(),
        productVariationId: z.coerce.number().int().positive().optional(),
<<<<<<< HEAD
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
=======
        observation: z.string().optional().nullable()
      })
    )
  })
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
>>>>>>> feature-104
