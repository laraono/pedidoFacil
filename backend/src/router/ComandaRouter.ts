import express, {Request, Response} from 'express'
import { comandaController } from '../controller';
import { validateCancelComanda, validateCreateComanda, validateListComandas, validateListComandasByStatus } from '../validator';
import { catchAsync } from '../middleware';
const authenticate = require('../middleware/authenticate');
const tenant = require('../middleware/tenant');
const roleAccessControl = require('../middleware/roleAccessControl');


export const comandaRouter = express.Router();

comandaRouter.get('/commands', authenticate,  roleAccessControl.checkPermission('CAIXA', 'CRIAR_PEDIDO', 'COZINHA'), validateListComandas, catchAsync((req: Request, res: Response) => comandaController.listComandas(req, res)))

comandaRouter.get('/commands/open', authenticate,  roleAccessControl.checkPermission('CAIXA', 'CRIAR_PEDIDO', 'COZINHA'), validateListComandas, catchAsync((req: Request, res: Response) => comandaController.listOpenComandas(req, res)))

comandaRouter.get('/commands/closed', authenticate, roleAccessControl.checkPermission('COMANDAS_FINALIZADAS'), validateListComandas, catchAsync((req: Request, res: Response) => comandaController.listClosedComandas(req, res)))

comandaRouter.post('/commands', authenticate, roleAccessControl.checkPermission('CAIXA', 'CRIAR_PEDIDO'), validateCreateComanda, catchAsync((req: Request, res: Response) => comandaController.createComanda(req, res)))

comandaRouter.post('/commands/:comandaId/cancel', authenticate, tenant.verifyTenancy('COMANDA', 'comandaId'), roleAccessControl.checkPermission('CAIXA', 'CRIAR_PEDIDO', 'COZINHA'), validateCancelComanda, catchAsync((req: Request, res: Response) => comandaController.cancelComanda(req, res)))

comandaRouter.put('/commands/:comandaId', authenticate, tenant.verifyTenancy('COMANDA', 'comandaId'),  roleAccessControl.checkPermission('CAIXA', 'CRIAR_PEDIDO'), catchAsync((req: Request, res: Response) => comandaController.updateComandaStatus(req, res)))

comandaRouter.get('/commands/:comandaId', authenticate, roleAccessControl.checkPermission('CAIXA', 'CRIAR_PEDIDO', 'COZINHA'), validateCreateComanda, catchAsync((req: Request, res: Response) => comandaController.getComanda(req, res)))
