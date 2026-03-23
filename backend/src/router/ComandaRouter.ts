import express from 'express'
import { comandaController } from '../controller';
import { validateCancelComanda, validateCreateComanda } from '../validator';
import { catchAsync } from '../middleware';
const authenticate = require('../middleware/authenticate');
const tenant = require('../middleware/tenant');


export const comandaRouter = express.Router();

comandaRouter.get('/commands', authenticate, catchAsync((req, res) => comandaController.listComandas(req, res)))

comandaRouter.get('/commands/open', authenticate, catchAsync((req, res) => comandaController.listComandasByStatus(req, res)))

comandaRouter.get('/commands/closed', authenticate, catchAsync((req, res) => comandaController.listComandasByStatus(req, res)))

comandaRouter.post('/commands', authenticate, validateCreateComanda, catchAsync((req, res) => comandaController.createComanda(req, res)))

comandaRouter.post('/commands/:comandaId/cancel', authenticate, tenant.verifyTenancy('COMANDA', 'comandaId'), validateCancelComanda, catchAsync((req, res) => comandaController.cancelComanda(req, res)))

comandaRouter.put('/commands/:comandaId', authenticate, tenant.verifyTenancy('COMANDA', 'comandaId'), catchAsync((req, res) => comandaController.updateComandaStatus(req, res)))
