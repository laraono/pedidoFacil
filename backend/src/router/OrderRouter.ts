import express, { Request, Response } from 'express';
import { orderController } from '../controller';
import { createOrderSchema, updateOrderStatusSchema } from '../validator'; 
import { validateRequest } from '../middleware/validateRequest'; 
import { catchAsync } from '../middleware';

const authenticate = require('../middleware/authenticate');
const tenant = require('../middleware/tenant');
const roleAccessControl = require('../middleware/roleAccessControl');

export const orderRouter = express.Router();

orderRouter.post(
  '/commands/:comandaId/orders',
  authenticate,
  tenant.verifyTenancy('COMANDA', 'comandaId'),
  roleAccessControl.checkPermission('CAIXA', 'CRIAR_PEDIDO', 'COZINHA'),
  validateRequest(createOrderSchema), 
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
  validateRequest(updateOrderStatusSchema), 
  catchAsync((req: Request, res: Response) => orderController.updateOrderStatus(req, res))
);

orderRouter.get(
  '/orders',
  authenticate,
  roleAccessControl.checkPermission('COZINHA'),
  catchAsync((req: Request, res: Response) => orderController.listOrders(req, res))
);