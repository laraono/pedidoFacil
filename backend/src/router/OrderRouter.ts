import express, { Request, Response } from 'express';
import { orderController } from '../controller';
import { validateCancelOrders, validateCreateOrder, validateListOrders } from '../validator';
import { validateCreateTotemOrder, validateUpdateOrderStatus } from '../validator/order';
import { catchAsync, subscriptionMiddleware } from '../middleware';
import { totemAccess } from '../middleware/checkTotemAccess';
import { MercadoPagoService } from '../service/MercadoPagoService';
import rateLimit from 'express-rate-limit';
import { authenticate } from '../middleware/authenticate';
import { verifyTenancy } from '../middleware/tenant';
import { checkPermission } from '../middleware/roleAccessControl';

const mpService = new MercadoPagoService();

export const orderRouter = express.Router();

const totemLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  message: { error: "Muitos pedidos enviados. Aguarde um momento." }
});

orderRouter.post(
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

orderRouter.post(
  '/totem/orders',
  totemLimiter,
  totemAccess,
  validateCreateTotemOrder,
  catchAsync((req: Request, res: Response) => orderController.createTotemOrder(req, res))
);

orderRouter.post(
  '/commands/:comandaId/orders',
  authenticate,
  subscriptionMiddleware,
  verifyTenancy('COMANDA', 'comandaId'),
  checkPermission('CAIXA', 'CRIAR_PEDIDO', 'COZINHA'),
  validateCreateOrder,
  catchAsync((req: Request, res: Response) => orderController.createOrder(req, res))
);

orderRouter.get(
  '/commands/:comandaId/orders',
  authenticate,
  subscriptionMiddleware,
  verifyTenancy('COMANDA', 'comandaId'),
  checkPermission('CAIXA'),
  catchAsync((req: Request, res: Response) => orderController.listOrdersByComanda(req, res))
);

orderRouter.put(
  '/commands/:comandaId/orders/:orderId',
  authenticate,
  subscriptionMiddleware,
  verifyTenancy('COMANDA', 'comandaId'),
  verifyTenancy('PEDIDO', 'orderId'),
  checkPermission('COZINHA'),
  validateUpdateOrderStatus,
  catchAsync((req: Request, res: Response) => orderController.updateOrderStatus(req, res))
);

orderRouter.post(
  '/commands/:comandaId/orders/:orderId/cancel',
  authenticate,
  subscriptionMiddleware,
  verifyTenancy('COMANDA', 'comandaId'),
  verifyTenancy('PEDIDO', 'orderId'),
  validateCancelOrders,
  checkPermission('COZINHA'),
  catchAsync((req: Request, res: Response) => orderController.cancelOrder(req, res))
);

orderRouter.get(
  '/orders',
  authenticate,
  subscriptionMiddleware,
  checkPermission('COZINHA'),
  validateListOrders,
  catchAsync((req: Request, res: Response) => orderController.listOrders(req, res))
);
