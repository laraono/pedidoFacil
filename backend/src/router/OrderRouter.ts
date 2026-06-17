import express, { Request, Response } from 'express';
import { orderController } from '../controller';
import { catchAsync, subscriptionMiddleware } from '../middleware';
import { authenticate } from '../middleware/authenticate';
import { verifyComandaTenancy } from '../middleware/tenant';
import { checkPermission } from '../middleware/roleAccessControl';
import { Permission } from '../enum';
import { validateRequest } from '../middleware/validateRequest';
import { createOrderSchema } from '../dto/order/CreateOrderDTO';
import { cancelOrderSchema } from '../dto/order/CancelOrderDTO';
import { updateOrderStatusSchema } from '../dto/order/UpdateOrderStatusDTO';

export const orderRouter = express.Router();

orderRouter.post(
  '/commands/:comandaId/orders',
  authenticate,
  subscriptionMiddleware,
  verifyComandaTenancy('comandaId'),
  checkPermission(Permission.CAIXA, Permission.CRIAR_PEDIDO, Permission.COZINHA),
  validateRequest(createOrderSchema), 
  catchAsync((req: Request, res: Response) => orderController.createOrder(req, res))
);

orderRouter.get(
  '/commands/:comandaId/orders',
  authenticate,
  subscriptionMiddleware,
  verifyComandaTenancy('comandaId'),
  checkPermission(Permission.CAIXA),
  catchAsync((req: Request, res: Response) => orderController.listOrdersByComanda(req, res))
);

orderRouter.put(
  '/commands/:comandaId/orders/:orderId',
  authenticate,
  subscriptionMiddleware,
  verifyComandaTenancy('comandaId'),
  checkPermission(Permission.COZINHA),
  validateRequest(updateOrderStatusSchema),
  catchAsync((req: Request, res: Response) => orderController.updateOrderStatus(req, res))
);

orderRouter.post(
  '/commands/:comandaId/orders/:orderId/cancel',
  authenticate,
  subscriptionMiddleware,
  verifyComandaTenancy('comandaId'),
  validateRequest(cancelOrderSchema),
  checkPermission(Permission.COZINHA),
  catchAsync((req: Request, res: Response) => orderController.cancelOrder(req, res))
);

orderRouter.get(
  '/orders',
  authenticate,
  subscriptionMiddleware,
  checkPermission(Permission.COZINHA), 
  catchAsync((req: Request, res: Response) => orderController.listOrders(req, res))
);