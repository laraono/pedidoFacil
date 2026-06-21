import express, { Request, Response } from 'express';
import { comandaController } from '../controller';
import { catchAsync, subscriptionMiddleware } from '../middleware';
import { authenticate } from '../middleware/authenticate';
import { verifyComandaTenancy } from '../middleware/tenant';
import { checkPermission } from '../middleware/roleAccessControl';
import { Permission } from '../enum';
import { validateRequest } from '../middleware/validateRequest'; 
import { createComandaSchema } from '../dto/comanda/CreateComandaDTO'; 
import { cancelComandaSchema } from '../dto/comanda/CancelComandaDTO';

export const comandaRouter = express.Router();

comandaRouter.get(
  '/commands',
  authenticate,
  subscriptionMiddleware,
  checkPermission(Permission.CAIXA, Permission.CRIAR_PEDIDO, Permission.COZINHA),
  catchAsync((req: Request, res: Response) => comandaController.listComandas(req, res)),
);

comandaRouter.get(
  '/commands/open',
  authenticate,
  subscriptionMiddleware,
  checkPermission(Permission.CAIXA, Permission.CRIAR_PEDIDO, Permission.COZINHA),
  catchAsync((req: Request, res: Response) => comandaController.listComandasByStatus(req, res)),
);

comandaRouter.get(
  '/commands/closed',
  authenticate,
  subscriptionMiddleware,
  checkPermission(Permission.COMANDAS_FINALIZADAS),
  catchAsync((req: Request, res: Response) => comandaController.listComandasHistory(req, res)),
);

comandaRouter.post(
  '/commands',
  authenticate,
  subscriptionMiddleware,
  checkPermission(Permission.CAIXA, Permission.CRIAR_PEDIDO),
  validateRequest(createComandaSchema), 
  catchAsync((req: Request, res: Response) => comandaController.createComanda(req, res)),
);

comandaRouter.post(
  '/commands/:comandaId/cancel',
  authenticate,
  subscriptionMiddleware,
  verifyComandaTenancy('comandaId'),
  checkPermission(Permission.CAIXA, Permission.CRIAR_PEDIDO, Permission.COZINHA),
  validateRequest(cancelComandaSchema), 
  catchAsync((req: Request, res: Response) => comandaController.cancelComanda(req, res)),
);

comandaRouter.put(
  '/commands/:comandaId',
  authenticate,
  subscriptionMiddleware,
  verifyComandaTenancy('comandaId'),
  checkPermission(Permission.CAIXA, Permission.CRIAR_PEDIDO),
  catchAsync((req: Request, res: Response) => comandaController.updateComandaStatus(req, res)),
);

comandaRouter.post(
  '/commands/:comandaId/payment',
  authenticate,
  subscriptionMiddleware,
  verifyComandaTenancy('comandaId'),
  checkPermission(Permission.CAIXA),
  catchAsync((req: Request, res: Response) => comandaController.processPayment(req, res)),
);