import express from 'express';
import { comandaController } from '../controller';
import { validateCancelComanda, validateCreateComanda } from '../validator';
import { catchAsync } from '../middleware';
const authenticate = require('../middleware/authenticate');
const tenant = require('../middleware/tenant');
const roleAccessControl = require('../middleware/roleAccessControl');

export const comandaRouter = express.Router();

comandaRouter.get(
  '/commands',
  authenticate,
  roleAccessControl.checkPermission('CAIXA', 'CRIAR_PEDIDO', 'COZINHA'),
  catchAsync((req, res) => comandaController.listComandas(req, res)),
);

comandaRouter.get(
  '/commands/open',
  authenticate,
  roleAccessControl.checkPermission('CAIXA', 'CRIAR_PEDIDO', 'COZINHA'),
  catchAsync((req, res) => comandaController.listComandasByStatus(req, res)),
);

comandaRouter.get(
  '/commands/closed',
  authenticate,
  roleAccessControl.checkPermission('COMANDAS_FINALIZADAS'),
  catchAsync((req, res) => comandaController.listComandasByStatus(req, res)),
);

comandaRouter.post(
  '/commands',
  authenticate,
  roleAccessControl.checkPermission('CAIXA', 'CRIAR_PEDIDO'),
  validateCreateComanda,
  catchAsync((req, res) => comandaController.createComanda(req, res)),
);

comandaRouter.post(
  '/commands/:comandaId/cancel',
  authenticate,
  tenant.verifyTenancy('COMANDA', 'comandaId'),
  roleAccessControl.checkPermission('CAIXA', 'CRIAR_PEDIDO', 'COZINHA'),
  validateCancelComanda,
  catchAsync((req, res) => comandaController.cancelComanda(req, res)),
);

comandaRouter.put(
  '/commands/:comandaId',
  authenticate,
  tenant.verifyTenancy('COMANDA', 'comandaId'),
  roleAccessControl.checkPermission('CAIXA', 'CRIAR_PEDIDO'),
  catchAsync((req, res) => comandaController.updateComandaStatus(req, res)),
);

comandaRouter.post(
  '/commands/:comandaId/checkout',
  authenticate,
  tenant.verifyTenancy('COMANDA', 'comandaId'),
  roleAccessControl.checkPermission('CAIXA'),
  catchAsync((req, res) => comandaController.checkout(req, res)),
);
