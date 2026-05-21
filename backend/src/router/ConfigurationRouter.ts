import { Router } from 'express';
import { ConfigurationController } from '../controller/ConfigurationController';
import { ConfigurationService } from '../service/ConfigurationService'; 
import authenticate from '../middleware/authenticate';
import { validateUpload } from '../middleware/validateUpload'; 

const configRouter = Router();

const configService = new ConfigurationService();
const configController = new ConfigurationController(configService);

configRouter.get('/estabelecimento/:establishmentId/config', (req, res) => configController.getConfig(req, res));

configRouter.put(
    '/estabelecimento/config', 
    authenticate, 
    validateUpload.single('logo'), 
    (req, res) => configController.updateConfig(req, res)
);

export { configRouter };