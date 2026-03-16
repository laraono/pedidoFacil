import express from 'express'
import { orderController, OrderController } from '../controller';
import { validateCreateOrder } from '../validator';

export const orderRouter = express.Router();

orderRouter.post('/commands/:comandaId/orders', validateCreateOrder, (req, res) => orderController.createOrder(req, res));