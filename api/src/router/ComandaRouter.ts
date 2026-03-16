import express from 'express'
import { comandaController } from '../controller';
import { validateCreateComanda } from '../validator';

export const comandaRouter = express.Router();

comandaRouter.get('/commands', (req, res) => comandaController.listComandas(req, res))

comandaRouter.post('/commands', validateCreateComanda, (req, res) => comandaController.createComanda(req, res))

comandaRouter.put('/commands/comandaId', (req, res) => comandaController.updateComandaStatus(req, res))
