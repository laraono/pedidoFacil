import express from 'express'
import { comandaController } from '../controller';

export const comandaRouter = express.Router();

comandaRouter.get('/commands',);

comandaRouter.post('/commands', comandaController.createComanda);