import express, { Request, Response } from 'express';
import { orderController } from '../controller';
<<<<<<< HEAD
import { createOrderSchema, updateOrderStatusSchema } from '../validator'; 
import { validateRequest } from '../middleware/validateRequest'; 
import { catchAsync } from '../middleware';

=======
import { validateCreateOrder } from '../validator';
import { catchAsync } from '../middleware';
>>>>>>> feature-104
const authenticate = require('../middleware/authenticate');
const tenant = require('../middleware/tenant');
const roleAccessControl = require('../middleware/roleAccessControl');

export const orderRouter = express.Router();

orderRouter.post(
  '/commands/:comandaId/orders',
  authenticate,
  tenant.verifyTenancy('COMANDA', 'comandaId'),
  roleAccessControl.checkPermission('CAIXA', 'CRIAR_PEDIDO', 'COZINHA'),
<<<<<<< HEAD
  validateRequest(createOrderSchema), 
=======
  validateCreateOrder,
>>>>>>> feature-104
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
<<<<<<< HEAD
  validateRequest(updateOrderStatusSchema), 
=======
>>>>>>> feature-104
  catchAsync((req: Request, res: Response) => orderController.updateOrderStatus(req, res))
);

orderRouter.get(
  '/orders',
  authenticate,
  roleAccessControl.checkPermission('COZINHA'),
  catchAsync((req: Request, res: Response) => orderController.listOrders(req, res))
<<<<<<< HEAD
);
=======
);
>>>>>>> feature-104
