import express from 'express'
import { orderController, OrderController } from '../controller';
import { validateCreateOrder } from '../validator';
import { catchAsync } from '../middleware';

export const orderRouter = express.Router();

orderRouter.post('/commands/:comandaId/orders', validateCreateOrder, catchAsync((req, res) => orderController.createOrder(req, res)))

orderRouter.get('/commands/:comandaId/orders', catchAsync((req, res) => orderController.listOrdersByComanda(req, res)))

orderRouter.put('/commands/:comandaId/orders/:orderId', catchAsync((req, res) => orderController.updateOrderStatus(req, res)))

orderRouter.get('/orders', catchAsync((req, res) => orderController.listOrders(req, res)))
