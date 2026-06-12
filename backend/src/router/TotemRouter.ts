import express, { Request, Response } from 'express';
import { orderController } from '../controller';
import { catchAsync } from '../middleware';
import { totemAccess } from '../middleware/checkTotemAccess';
// import { MercadoPagoService } from '../service/MercadoPagoService';
import rateLimit from 'express-rate-limit';
import { validateRequest } from '../middleware/validateRequest';
import { createTotemOrderSchema } from '../dto/order/CreateOrderDTO';

// const mpService = new MercadoPagoService();
export const totemRouter = express.Router();

const totemLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  message: { error: 'Muitos pedidos enviados. Aguarde um momento.' }
});

/*
totemRouter.post(
  '/totem/payment',
  totemLimiter,
  totemAccess,
  catchAsync(async (req: Request, res: Response) => {
    const { formData, amount, description } = req.body;

    if (!formData || !amount) {
      return res.status(400).json({ error: 'formData e amount são obrigatórios' });
    }

    const result = await mpService.createTotemPayment(formData, Number(amount), description ?? 'Pedido totem');
    return res.json(result);
  })
);
*/

totemRouter.post(
  '/totem/orders',
  totemLimiter,
  totemAccess,
  validateRequest(createTotemOrderSchema),
  catchAsync((req: Request, res: Response) => orderController.createTotemOrder(req, res))
);
