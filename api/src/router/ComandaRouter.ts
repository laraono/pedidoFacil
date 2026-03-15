import express from 'express'
import { comandaController } from '../controller';

export const comandaRouter = express.Router();

comandaRouter.get('/commands',comandaController.listComandas);

comandaRouter.post('/commands', comandaController.createComanda);