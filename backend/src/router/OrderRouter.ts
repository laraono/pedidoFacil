import express from 'express'
import { orderController, OrderController } from '../controller';
import { validateCancelOrders, validateCreateOrder, validateListOrders } from '../validator';
import { catchAsync } from '../middleware';
const authenticate = require('../middleware/authenticate');
const tenant = require('../middleware/tenant');
const roleAccessControl = require('../middleware/roleAccessControl');

export const orderRouter = express.Router();

orderRouter.post('/commands/:comandaId/orders', authenticate, tenant.verifyTenancy('COMANDA', 'comandaId'),  roleAccessControl.checkPermission('CAIXA', 'CRIAR_PEDIDO', 'COZINHA'), validateCreateOrder, catchAsync((req, res) => orderController.createOrder(req, res)))

orderRouter.get('/commands/:comandaId/orders', authenticate, tenant.verifyTenancy('COMANDA', 'comandaId'),  roleAccessControl.checkPermission('CAIXA'), catchAsync((req, res) => orderController.listOrdersByComanda(req, res)))

orderRouter.put('/commands/:comandaId/orders/:orderId', authenticate, tenant.verifyTenancy('COMANDA', 'comandaId'), tenant.verifyTenancy('PEDIDO', 'orderId'), roleAccessControl.checkPermission('COZINHA'), catchAsync((req, res) => orderController.updateOrderStatus(req, res)))

orderRouter.post('/commands/:comandaId/orders/:orderId/cancel', authenticate, tenant.verifyTenancy('COMANDA', 'comandaId'), tenant.verifyTenancy('PEDIDO', 'orderId'), validateCancelOrders, roleAccessControl.checkPermission('COZINHA'), catchAsync((req, res) => orderController.cancelOrder(req, res)))

orderRouter.get('/orders', authenticate, roleAccessControl.checkPermission('COZINHA'), validateListOrders, catchAsync((req, res) => orderController.listOrders(req, res)))
