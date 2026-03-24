import express from 'express'
import { comandaController } from '../controller';
import { validateCancelComanda, validateCreateComanda } from '../validator';
import { catchAsync } from '../middleware';

export const comandaRouter = express.Router();

comandaRouter.get('/commands', catchAsync((req, res) => comandaController.listComandas(req, res)))

comandaRouter.get('/commands/open', catchAsync((req, res) => comandaController.listComandasByStatus(req, res)))

comandaRouter.get('/commands/closed', catchAsync((req, res) => comandaController.listComandasByStatus(req, res)))

comandaRouter.post('/commands', validateCreateComanda, catchAsync((req, res) => comandaController.createComanda(req, res)))

comandaRouter.post('/commands/:comandaId/cancel', validateCancelComanda, catchAsync((req, res) => comandaController.cancelComanda(req, res)))

comandaRouter.put('/commands/:comandaId', catchAsync((req, res) => comandaController.updateComandaStatus(req, res)))
