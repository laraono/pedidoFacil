import express from 'express'
import { comandaController } from '../controller';
import { validateCreateComanda } from '../validator';

export const comandaRouter = express.Router();

comandaRouter.get('/commands',comandaController.listComandas);

comandaRouter.post('/commands', validateCreateComanda, (req, res) => comandaController.createComanda(req, res));