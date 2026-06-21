import { z } from 'zod';
import { OrderStatus } from '../../enum';
import { safeString } from '../../utils/safeZod';

const orderStatusValues = Object.values(OrderStatus) as [string, ...string[]];

const createOrderBaseSchema = z.object({
  body: z.object({
    status: z.enum(orderStatusValues),
    serviceType: z.string().optional(),
    establishmentId: z.number().int().positive().optional(), 
    comandaId: z.coerce.number().int().positive(), 
    itens: z.array(
      z.object({
        productId: z.number().int().positive(),
        quantity: z.number().int().positive(),
        productVariationId: z.number().int().positive().optional().nullable(),
        observation: safeString(0, 255).optional().nullable()
      }).strict()
    ).min(1, "O pedido deve ter pelo menos um item")
  }).strict()
});

export const createOrderSchema = z.preprocess((reqObj: any) => {
  if (reqObj?.params?.comandaId) {
    reqObj.body = {
      ...reqObj?.body,
      comandaId: reqObj.params.comandaId
    };
  }
  return reqObj;
}, createOrderBaseSchema);

export type CreateOrderDTO = z.infer<typeof createOrderBaseSchema>['body'];
export type CreateOrder = CreateOrderDTO;
export type ItensArray = CreateOrderDTO['itens'];

export type OrderParams = {
    status: OrderStatus;
    serviceType?: string;
    comanda: { id: number };
    establishment: { id: number };
    isDelivered: boolean;
};

export type ProductOrderParams = {
    orderId: number;
    productId: number;
    quantity: number;
    price: number;
    observation?: string;
    order?: { id: number };
    product?: { id: number };
};
;
export const createTotemOrderSchema = z.object({
  body: z.object({
    itens: z.array(
      z.object({
        productId: z.number().int().positive(),
        quantity: z.number().int().positive(),
        productVariationId: z.number().int().positive().optional().nullable(),
        observation: safeString(0, 255).optional().nullable()
      }).strict()
    ).min(1, "O pedido deve ter pelo menos um item"),
    
    description: safeString(0, 100).optional().nullable(),

  }).strict()
});

export type CreateTotemOrderDTO = z.infer<typeof createTotemOrderSchema>['body'];