import { Router } from 'express';
import { ConfigurationController } from '../controller/ConfigurationController';
import { ConfigurationService } from '../service/ConfigurationService'; 
import authenticate from '../middleware/authenticate';

const configRouter = Router();

const configService = new ConfigurationService();
const configController = new ConfigurationController(configService);

configRouter.get('/estabelecimento/:establishmentId/config', authenticate, (req, res) => configController.getConfig(req, res));

configRouter.put('/estabelecimento/config', authenticate, (req, res) => configController.updateConfig(req, res));

export { configRouter };