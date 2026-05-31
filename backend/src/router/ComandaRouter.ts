import express, { Request, Response } from 'express';
import { comandaController } from '../controller';
import { catchAsync, subscriptionMiddleware } from '../middleware';
import { authenticate } from '../middleware/authenticate';
import { verifyTenancy } from '../middleware/tenant';
import { checkPermission } from '../middleware/roleAccessControl';
import { validateRequest } from '../middleware/validateRequest'; 
import { createComandaSchema } from '../dto/comanda/CreateComandaDTO'; 
import { cancelComandaSchema } from '../dto/comanda/CancelComandaDTO';

export const comandaRouter = express.Router();

comandaRouter.get(
  '/commands',
  authenticate,
  subscriptionMiddleware,
  checkPermission('CAIXA', 'CRIAR_PEDIDO', 'COZINHA'),
  catchAsync((req: Request, res: Response) => comandaController.listComandas(req, res)),
);

comandaRouter.get(
  '/commands/open',
  authenticate,
  subscriptionMiddleware,
  checkPermission('CAIXA', 'CRIAR_PEDIDO', 'COZINHA'),
  catchAsync((req: Request, res: Response) => comandaController.listComandasByStatus(req, res)),
);

comandaRouter.get(
  '/commands/closed',
  authenticate,
  subscriptionMiddleware,
  checkPermission('COMANDAS_FINALIZADAS'),
  catchAsync((req: Request, res: Response) => comandaController.listComandasByStatus(req, res)),
);

comandaRouter.post(
  '/commands',
  authenticate,
  subscriptionMiddleware,
  checkPermission('CAIXA', 'CRIAR_PEDIDO'),
  validateRequest(createComandaSchema), 
  catchAsync((req: Request, res: Response) => comandaController.createComanda(req, res)),
);

comandaRouter.post(
  '/commands/:comandaId/cancel',
  authenticate,
  subscriptionMiddleware,
  verifyTenancy('COMANDA', 'comandaId'),
  checkPermission('CAIXA', 'CRIAR_PEDIDO', 'COZINHA'),
  validateRequest(cancelComandaSchema), 
  catchAsync((req: Request, res: Response) => comandaController.cancelComanda(req, res)),
);

comandaRouter.put(
  '/commands/:comandaId',
  authenticate,
  subscriptionMiddleware,
  verifyTenancy('COMANDA', 'comandaId'),
  checkPermission('CAIXA', 'CRIAR_PEDIDO'),
  catchAsync((req: Request, res: Response) => comandaController.updateComandaStatus(req, res)),
);

comandaRouter.post(
  '/commands/:comandaId/checkout',
  authenticate,
  subscriptionMiddleware,
  verifyTenancy('COMANDA', 'comandaId'),
  checkPermission('CAIXA'),
  catchAsync((req: Request, res: Response) => comandaController.checkout(req, res)),
);