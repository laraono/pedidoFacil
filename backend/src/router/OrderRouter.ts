import express, { Request, Response } from 'express';
import { orderController } from '../controller';
import { validateCreateOrder, validateCreateTotemOrder, validateUpdateOrderStatus } from '../validator/order';
import { catchAsync } from '../middleware';
import { totemAccess } from '../middleware/checkTotemAccess';
import rateLimit from 'express-rate-limit';

const authenticate = require('../middleware/authenticate');
const tenant = require('../middleware/tenant');
const roleAccessControl = require('../middleware/roleAccessControl');

export const orderRouter = express.Router();

const totemLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 10, 
  message: { error: "Muitos pedidos enviados. Aguarde um momento." }
});

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
  tenant.verifyTenancy('COMANDA', 'comandaId'),
  roleAccessControl.checkPermission('CAIXA', 'CRIAR_PEDIDO', 'COZINHA'),
  validateCreateOrder,
  catchAsync((req: Request, res: Response) => orderController.createOrder(req, res))
);

orderRouter.get(
  '/commands/:comandaId/orders',
  authenticate,
  tenant.verifyTenancy('COMANDA', 'comandaId'),
  roleAccessControl.checkPermission('CAIXA'),
  catchAsync((req: Request, res: Response) => orderController.listOrdersByComanda(req, res))
);

orderRouter.put(
  '/commands/:comandaId/orders/:orderId',
  authenticate,
  tenant.verifyTenancy('COMANDA', 'comandaId'),
  tenant.verifyTenancy('PEDIDO', 'orderId'),
  roleAccessControl.checkPermission('COZINHA'),
  validateUpdateOrderStatus,
  catchAsync((req: Request, res: Response) => orderController.updateOrderStatus(req, res))
);

orderRouter.get(
  '/orders',
  authenticate,
  roleAccessControl.checkPermission('COZINHA'),
  catchAsync((req: Request, res: Response) => orderController.listOrders(req, res))
);