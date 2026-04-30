import express, { Request, Response } from 'express';
import { comandaController } from '../controller';
<<<<<<< HEAD
import { catchAsync } from '../middleware';

import { validateRequest } from '../middleware/validateRequest';
import { createComandaSchema } from '../dto/comanda/CreateComandaDTO'; 
import { cancelComandaSchema } from '../dto/comanda/CancelComandaDTO'; 


=======
import { validateCancelComanda, validateCreateComanda } from '../validator';
import { catchAsync } from '../middleware';
>>>>>>> feature-104
const authenticate = require('../middleware/authenticate');
const tenant = require('../middleware/tenant');
const roleAccessControl = require('../middleware/roleAccessControl');

export const comandaRouter = express.Router();

comandaRouter.get(
  '/commands',
  authenticate,
  roleAccessControl.checkPermission('CAIXA', 'CRIAR_PEDIDO', 'COZINHA'),
  catchAsync((req: Request, res: Response) => comandaController.listComandas(req, res)),
);

comandaRouter.get(
  '/commands/open',
  authenticate,
  roleAccessControl.checkPermission('CAIXA', 'CRIAR_PEDIDO', 'COZINHA'),
  catchAsync((req: Request, res: Response) => comandaController.listComandasByStatus(req, res)),
);

comandaRouter.get(
  '/commands/closed',
  authenticate,
  roleAccessControl.checkPermission('COMANDAS_FINALIZADAS'),
  catchAsync((req: Request, res: Response) => comandaController.listComandasByStatus(req, res)),
);

comandaRouter.post(
  '/commands',
  authenticate,
  roleAccessControl.checkPermission('CAIXA', 'CRIAR_PEDIDO'),
<<<<<<< HEAD
  validateRequest(createComandaSchema), 
=======
  validateCreateComanda,
>>>>>>> feature-104
  catchAsync((req: Request, res: Response) => comandaController.createComanda(req, res)),
);

comandaRouter.post(
  '/commands/:comandaId/cancel',
  authenticate,
  tenant.verifyTenancy('COMANDA', 'comandaId'),
  roleAccessControl.checkPermission('CAIXA', 'CRIAR_PEDIDO', 'COZINHA'),
<<<<<<< HEAD
  validateRequest(cancelComandaSchema), 
=======
  validateCancelComanda,
>>>>>>> feature-104
  catchAsync((req: Request, res: Response) => comandaController.cancelComanda(req, res)),
);

comandaRouter.put(
  '/commands/:comandaId',
  authenticate,
  tenant.verifyTenancy('COMANDA', 'comandaId'),
  roleAccessControl.checkPermission('CAIXA', 'CRIAR_PEDIDO'),
  catchAsync((req: Request, res: Response) => comandaController.updateComandaStatus(req, res)),
);

comandaRouter.post(
  '/commands/:comandaId/checkout',
  authenticate,
  tenant.verifyTenancy('COMANDA', 'comandaId'),
  roleAccessControl.checkPermission('CAIXA'),
  catchAsync((req: Request, res: Response) => comandaController.checkout(req, res)),
<<<<<<< HEAD
);
=======
);
>>>>>>> feature-104
