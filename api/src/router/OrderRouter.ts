import express from 'express'
import { orderController, OrderController } from '../controller';

export const orderRouter = express.Router();

orderRouter.post('/commands/:commandId/orders', orderController.createOrder);