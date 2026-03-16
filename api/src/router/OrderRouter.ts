import express from 'express'
import { orderController, OrderController } from '../controller';
import { validateCreateOrder } from '../validator';

export const orderRouter = express.Router();

orderRouter.post('/commands/:comandaId/orders', validateCreateOrder, (req, res) => orderController.createOrder(req, res))

orderRouter.get('/commands/:comandaId/orders', (req, res) => orderController.listOrdersByComanda(req, res))

orderRouter.put('/commands/:comandaId/orders/:orderId', (req, res) => orderController.updateOrderStatus(req, res))

orderRouter.get('/orders', (req, res) => orderController.listOrders(req, res))
