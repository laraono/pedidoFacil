import express from 'express'
import { orderController, OrderController } from '../controller';
import { validateCreateOrder } from '../validator';
import { catchAsync } from '../middleware';
const authenticate = require('../middleware/authenticate');
const tenant = require('../middleware/tenant');

export const orderRouter = express.Router();

orderRouter.post('/commands/:comandaId/orders', authenticate, tenant.verifyTenancy('COMANDA', 'comandaId'), validateCreateOrder, catchAsync((req, res) => orderController.createOrder(req, res)))

orderRouter.get('/commands/:comandaId/orders', authenticate, tenant.verifyTenancy('COMANDA', 'comandaId'), catchAsync((req, res) => orderController.listOrdersByComanda(req, res)))

orderRouter.put('/commands/:comandaId/orders/:orderId', authenticate, tenant.verifyTenancy('COMANDA', 'comandaId'), tenant.verifyTenancy('PEDIDO', 'orderId'), catchAsync((req, res) => orderController.updateOrderStatus(req, res)))

orderRouter.get('/orders', authenticate, catchAsync((req, res) => orderController.listOrders(req, res)))
