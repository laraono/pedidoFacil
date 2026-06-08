import { Router } from 'express';
import { ConfigurationController } from '../controller/ConfigurationController';
import { ConfigurationService } from '../service/ConfigurationService';
import { authenticate } from '../middleware/authenticate';
import { checkPermission } from '../middleware/roleAccessControl';
import { subscriptionMiddleware } from '../middleware';
import { validateUpload } from '../middleware/validateUpload';

const configRouter = Router();

const configService = new ConfigurationService();
const configController = new ConfigurationController(configService);

configRouter.get(
  '/estabelecimento/:establishmentId/config',
  authenticate,
  subscriptionMiddleware,
  checkPermission('CONFIGURACAO'),
  (req, res) => configController.getConfig(req, res)
);

configRouter.put(
  '/estabelecimento/config',
  authenticate,
  subscriptionMiddleware,
  checkPermission('CONFIGURACAO'),
  validateUpload.single('logo'),
  (req, res) => configController.updateConfig(req, res)
);

export { configRouter };
