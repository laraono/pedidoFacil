import express from 'express'
import { orderController } from '../controller';
import { validateCreateOrder } from '../validator';
import { catchAsync } from '../middleware';
const authenticate = require('../middleware/authenticate');
const tenant = require('../middleware/tenant');
const roleAccessControl = require('../middleware/roleAccessControl');

export const orderRouter = express.Router();

const logStep = (step: string) => (req: any, res: any, next: any) => {
    console.log(`===> [ROUTER CHECK] Passo: ${step}`);
    next();
};

orderRouter.post(
    '/commands/:comandaId/orders', 
    logStep('1. Entrada na Rota'),
    authenticate, 
    logStep('2. Autenticado com Sucesso'),
    tenant.verifyTenancy('COMANDA', 'comandaId'),  
    logStep('3. Tenancy Verificado (Estabelecimento OK)'),
    roleAccessControl.checkPermission('CAIXA', 'CRIAR_PEDIDO', 'COZINHA'), 
    logStep('4. Permissões de Cargo OK'),
    validateCreateOrder, 
    logStep('5. Validação de Dados OK - Entrando no Controller'),
    catchAsync((req, res) => orderController.createOrder(req, res))
);

orderRouter.get('/commands/:comandaId/orders', authenticate, tenant.verifyTenancy('COMANDA', 'comandaId'),  roleAccessControl.checkPermission('CAIXA'), catchAsync((req, res) => orderController.listOrdersByComanda(req, res)))
orderRouter.put('/commands/:comandaId/orders/:orderId', authenticate, tenant.verifyTenancy('COMANDA', 'comandaId'), tenant.verifyTenancy('PEDIDO', 'orderId'), roleAccessControl.checkPermission('COZINHA'), catchAsync((req, res) => orderController.updateOrderStatus(req, res)))
orderRouter.get('/orders', authenticate, roleAccessControl.checkPermission('COZINHA'), catchAsync((req, res) => orderController.listOrders(req, res)))